import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api, type Config } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";

export function Settings() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [path, setPath] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const refresh = useBoard((s) => s.refresh);

  useEffect(() => {
    api.getConfig().then(setCfg);
    api.configPath().then(setPath);
  }, []);
  if (!cfg) return <div className="empty">Loading…</div>;

  const set = <K extends keyof Config>(k: K, v: Config[K]) => setCfg({ ...cfg, [k]: v } as Config);
  const lines = (v: string[] | undefined) => (v ?? []).join("\n");
  const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  const save = async () => {
    setMsg(null);
    try {
      await api.saveConfig(cfg);
      setMsg(`saved to ${path}`);
      await refresh();
    } catch (e) {
      setMsg(String(e));
    }
  };

  return (
    <div className="settings">
      <label>
        machine name (key prefix in Datastore; must differ per machine)
        <input value={cfg.machine} onChange={(e) => set("machine", e.target.value)} />
      </label>
      <label>
        roots, one per line (~ allowed). Initiatives are found up to max depth below each.
        <textarea rows={5} value={lines(cfg.roots)} onChange={(e) => set("roots", fromLines(e.target.value))} />
      </label>
      <label>
        max depth
        <input type="number" min={1} max={6} value={cfg.max_depth} onChange={(e) => set("max_depth", Number(e.target.value))} />
      </label>
      <label>
        ignored directory names, one per line
        <textarea rows={4} value={lines(cfg.ignore_dirs)} onChange={(e) => set("ignore_dirs", fromLines(e.target.value))} />
      </label>
      <label>
        GCP project (empty disables sync). Auth is Application Default Credentials.
        <input value={cfg.gcp_project} onChange={(e) => set("gcp_project", e.target.value)} placeholder="pablo-organizer" />
      </label>
      <label>
        Datastore namespace
        <input value={cfg.namespace} onChange={(e) => set("namespace", e.target.value)} />
      </label>
      <label>
        sync interval (minutes, 0 disables auto-sync)
        <input type="number" min={0} value={cfg.sync_interval_minutes} onChange={(e) => set("sync_interval_minutes", Number(e.target.value))} />
      </label>
      <label>
        agent command for "Review with agent" (runs in a terminal at the initiative root)
        <input value={cfg.agent} onChange={(e) => set("agent", e.target.value)} placeholder="claude" />
      </label>
      <label>
        editor command
        <input value={cfg.editor} onChange={(e) => set("editor", e.target.value)} />
      </label>
      <div className="row">
        <button className="primary" onClick={save}><Save size={14} /> Save</button>
        {msg && <span className="meta">{msg}</span>}
      </div>
      <div className="hint mono">{path}</div>
      <div className="hint mono">log: ~/.local/share/organizer/organizer.log</div>
    </div>
  );
}
