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
	    auth: string;
	    firebase_api_key: string;
	    firestore_database: string;
	    sync_interval_minutes: number;
	    editor: string;
	    git_timeout_seconds: number;
	    agent: string;
	    probe_state_dir: string;
	    zellij: string;
	    agent_binary: string;
	    discuss_state_dir: string;
	    crew_model: string;
	    record_url: string;
	
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
	        this.auth = source["auth"];
	        this.firebase_api_key = source["firebase_api_key"];
	        this.firestore_database = source["firestore_database"];
	        this.sync_interval_minutes = source["sync_interval_minutes"];
	        this.editor = source["editor"];
	        this.git_timeout_seconds = source["git_timeout_seconds"];
	        this.agent = source["agent"];
	        this.probe_state_dir = source["probe_state_dir"];
	        this.zellij = source["zellij"];
	        this.agent_binary = source["agent_binary"];
	        this.discuss_state_dir = source["discuss_state_dir"];
	        this.crew_model = source["crew_model"];
	        this.record_url = source["record_url"];
	    }
	}

}

export namespace discuss {
	
	export class Message {
	    id: string;
	    thread_id: string;
	    parent_id: string;
	    from: string;
	    to: string;
	    kind: string;
	    subject: string;
	    body: string;
	    created_at: number;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.thread_id = source["thread_id"];
	        this.parent_id = source["parent_id"];
	        this.from = source["from"];
	        this.to = source["to"];
	        this.kind = source["kind"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	        this.created_at = source["created_at"];
	    }
	}
	export class PostResult {
	    id: string;
	    thread_id: string;
	    created_at: number;
	    stalled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PostResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.thread_id = source["thread_id"];
	        this.created_at = source["created_at"];
	        this.stalled = source["stalled"];
	    }
	}
	export class Thread {
	    id: string;
	    subject: string;
	    status: string;
	    kind: string;
	    participants: string[];
	    messages: number;
	    since_decision: number;
	    undecided: boolean;
	    quiet_seconds: number;
	    age_seconds: number;
	
	    static createFrom(source: any = {}) {
	        return new Thread(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.status = source["status"];
	        this.kind = source["kind"];
	        this.participants = source["participants"];
	        this.messages = source["messages"];
	        this.since_decision = source["since_decision"];
	        this.undecided = source["undecided"];
	        this.quiet_seconds = source["quiet_seconds"];
	        this.age_seconds = source["age_seconds"];
	    }
	}

}

export namespace main {
	
	export class BoardView {
	    board: merge.Board;
	    order: model.Order;
	    // Go type: time
	    pulled_at: any;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new BoardView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.board = this.convertValues(source["board"], merge.Board);
	        this.order = this.convertValues(source["order"], model.Order);
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
	    threads: string[];
	    seat: string;
	    depends_on: string[];
	    boundary: string[];
	    spec: string;
	    gate: string;
	    review: string;
	    thread_state: model.ThreadState[];
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
	        this.threads = source["threads"];
	        this.seat = source["seat"];
	        this.depends_on = source["depends_on"];
	        this.boundary = source["boundary"];
	        this.spec = source["spec"];
	        this.gate = source["gate"];
	        this.review = source["review"];
	        this.thread_state = this.convertValues(source["thread_state"], model.ThreadState);
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
	
	export class ContextStatus {
	    session_id: string;
	    model: string;
	    used_percent: number;
	    input_tokens: number;
	    window_size: number;
	    cost_usd: number;
	    transcript: string;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new ContextStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.session_id = source["session_id"];
	        this.model = source["model"];
	        this.used_percent = source["used_percent"];
	        this.input_tokens = source["input_tokens"];
	        this.window_size = source["window_size"];
	        this.cost_usd = source["cost_usd"];
	        this.transcript = source["transcript"];
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
	    persona: string;
	    cell: string;
	    context?: ContextStatus;
	    watcher: string;
	    deaf: boolean;
	    undelivered: number;
	
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
	        this.persona = source["persona"];
	        this.cell = source["cell"];
	        this.context = this.convertValues(source["context"], ContextStatus);
	        this.watcher = source["watcher"];
	        this.deaf = source["deaf"];
	        this.undelivered = source["undelivered"];
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
	export class Blocker {
	    seat: string;
	    reason: string;
	
