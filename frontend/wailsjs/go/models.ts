export namespace auth {
	
	export class Account {
	    signed_in: boolean;
	    email: string;
	    uid: string;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.signed_in = source["signed_in"];
	        this.email = source["email"];
	        this.uid = source["uid"];
	    }
	}

}

export namespace config {
	
	export class Config {
	    machine: string;
	    roots: string[];
	    max_depth: number;
	    ignore_dirs: string[];
	    gcp_project: string;
	    firebase_api_key: string;
	    firestore_database: string;
	    sync_interval_minutes: number;
	    editor: string;
	    git_timeout_seconds: number;
	    agent: string;
	    probe_state_dir: string;
	    zellij: string;
	    agent_binary: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.machine = source["machine"];
	        this.roots = source["roots"];
	        this.max_depth = source["max_depth"];
	        this.ignore_dirs = source["ignore_dirs"];
	        this.gcp_project = source["gcp_project"];
	        this.firebase_api_key = source["firebase_api_key"];
	        this.firestore_database = source["firestore_database"];
	        this.sync_interval_minutes = source["sync_interval_minutes"];
	        this.editor = source["editor"];
	        this.git_timeout_seconds = source["git_timeout_seconds"];
	        this.agent = source["agent"];
	        this.probe_state_dir = source["probe_state_dir"];
	        this.zellij = source["zellij"];
	        this.agent_binary = source["agent_binary"];
	    }
	}

}

export namespace main {
	
