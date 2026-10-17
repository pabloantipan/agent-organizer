// tsgraph reads a tree's TypeScript with the compiler API and prints its
// graph as JSON: the top-level definitions of each .ts/.tsx file and, for
// each, the definitions its body references (review-map v1, FR-7). The Go
// side (ts.go) runs it as `node - <typescript dir> <root>` with
// this text on stdin; typescript comes from the reviewed repo's own
// node_modules, never from this program. Nothing here reads the network or
// writes a file.
"use strict";
const fs = require("fs");
const path = require("path");
const [tsDir, root] = process.argv.slice(2);
const ts = require(tsDir);

// every .ts/.tsx of the tree goes into the program, generated bindings and
// .d.ts included so references resolve to them (and then name no node).
const abs = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) abs.push(p);
  }
})(root);
const program = ts.createProgram(abs, {
  noLib: true, types: [], noEmit: true, allowJs: false, skipLibCheck: true,
  jsx: ts.JsxEmit.Preserve, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true,
  resolveJsonModule: false, noResolve: false,
});
const checker = program.getTypeChecker();

const isTestFile = (r) => /\.test\.tsx?$/.test(r);
// own is a file whose definitions are nodes: not a .d.ts, not generated
// bindings (wailsjs), not a dependency.
const own = (r) => /\.tsx?$/.test(r) && !r.endsWith(".d.ts") && !r.split("/").includes("wailsjs") && !r.split("/").includes("node_modules");

const defs = [];
const byFile = new Map(); // rel -> [{def, pos, end}]
const testCall = /^(describe|it|test)$/;

function startOf(sf, node) {
  // the definition starts at its doc: the leading comments directly above
  // it, with no blank line between, as a Go doc comment.
  const text = sf.text;
  const ranges = ts.getLeadingCommentRanges(text, node.pos) || [];
  let start = node.getStart(sf);
  for (let i = ranges.length - 1; i >= 0; i--) {
    const between = text.slice(ranges[i].end, start);
    if ((between.match(/\n/g) || []).length > 1) break;
    start = ranges[i].pos;
  }
  return start;
}

const line = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

function bindingNames(name, out) {
  if (ts.isIdentifier(name)) out.push(name.text);
  else for (const el of name.elements) if (!ts.isOmittedExpression(el)) bindingNames(el.name, out);
  return out;
}

function testName(stmt) {
  if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) return null;
  const c = stmt.expression;
  let callee = c.expression;
  while (ts.isPropertyAccessExpression(callee)) callee = callee.expression; // describe.skip, it.each
  if (ts.isCallExpression(callee)) callee = callee.expression; // describe.each(...)("name")
  while (ts.isPropertyAccessExpression(callee)) callee = callee.expression;
  if (!ts.isIdentifier(callee) || !testCall.test(callee.text)) return null;
  const a = c.arguments[0];
  if (a && (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a))) return a.text;
  return null;
}

for (const sf of program.getSourceFiles()) {
  const r = path.relative(root, sf.fileName).split(path.sep).join("/");
  if (r.startsWith("..") || !own(r)) continue;
  const test = isTestFile(r);
  const dir = path.posix.dirname(r);
  const pkg = "ts:" + dir;
  const list = [];
  const add = (name, kind, stmt, extra) => {
    const pos = startOf(sf, stmt);
    const d = Object.assign({
      id: "ts:" + r + "#" + name, pkg, kind: test ? "test" : kind, file: r,
      start: line(sf, pos), end: line(sf, stmt.getEnd()), test_file: test, test_func: false,
    }, extra || {});
    defs.push(d);
    list.push({ def: d, pos, end: stmt.getEnd(), stmt });
  };
  const tsx = r.endsWith(".tsx");
  const fnKind = (name) => (tsx && /^[A-Z]/.test(name) ? "component" : "function");
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st)) {
      const name = st.name ? st.name.text : "default";
      add(name, fnKind(name), st);
    } else if (ts.isClassDeclaration(st)) {
      add(st.name ? st.name.text : "default", "class", st);
    } else if (ts.isVariableStatement(st)) {
      const kind = st.declarationList.flags & ts.NodeFlags.Const ? "const" : "var";
      for (const d of st.declarationList.declarations) {
        for (const n of bindingNames(d.name, [])) {
          const init = d.initializer;
          const fn = init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init));
          add(n, fn && tsx && /^[A-Z]/.test(n) ? "component" : kind, st);
        }
      }
    } else if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) {
      add(st.name.text, "type", st);
    } else if (ts.isExportAssignment(st)) {
      add("default", "const", st);
    } else if (test) {
      const n = testName(st);
      if (n !== null) add(n, "test", st, { test_func: true, test_name: n });
    }
  }
  byFile.set(r, list);
}

// at is the definition whose statement holds a position of a file.
function at(fileName, pos) {
  const r = path.relative(root, fileName).split(path.sep).join("/");
  for (const e of byFile.get(r) || []) if (e.pos <= pos && pos < e.end) return e.def;
  return null;
}

const uses = {};
const problems = [];
for (const sf of program.getSourceFiles()) {
  const r = path.relative(root, sf.fileName).split(path.sep).join("/");
  const list = byFile.get(r);
  if (!list) continue;
  for (const e of list) {
    const visit = (n) => {
      if (ts.isIdentifier(n)) {
        let sym;
        try {
          sym = ts.isShorthandPropertyAssignment(n.parent) && n.parent.name === n
            ? checker.getShorthandAssignmentValueSymbol(n.parent)
            : checker.getSymbolAtLocation(n);
          if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
        } catch (err) { sym = undefined; }
        for (const decl of (sym && sym.declarations) || []) {
          const to = at(decl.getSourceFile().fileName, decl.getStart());
          if (!to || to.id === e.def.id) continue;
          (uses[e.def.id] = uses[e.def.id] || {})[to.id] = true;
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(e.stmt);
  }
}

process.stdout.write(JSON.stringify({ version: ts.version, defs, uses: Object.fromEntries(Object.entries(uses).map(([k, v]) => [k, Object.keys(v)])), problems }));