	    static createFrom(source: any = {}) {
	        return new Blocker(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seat = source["seat"];
	        this.reason = source["reason"];
	    }
	}
	export class Cell {
	    project: string;
	    workdir: string;
	    agents: string[];
	    human: string;
	    reconciler: string;
	    model?: string;
	
	    static createFrom(source: any = {}) {
	        return new Cell(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.project = source["project"];
	        this.workdir = source["workdir"];
	        this.agents = source["agents"];
	        this.human = source["human"];
	        this.reconciler = source["reconciler"];
	        this.model = source["model"];
	    }
	}
	
	export class Group {
	    name: string;
	    initiatives: string[];
	
	    static createFrom(source: any = {}) {
	        return new Group(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.initiatives = source["initiatives"];
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
	export class Note {
	    id: string;
	    by: string;
	    // Go type: time
	    at: any;
	    text: string;
	
	    static createFrom(source: any = {}) {
	        return new Note(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.by = source["by"];
	        this.at = this.convertValues(source["at"], null);
	        this.text = source["text"];
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
	export class Order {
	    initiatives: string[];
	    cards: Record<string, Array<string>>;
	    groups?: Group[];
	    notes?: Record<string, Array<Note>>;
	    resolved?: Record<string, string>;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Order(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiatives = source["initiatives"];
	        this.cards = source["cards"];
	        this.groups = this.convertValues(source["groups"], Group);
	        this.notes = this.convertValues(source["notes"], Array<Note>, true);
	        this.resolved = source["resolved"];
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
	export class ThreadState {
	    id: string;
	    subject: string;
	    status: string;
	    messages: number;
	    since_decision: number;
	    quiet_seconds: number;
	    missing: boolean;
	    blocked_on: Blocker[];
	
	    static createFrom(source: any = {}) {
	        return new ThreadState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.status = source["status"];
	        this.messages = source["messages"];
	        this.since_decision = source["since_decision"];
	        this.quiet_seconds = source["quiet_seconds"];
	        this.missing = source["missing"];
	        this.blocked_on = this.convertValues(source["blocked_on"], Blocker);
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

export namespace service {
	
	export class CellThread {
	    id: string;
	    subject: string;
	    status: string;
	    kind: string;
	    participants: string[];
	    messages: number;
	    since_decision: number;
	    undecided: boolean;
	    quiet_seconds: number;
	    age_seconds: number;
	    cards: string[];
	    opener: string;
	    to: string;
	    asked_of_me: number;
	    asked_by: string;
	
	    static createFrom(source: any = {}) {
	        return new CellThread(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.status = source["status"];
	        this.kind = source["kind"];
	        this.participants = source["participants"];
	        this.messages = source["messages"];
	        this.since_decision = source["since_decision"];
	        this.undecided = source["undecided"];
	        this.quiet_seconds = source["quiet_seconds"];
	        this.age_seconds = source["age_seconds"];
	        this.cards = source["cards"];
	        this.opener = source["opener"];
	        this.to = source["to"];
	        this.asked_of_me = source["asked_of_me"];
	        this.asked_by = source["asked_by"];
	    }
	}
	export class CardWait {
	    slug: string;
	    title: string;
	    status: string;
	    thread: model.ThreadState;
	
	    static createFrom(source: any = {}) {
	        return new CardWait(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.slug = source["slug"];
	        this.title = source["title"];
	        this.status = source["status"];
	        this.thread = this.convertValues(source["thread"], model.ThreadState);
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
	export class Seat {
	    name: string;
	    session: string;
	    agent?: model.Agent;
	    watcher: string;
	    deaf: boolean;
	    capped: boolean;
	    undelivered: number;
	    owes: model.ThreadState[];
	
	    static createFrom(source: any = {}) {
	        return new Seat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.session = source["session"];
	        this.agent = this.convertValues(source["agent"], model.Agent);
	        this.watcher = source["watcher"];
	        this.deaf = source["deaf"];
	        this.capped = source["capped"];
	        this.undelivered = source["undelivered"];
	        this.owes = this.convertValues(source["owes"], model.ThreadState);
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
	export class AgentGroup {
	    id: string;
	    title: string;
	    client: string;
	    path: string;
	    agents: model.Agent[];
	    live: number;
	    working: number;
	    cell?: model.Cell;
	    crew: Seat[];
	    discuss: string;
	    waiting: CardWait[];
	    project: string;
	    human: string;
	    can_post: boolean;
	    threads: CellThread[];
	    needs_me: number;
	    needs_reconciler: number;
	    retirable: string[];
	
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
	        this.cell = this.convertValues(source["cell"], model.Cell);
	        this.crew = this.convertValues(source["crew"], Seat);
	        this.discuss = source["discuss"];
	        this.waiting = this.convertValues(source["waiting"], CardWait);
	        this.project = source["project"];
	        this.human = source["human"];
	        this.can_post = source["can_post"];
	        this.threads = this.convertValues(source["threads"], CellThread);
	        this.needs_me = source["needs_me"];
	        this.needs_reconciler = source["needs_reconciler"];
	        this.retirable = source["retirable"];
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
	
	export class CellPost {
	    thread_id: string;
	    parent_id: string;
	    to: string;
	    kind: string;
	    subject: string;
	    body: string;
	
	    static createFrom(source: any = {}) {
	        return new CellPost(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.thread_id = source["thread_id"];
	        this.parent_id = source["parent_id"];
	        this.to = source["to"];
	        this.kind = source["kind"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	    }
	}
	
	export class CellThreadView {
	    id: string;
	    subject: string;
	    status: string;
	    since_decision: number;
	    messages: discuss.Message[];
	    cards: string[];
	    wakes_on_broadcast: number;
	
	    static createFrom(source: any = {}) {
	        return new CellThreadView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.status = source["status"];
	        this.since_decision = source["since_decision"];
	        this.messages = this.convertValues(source["messages"], discuss.Message);
	        this.cards = source["cards"];
	        this.wakes_on_broadcast = source["wakes_on_broadcast"];
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
	export class CellView {
	    id: string;
	    title: string;
	    project: string;
	    human: string;
	    can_post: boolean;
	    cell?: model.Cell;
	    crew: Seat[];
	    threads: CellThread[];
	    closed: CellThread[];
	    waiting: CardWait[];
	    discuss: string;
	    // Go type: time
	    read_at: any;
	
	    static createFrom(source: any = {}) {
	        return new CellView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.project = source["project"];
	        this.human = source["human"];
	        this.can_post = source["can_post"];
	        this.cell = this.convertValues(source["cell"], model.Cell);
	        this.crew = this.convertValues(source["crew"], Seat);
	        this.threads = this.convertValues(source["threads"], CellThread);
	        this.closed = this.convertValues(source["closed"], CellThread);
	        this.waiting = this.convertValues(source["waiting"], CardWait);
	        this.discuss = source["discuss"];
	        this.read_at = this.convertValues(source["read_at"], null);
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
	export class RetireOptions {
	    initiative_id: string;
	    seats: string[];
	    retirable: boolean;
	    force: boolean;
	    wave_threads: boolean;
	    sessions: string[];
	    close_threads: boolean;
	    revoke_tokens: boolean;
	    commit_cell: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RetireOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative_id = source["initiative_id"];
	        this.seats = source["seats"];
	        this.retirable = source["retirable"];
	        this.force = source["force"];
	        this.wave_threads = source["wave_threads"];
	        this.sessions = source["sessions"];
	        this.close_threads = source["close_threads"];
	        this.revoke_tokens = source["revoke_tokens"];
	        this.commit_cell = source["commit_cell"];
	    }
	}
	export class RetirePlan {
	    initiative_id: string;
	    project: string;
	    seats: string[];
	    keep: string[];
	    sessions: string[];
	    tokens: string[];
	    threads: string[];
	    files: string[];
	    cell_path: string;
	    cell_is_git: boolean;
	    restart_api: boolean;
	    problems: string[];
	
	    static createFrom(source: any = {}) {
	        return new RetirePlan(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative_id = source["initiative_id"];
	        this.project = source["project"];
	        this.seats = source["seats"];
	        this.keep = source["keep"];
	        this.sessions = source["sessions"];
	        this.tokens = source["tokens"];
	        this.threads = source["threads"];
	        this.files = source["files"];
	        this.cell_path = source["cell_path"];
	        this.cell_is_git = source["cell_is_git"];
	        this.restart_api = source["restart_api"];
	        this.problems = source["problems"];
	    }
	}
	export class RetireReport {
	    steps: string[];
	    errors: string[];
	
	    static createFrom(source: any = {}) {
	        return new RetireReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.steps = source["steps"];
	        this.errors = source["errors"];
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