	export class BoardView {
	    board: merge.Board;
	    // Go type: time
	    pulled_at: any;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new BoardView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.board = this.convertValues(source["board"], merge.Board);
	        this.pulled_at = this.convertValues(source["pulled_at"], null);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace merge {
	
	export class BoardInitiative {
	    id: string;
	    title: string;
	    client: string;
	    status: string;
	    started: string;
	    created_on: string;
	    repos: string[];
	    ports_to: string;
	    notes: string[];
	    target: string;
	    milestones: model.Milestone[];
	    path: string;
	    machine: string;
	    local: boolean;
	    // Go type: time
	    scanned_at: any;
	    // Go type: time
	    last_updated: any;
	    now: number;
	    blocked: number;
	    next: number;
	    done: number;
	    repos_state: model.RepoState[];
	    problems: model.Problem[];
	    agents: model.Agent[];
	    live: number;
	    working: number;
	    also_on: string[];
	
	    static createFrom(source: any = {}) {
	        return new BoardInitiative(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.client = source["client"];
	        this.status = source["status"];
	        this.started = source["started"];
	        this.created_on = source["created_on"];
	        this.repos = source["repos"];
	        this.ports_to = source["ports_to"];
	        this.notes = source["notes"];
	        this.target = source["target"];
	        this.milestones = this.convertValues(source["milestones"], model.Milestone);
	        this.path = source["path"];
	        this.machine = source["machine"];
	        this.local = source["local"];
	        this.scanned_at = this.convertValues(source["scanned_at"], null);
	        this.last_updated = this.convertValues(source["last_updated"], null);
	        this.now = source["now"];
	        this.blocked = source["blocked"];
	        this.next = source["next"];
	        this.done = source["done"];
	        this.repos_state = this.convertValues(source["repos_state"], model.RepoState);
	        this.problems = this.convertValues(source["problems"], model.Problem);
	        this.agents = this.convertValues(source["agents"], model.Agent);
	        this.live = source["live"];
	        this.working = source["working"];
	        this.also_on = source["also_on"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Board {
	    machine: string;
	    // Go type: time
	    generated_at: any;
	    machines: string[];
	    columns: Record<string, Array<BoardCard>>;
	    initiatives: BoardInitiative[];
	    unassigned_agents: model.Agent[];
	
	    static createFrom(source: any = {}) {
	        return new Board(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.machine = source["machine"];
	        this.generated_at = this.convertValues(source["generated_at"], null);
	        this.machines = source["machines"];
	        this.columns = this.convertValues(source["columns"], Array<BoardCard>, true);
	        this.initiatives = this.convertValues(source["initiatives"], BoardInitiative);
	        this.unassigned_agents = this.convertValues(source["unassigned_agents"], model.Agent);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class BoardCard {
	    slug: string;
	    title: string;
	    status: string;
	    repos: string[];
	    branch: string;
	    updated: string;
	    next: string;
	    due: string;
	    start: string;
	    branch_start: string;
	    branch_last: string;
	    path: string;
	    body: string;
	    archived: boolean;
	    initiative_id: string;
	    initiative_title: string;
	    initiative_path: string;
	    client: string;
	    machine: string;
	    local: boolean;
	    // Go type: time
	    scanned_at: any;
	
	    static createFrom(source: any = {}) {
	        return new BoardCard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.slug = source["slug"];
	        this.title = source["title"];
	        this.status = source["status"];
	        this.repos = source["repos"];
	        this.branch = source["branch"];
	        this.updated = source["updated"];
	        this.next = source["next"];
	        this.due = source["due"];
	        this.start = source["start"];
	        this.branch_start = source["branch_start"];
	        this.branch_last = source["branch_last"];
	        this.path = source["path"];
	        this.body = source["body"];
	        this.archived = source["archived"];
	        this.initiative_id = source["initiative_id"];
	        this.initiative_title = source["initiative_title"];
	        this.initiative_path = source["initiative_path"];
	        this.client = source["client"];
	        this.machine = source["machine"];
	        this.local = source["local"];
	        this.scanned_at = this.convertValues(source["scanned_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace model {
	
	export class Agent {
	    name: string;
	    session: string;
	    family: string;
	    short: string;
	    kind: string;
	    state: string;
	    pid: number;
	    tty: string;
	    uptime: string;
	    cpu_seconds: number;
	    dir: string;
	    created: string;
	
	    static createFrom(source: any = {}) {
	        return new Agent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.session = source["session"];
	        this.family = source["family"];
	        this.short = source["short"];
	        this.kind = source["kind"];
	        this.state = source["state"];
	        this.pid = source["pid"];
	        this.tty = source["tty"];
	        this.uptime = source["uptime"];
	        this.cpu_seconds = source["cpu_seconds"];
	        this.dir = source["dir"];
	        this.created = source["created"];
	    }
	}
	export class Milestone {
	    date: string;
	    title: string;
	
	    static createFrom(source: any = {}) {
	        return new Milestone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.title = source["title"];
	    }
	}
	export class Order {
	    initiatives: string[];
	    cards: Record<string, Array<string>>;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Order(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiatives = source["initiatives"];
	        this.cards = source["cards"];
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Problem {
	    path: string;
	    msg: string;
	
	    static createFrom(source: any = {}) {
	        return new Problem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.msg = source["msg"];
	    }
	}
	export class RepoState {
	    name: string;
	    path: string;
	    branch: string;
	    dirty: number;
	    last_commit: string;
	    missing: boolean;
	    err?: string;
	
	    static createFrom(source: any = {}) {
	        return new RepoState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.branch = source["branch"];
	        this.dirty = source["dirty"];
	        this.last_commit = source["last_commit"];
	        this.missing = source["missing"];
	        this.err = source["err"];
	    }
	}

}

export namespace service {
	
	export class AgentGroup {
	    id: string;
	    title: string;
	    client: string;
	    path: string;
	    agents: model.Agent[];
	    live: number;
	    working: number;
	
	    static createFrom(source: any = {}) {
	        return new AgentGroup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.client = source["client"];
	        this.path = source["path"];
	        this.agents = this.convertValues(source["agents"], model.Agent);
	        this.live = source["live"];
	        this.working = source["working"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AgentsView {
	    groups: AgentGroup[];
	    unassigned: model.Agent[];
	    // Go type: time
	    sampled_at: any;
	
	    static createFrom(source: any = {}) {
	        return new AgentsView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.groups = this.convertValues(source["groups"], AgentGroup);
	        this.unassigned = this.convertValues(source["unassigned"], model.Agent);
	        this.sampled_at = this.convertValues(source["sampled_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class LockState {
	    enabled: boolean;
	    unlocked: boolean;
	    cooldown_secs: number;
	    failures_left: number;
	
	    static createFrom(source: any = {}) {
	        return new LockState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.unlocked = source["unlocked"];
	        this.cooldown_secs = source["cooldown_secs"];
	        this.failures_left = source["failures_left"];
	    }
	}
	export class SyncResult {
	    pushed: number;
	    retired: number;
	    machines: string[];
	    // Go type: time
	    pulled_at: any;
	    skipped?: string;
	
	    static createFrom(source: any = {}) {
	        return new SyncResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pushed = source["pushed"];
	        this.retired = source["retired"];
	        this.machines = source["machines"];
	        this.pulled_at = this.convertValues(source["pulled_at"], null);
	        this.skipped = source["skipped"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

