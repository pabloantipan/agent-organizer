import { Code2 } from "lucide-react";
import { api } from "../hooks/useWails";
import { oneLine, underRoot, type UnreadFile } from "../lib/unread";

/** The files an initiative's scan could not read, each with its path under
 *  the root and the reason, the same lines `organizer doctor` prints. A
 *  local file opens in the editor, where it is fixed; the app writes none. */
export function UnreadFiles({ files, root, local, id }: { files: UnreadFile[]; root: string; local: boolean; id?: string }) {
  return (
    <ul id={id} className="unread-files">
      {files.map((f) => (
        <li key={f.path} title={f.path}>
          <span className="mono unread-path">{underRoot(f.path, root)}</span>
          <span className="unread-why">{f.reasons.map(oneLine).join("; ")}</span>
          {local && (
            <button className="linkish" aria-label={`Open ${underRoot(f.path, root)} in editor`} onClick={() => api.openInEditor(f.path)}>
              <Code2 size={12} aria-hidden /> Open in editor
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
