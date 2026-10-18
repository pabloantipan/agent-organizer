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
	
	export class Role {
	    name: string;
	    description: string;
	    sessions: string;
	    bitacora: string;
	    here: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Role(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.sessions = source["sessions"];
	        this.bitacora = source["bitacora"];
	        this.here = source["here"];
	    }
	}
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
	    canned_health: string;
	    canned_post: string;
	    crew_model: string;
	    record_url: string;
	    help_doc: string;
	    roles: Role[];
	
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
	        this.canned_health = source["canned_health"];
	        this.canned_post = source["canned_post"];
	        this.crew_model = source["crew_model"];
	        this.record_url = source["record_url"];
	        this.help_doc = source["help_doc"];
	        this.roles = this.convertValues(source["roles"], Role);
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
	export class CrewResult {
	    lines: string[];
	    running: service.CrewRunning[];
	
	    static createFrom(source: any = {}) {
	        return new CrewResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.lines = source["lines"];
	        this.running = this.convertValues(source["running"], service.CrewRunning);
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
	    description: string;
	    specs: string[];
	    spec_files: Record<string, Array<string>>;
	    target: string;
	    milestones: model.Milestone[];
	    goal: string;
	    measure: string;
	    scope: model.Scope;
	    stages: model.Stage[];
	    charter_modified: boolean;
	    asleep_since: string;
	    frozen: string[];
	    factory_blind: boolean;
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
	    decisions: model.Decision[];
	    waves: model.Wave[];
	    fse: model.FSEActivity;
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
	        this.description = source["description"];
	        this.specs = source["specs"];
	        this.spec_files = source["spec_files"];
	        this.target = source["target"];
	        this.milestones = this.convertValues(source["milestones"], model.Milestone);
	        this.goal = source["goal"];
	        this.measure = source["measure"];
	        this.scope = this.convertValues(source["scope"], model.Scope);
	        this.stages = this.convertValues(source["stages"], model.Stage);
	        this.charter_modified = source["charter_modified"];
	        this.asleep_since = source["asleep_since"];
	        this.frozen = source["frozen"];
	        this.factory_blind = source["factory_blind"];
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
	        this.decisions = this.convertValues(source["decisions"], model.Decision);
	        this.waves = this.convertValues(source["waves"], model.Wave);
	        this.fse = this.convertValues(source["fse"], model.FSEActivity);
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
	    stage: string;
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
	        this.stage = source["stage"];
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
	
	export class CardJoin {
	    initiative: string;
	    slug: string;
	    title: string;
	    key: string;
	    state: string;
	    used_percent: number;
	    input_tokens: number;
	    // Go type: time
	    started_at: any;
	
	    static createFrom(source: any = {}) {
	        return new CardJoin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.slug = source["slug"];
	        this.title = source["title"];
	        this.key = source["key"];
	        this.state = source["state"];
	        this.used_percent = source["used_percent"];
	        this.input_tokens = source["input_tokens"];
	        this.started_at = this.convertValues(source["started_at"], null);
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
	    capped: boolean;
	    undelivered: number;
	    no_identity: boolean;
	    card?: CardJoin;
	    mem_bytes: number;
	
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
	        this.capped = source["capped"];
	        this.undelivered = source["undelivered"];
	        this.no_identity = source["no_identity"];
	        this.card = this.convertValues(source["card"], CardJoin);
	        this.mem_bytes = source["mem_bytes"];
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
	
	export class RecordRef {
	    number: string;
	    slug: string;
	
	    static createFrom(source: any = {}) {
	        return new RecordRef(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.slug = source["slug"];
	    }
	}
	export class Cell {
	    project: string;
	    workdir: string;
	    agents: string[];
	    human: string;
	    reconciler: string;
	    model?: string;
	    draft?: boolean;
	    drafted?: string;
	    state?: string;
	    accept_record?: RecordRef;
	
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
	        this.draft = source["draft"];
	        this.drafted = source["drafted"];
	        this.state = source["state"];
	        this.accept_record = this.convertValues(source["accept_record"], RecordRef);
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
	
	export class Decision {
	    number: string;
	    slug: string;
	    path: string;
	    title: string;
	    status: string;
	    raised: string;
	    raised_by: string;
	    owner: string;
	    ruled: string;
	    ruled_by: string;
	    options: string[];
	    chosen: string;
	    cards: string[];
	    stage: string;
	    threads: string[];
	    supersedes: string[];
	    superseded_by: string;
	    forecast: string;
	    forecast_top: number;
	    ruled_at: string;
	    body: string;
	
	    static createFrom(source: any = {}) {
	        return new Decision(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.slug = source["slug"];
	        this.path = source["path"];
	        this.title = source["title"];
	        this.status = source["status"];
	        this.raised = source["raised"];
	        this.raised_by = source["raised_by"];
	        this.owner = source["owner"];
	        this.ruled = source["ruled"];
	        this.ruled_by = source["ruled_by"];
	        this.options = source["options"];
	        this.chosen = source["chosen"];
	        this.cards = source["cards"];
	        this.stage = source["stage"];
	        this.threads = source["threads"];
	        this.supersedes = source["supersedes"];
	        this.superseded_by = source["superseded_by"];
	        this.forecast = source["forecast"];
	        this.forecast_top = source["forecast_top"];
	        this.ruled_at = source["ruled_at"];
	        this.body = source["body"];
	    }
	}
	export class ExitItem {
	    text: string;
	    met: string;
	
	    static createFrom(source: any = {}) {
	        return new ExitItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.met = source["met"];
	    }
	}
	export class FSECommit {
	    sha: string;
	    at: string;
	    subject: string;
	
	    static createFrom(source: any = {}) {
	        return new FSECommit(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sha = source["sha"];
	        this.at = source["at"];
	        this.subject = source["subject"];
	    }
	}
	export class FSEActivity {
	    path: string;
	    hand_off: string;
	    hand_off_body: string;
	    commits: FSECommit[];
	
	    static createFrom(source: any = {}) {
	        return new FSEActivity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.hand_off = source["hand_off"];
	        this.hand_off_body = source["hand_off_body"];
	        this.commits = this.convertValues(source["commits"], FSECommit);
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
	export class MemoryInitiative {
	    initiative: string;
	    unassigned: boolean;
	    bytes: number;
	    agents: number;
	
	    static createFrom(source: any = {}) {
	        return new MemoryInitiative(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.unassigned = source["unassigned"];
	        this.bytes = source["bytes"];
	        this.agents = source["agents"];
	    }
	}
	export class MemorySession {
	    name: string;
	    initiative: string;
	    bytes: number;
	    agent_id: string;
	
	    static createFrom(source: any = {}) {
	        return new MemorySession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.initiative = source["initiative"];
	        this.bytes = source["bytes"];
	        this.agent_id = source["agent_id"];
	    }
	}
	export class Memory {
	    pressure: string;
	    // Go type: time
	    since: any;
	    since_opened: boolean;
	    // Go type: time
	    was_critical_until?: any;
	    total_bytes: number;
	    free_bytes: number;
	    top: MemorySession[];
	    agents_bytes: number;
	    by_initiative: MemoryInitiative[];
	    warn: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Memory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pressure = source["pressure"];
	        this.since = this.convertValues(source["since"], null);
	        this.since_opened = source["since_opened"];
	        this.was_critical_until = this.convertValues(source["was_critical_until"], null);
	        this.total_bytes = source["total_bytes"];
	        this.free_bytes = source["free_bytes"];
	        this.top = this.convertValues(source["top"], MemorySession);
	        this.agents_bytes = source["agents_bytes"];
	        this.by_initiative = this.convertValues(source["by_initiative"], MemoryInitiative);
	        this.warn = source["warn"];
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
	    unread: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Problem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.msg = source["msg"];
	        this.unread = source["unread"];
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
	export class RoleMail {
	    thread_id: string;
	    subject: string;
	    project: string;
	    initiative: string;
	    from: string;
	    status: string;
	    age_seconds: number;
	
	    static createFrom(source: any = {}) {
	        return new RoleMail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.thread_id = source["thread_id"];
	        this.subject = source["subject"];
	        this.project = source["project"];
	        this.initiative = source["initiative"];
	        this.from = source["from"];
	        this.status = source["status"];
	        this.age_seconds = source["age_seconds"];
	    }
	}
	export class RoleLogLine {
	    date: string;
	    text: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleLogLine(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.text = source["text"];
	    }
	}
	export class RoleHandOff {
	    title: string;
	    date: string;
	    host: string;
	    first_line: string;
	    body: string;
	    stale: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RoleHandOff(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.date = source["date"];
	        this.host = source["host"];
	        this.first_line = source["first_line"];
	        this.body = source["body"];
	        this.stale = source["stale"];
	    }
	}
	export class RoleBitacora {
	    path: string;
	    initiative: string;
	    hand_off?: RoleHandOff;
	    others: RoleHandOff[];
	    log: RoleLogLine[];
	
	    static createFrom(source: any = {}) {
	        return new RoleBitacora(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.initiative = source["initiative"];
	        this.hand_off = this.convertValues(source["hand_off"], RoleHandOff);
	        this.others = this.convertValues(source["others"], RoleHandOff);
	        this.log = this.convertValues(source["log"], RoleLogLine);
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
	export class RoleSession {
	    name: string;
	    initiative: string;
	    state: string;
	    working: boolean;
	    context?: number;
	    created: string;
	    uptime: string;
	    pid: number;
	
	    static createFrom(source: any = {}) {
	        return new RoleSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.initiative = source["initiative"];
	        this.state = source["state"];
	        this.working = source["working"];
	        this.context = source["context"];
	        this.created = source["created"];
	        this.uptime = source["uptime"];
	        this.pid = source["pid"];
	    }
	}
	export class Role {
	    name: string;
	    description: string;
	    here: boolean;
	    state: string;
	    working: boolean;
	    sessions: RoleSession[];
	    context?: number;
	    // Go type: time
	    last_seen?: any;
	    last_seen_in: string;
	    bitacoras: RoleBitacora[];
	    bitacora_expected: string;
	    mail: RoleMail[];
	    mail_unknown: boolean;
	    initiatives: string[];
	
	    static createFrom(source: any = {}) {
	        return new Role(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.here = source["here"];
	        this.state = source["state"];
	        this.working = source["working"];
	        this.sessions = this.convertValues(source["sessions"], RoleSession);
	        this.context = source["context"];
	        this.last_seen = this.convertValues(source["last_seen"], null);
	        this.last_seen_in = source["last_seen_in"];
	        this.bitacoras = this.convertValues(source["bitacoras"], RoleBitacora);
	        this.bitacora_expected = source["bitacora_expected"];
	        this.mail = this.convertValues(source["mail"], RoleMail);
	        this.mail_unknown = source["mail_unknown"];
	        this.initiatives = source["initiatives"];
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
	
	
	
	
	
	export class Round {
	    card: string;
	    kind: string;
	    start: string;
	    end: string;
	    result: string;
	    reviewer: string;
	    reason: string;
	
	    static createFrom(source: any = {}) {
	        return new Round(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.card = source["card"];
	        this.kind = source["kind"];
	        this.start = source["start"];
	        this.end = source["end"];
	        this.result = source["result"];
	        this.reviewer = source["reviewer"];
	        this.reason = source["reason"];
	    }
	}
	export class Scope {
	    in: string[];
	    out: string[];
	
	    static createFrom(source: any = {}) {
	        return new Scope(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.in = source["in"];
	        this.out = source["out"];
	    }
	}
	export class Stage {
	    id: string;
	    title: string;
	    outcome: string;
	    phase: string;
	    exit: ExitItem[];
	    gates: string[];
	    appetite: string;
	    target: string;
	    done: string;
	    current: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Stage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.outcome = source["outcome"];
	        this.phase = source["phase"];
	        this.exit = this.convertValues(source["exit"], ExitItem);
	        this.gates = source["gates"];
	        this.appetite = source["appetite"];
	        this.target = source["target"];
	        this.done = source["done"];
	        this.current = source["current"];
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
	export class Wave {
	    record: string;
	    date: string;
	    dot: boolean;
	    wave: number;
	    supervisor: string;
	    task: string;
	    cards: string[];
	    launched: string;
	    merged: string;
	    rounds: Round[];
	    stages: string[];
	
	    static createFrom(source: any = {}) {
	        return new Wave(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.record = source["record"];
	        this.date = source["date"];
	        this.dot = source["dot"];
	        this.wave = source["wave"];
	        this.supervisor = source["supervisor"];
	        this.task = source["task"];
	        this.cards = source["cards"];
	        this.launched = source["launched"];
	        this.merged = source["merged"];
	        this.rounds = this.convertValues(source["rounds"], Round);
	        this.stages = source["stages"];
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

export namespace review {
	
	export class Edge {
	    from: string;
	    to: string;
	    kind: string;
	    change: string;
	    source: string;
	
	    static createFrom(source: any = {}) {
	        return new Edge(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.from = source["from"];
	        this.to = source["to"];
	        this.kind = source["kind"];
	        this.change = source["change"];
	        this.source = source["source"];
	    }
	}
	export class Evidence {
	    tests: string[];
	
	    static createFrom(source: any = {}) {
	        return new Evidence(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tests = source["tests"];
	    }
	}
	export class Mark {
	    symbol: string;
	    state: string;
	    note: string;
	    by: string;
	    at: string;
	    hash: string;
	    from?: string;
	    asked?: string;
	    asked_thread?: string;
	
	    static createFrom(source: any = {}) {
	        return new Mark(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.symbol = source["symbol"];
	        this.state = source["state"];
	        this.note = source["note"];
	        this.by = source["by"];
	        this.at = source["at"];
	        this.hash = source["hash"];
	        this.from = source["from"];
	        this.asked = source["asked"];
	        this.asked_thread = source["asked_thread"];
	    }
	}
	export class Marks {
	    initiative: string;
	    card: string;
	    head: string;
	    marks: Mark[];
	    changed: Mark[];
	    from?: string;
	    thread?: string;
	
	    static createFrom(source: any = {}) {
	        return new Marks(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.card = source["card"];
	        this.head = source["head"];
	        this.marks = this.convertValues(source["marks"], Mark);
	        this.changed = this.convertValues(source["changed"], Mark);
	        this.from = source["from"];
	        this.thread = source["thread"];
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
	export class Mismatch {
	    type: string;
	    node?: string;
	    file?: string;
	    symbol?: string;
	
	    static createFrom(source: any = {}) {
	        return new Mismatch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.node = source["node"];
	        this.file = source["file"];
	        this.symbol = source["symbol"];
	    }
	}
	export class Review {
	    state: string;
	    by?: string;
	    at?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new Review(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.state = source["state"];
	        this.by = source["by"];
	        this.at = source["at"];
	        this.note = source["note"];
	    }
	}
	export class Node {
	    id: string;
	    level: string;
	    parent: string;
	    kind: string;
	    lang: string;
	    file: string;
	    range_head?: number[];
	    range_base?: number[];
	    change: string;
	    risk?: string;
	    evidence: Evidence;
	    claim?: string;
	    flags: string[];
	    review: Review;
	
	    static createFrom(source: any = {}) {
	        return new Node(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.level = source["level"];
	        this.parent = source["parent"];
	        this.kind = source["kind"];
	        this.lang = source["lang"];
	        this.file = source["file"];
	        this.range_head = source["range_head"];
	        this.range_base = source["range_base"];
	        this.change = source["change"];
	        this.risk = source["risk"];
	        this.evidence = this.convertValues(source["evidence"], Evidence);
	        this.claim = source["claim"];
	        this.flags = source["flags"];
	        this.review = this.convertValues(source["review"], Review);
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
	export class RepoPair {
	    name: string;
	    base: string;
	    head: string;
	    from: string;
	
	    static createFrom(source: any = {}) {
	        return new RepoPair(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.base = source["base"];
	        this.head = source["head"];
	        this.from = source["from"];
	    }
	}
	export class Stats {
	    packages: number;
	    changed: number;
	    changed_tests: number;
	    affected: number;
	    untested: number;
	    edges: number;
	
	    static createFrom(source: any = {}) {
	        return new Stats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.packages = source["packages"];
	        this.changed = source["changed"];
	        this.changed_tests = source["changed_tests"];
	        this.affected = source["affected"];
	        this.untested = source["untested"];
	        this.edges = source["edges"];
	    }
	}
	export class RevMap {
	    version: string;
	    initiative: string;
	    target: string;
	    base: string;
	    head: string;
	    repos?: RepoPair[];
	    source: string;
	    nodes: Node[];
	    edges: Edge[];
	    mismatches: Mismatch[];
	    reconciled: boolean;
	    reconciliation?: string;
	    stats: Stats;
	    problems?: string[];
	    notes?: string[];
	
	    static createFrom(source: any = {}) {
	        return new RevMap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.initiative = source["initiative"];
	        this.target = source["target"];
	        this.base = source["base"];
	        this.head = source["head"];
	        this.repos = this.convertValues(source["repos"], RepoPair);
	        this.source = source["source"];
	        this.nodes = this.convertValues(source["nodes"], Node);
	        this.edges = this.convertValues(source["edges"], Edge);
	        this.mismatches = this.convertValues(source["mismatches"], Mismatch);
	        this.reconciled = source["reconciled"];
	        this.reconciliation = source["reconciliation"];
	        this.stats = this.convertValues(source["stats"], Stats);
	        this.problems = source["problems"];
	        this.notes = source["notes"];
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
	
	
	export class Text {
	    path: string;
	    sha: string;
	    first: number;
	    lines: string[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new Text(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.sha = source["sha"];
	        this.first = source["first"];
	        this.lines = source["lines"];
	        this.total = source["total"];
	    }
	}

}

export namespace service {
	
	export class TaskPost {
	    thread_id: string;
	    from: string;
	    subject: string;
	    line: string;
	
	    static createFrom(source: any = {}) {
	        return new TaskPost(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.thread_id = source["thread_id"];
	        this.from = source["from"];
	        this.subject = source["subject"];
	        this.line = source["line"];
	    }
	}
	export class TaskCard {
	    slug: string;
	    title: string;
	    status: string;
	    seat: string;
	
	    static createFrom(source: any = {}) {
	        return new TaskCard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.slug = source["slug"];
	        this.title = source["title"];
	        this.status = source["status"];
	        this.seat = source["seat"];
	    }
	}
	export class Task {
	    number: string;
	    title: string;
	    forecast: string;
	    forecast_top: number;
	    // Go type: time
	    started?: any;
	    elapsed_minutes: number;
	    cards: TaskCard[];
	    seats: string[];
	    supervisor: string;
	    quiet_minutes?: number;
	    last_post?: TaskPost;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.title = source["title"];
	        this.forecast = source["forecast"];
	        this.forecast_top = source["forecast_top"];
	        this.started = this.convertValues(source["started"], null);
	        this.elapsed_minutes = source["elapsed_minutes"];
	        this.cards = this.convertValues(source["cards"], TaskCard);
	        this.seats = source["seats"];
	        this.supervisor = source["supervisor"];
	        this.quiet_minutes = source["quiet_minutes"];
	        this.last_post = this.convertValues(source["last_post"], TaskPost);
	        this.state = source["state"];
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
	export class WaveCard {
	    slug: string;
	    title: string;
	    seat: string;
	    status: string;
	    next: string;
	    group: string;
	    gate_passed: number;
	    gate_total: number;
	    has_gate: boolean;
	    input_tokens: number;
	    agent?: model.CardJoin;
	
	    static createFrom(source: any = {}) {
	        return new WaveCard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.slug = source["slug"];
	        this.title = source["title"];
	        this.seat = source["seat"];
	        this.status = source["status"];
	        this.next = source["next"];
	        this.group = source["group"];
	        this.gate_passed = source["gate_passed"];
	        this.gate_total = source["gate_total"];
	        this.has_gate = source["has_gate"];
	        this.input_tokens = source["input_tokens"];
	        this.agent = this.convertValues(source["agent"], model.CardJoin);
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
	export class Wave {
	    n: number;
	    label: string;
	    building: WaveCard[];
	    in_review: WaveCard[];
	    queued: WaveCard[];
	    done: WaveCard[];
	    gate_passed: number;
	    gate_total: number;
	    has_gate: boolean;
	    input_tokens: number;
	    supervisor: string;
	
	    static createFrom(source: any = {}) {
	        return new Wave(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.n = source["n"];
	        this.label = source["label"];
	        this.building = this.convertValues(source["building"], WaveCard);
	        this.in_review = this.convertValues(source["in_review"], WaveCard);
	        this.queued = this.convertValues(source["queued"], WaveCard);
	        this.done = this.convertValues(source["done"], WaveCard);
	        this.gate_passed = source["gate_passed"];
	        this.gate_total = source["gate_total"];
	        this.has_gate = source["has_gate"];
	        this.input_tokens = source["input_tokens"];
	        this.supervisor = source["supervisor"];
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
	    no_persona: boolean;
	
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
	        this.no_persona = source["no_persona"];
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
	    waves: Wave[];
	    tasks: Task[];
	
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
	        this.waves = this.convertValues(source["waves"], Wave);
	        this.tasks = this.convertValues(source["tasks"], Task);
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
	export class SeatLaunch {
	    seat: string;
	    session: string;
	    state: string;
	    // Go type: time
	    started_at?: any;
	    // Go type: time
	    failed_at?: any;
	    reason?: string;
	    exit?: number;
	    output?: string;
	    launch_line: string;
	
	    static createFrom(source: any = {}) {
	        return new SeatLaunch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seat = source["seat"];
	        this.session = source["session"];
	        this.state = source["state"];
	        this.started_at = this.convertValues(source["started_at"], null);
	        this.failed_at = this.convertValues(source["failed_at"], null);
	        this.reason = source["reason"];
	        this.exit = source["exit"];
	        this.output = source["output"];
	        this.launch_line = source["launch_line"];
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
	export class InitiativeLaunch {
	    initiative: string;
	    kind: string;
	    seats: SeatLaunch[];
	    seen: boolean;
	    running: number;
	    failed: number;
	    done: boolean;
	
	    static createFrom(source: any = {}) {
	        return new InitiativeLaunch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.kind = source["kind"];
	        this.seats = this.convertValues(source["seats"], SeatLaunch);
	        this.seen = source["seen"];
	        this.running = source["running"];
	        this.failed = source["failed"];
	        this.done = source["done"];
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
	    roles: model.Role[];
	    // Go type: time
	    sampled_at: any;
	    memory?: model.Memory;
	    memory_reason?: string;
	    launches: InitiativeLaunch[];
	
	    static createFrom(source: any = {}) {
	        return new AgentsView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.groups = this.convertValues(source["groups"], AgentGroup);
	        this.unassigned = this.convertValues(source["unassigned"], model.Agent);
	        this.roles = this.convertValues(source["roles"], model.Role);
	        this.sampled_at = this.convertValues(source["sampled_at"], null);
	        this.memory = this.convertValues(source["memory"], model.Memory);
	        this.memory_reason = source["memory_reason"];
	        this.launches = this.convertValues(source["launches"], InitiativeLaunch);
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
	export class RunInfo {
	    session_id: string;
	    session?: string;
	    persona?: string;
	    cell?: string;
	    cwd: string;
	    model: string;
	    used_percent: number;
	    input_tokens: number;
	    window_size: number;
	    initiative?: string;
	    card?: string;
	    branch?: string;
	    // Go type: time
	    first_seen: any;
	    // Go type: time
	    last_seen: any;
	    ended: boolean;
	    live: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RunInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.session_id = source["session_id"];
	        this.session = source["session"];
	        this.persona = source["persona"];
	        this.cell = source["cell"];
	        this.cwd = source["cwd"];
	        this.model = source["model"];
	        this.used_percent = source["used_percent"];
	        this.input_tokens = source["input_tokens"];
	        this.window_size = source["window_size"];
	        this.initiative = source["initiative"];
	        this.card = source["card"];
	        this.branch = source["branch"];
	        this.first_seen = this.convertValues(source["first_seen"], null);
	        this.last_seen = this.convertValues(source["last_seen"], null);
	        this.ended = source["ended"];
	        this.live = source["live"];
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
	export class CardRuns {
	    card: string;
	    input_tokens: number;
	    live: number;
	    runs: RunInfo[];
	
	    static createFrom(source: any = {}) {
	        return new CardRuns(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.card = source["card"];
	        this.input_tokens = source["input_tokens"];
	        this.live = source["live"];
	        this.runs = this.convertValues(source["runs"], RunInfo);
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
	export class CrewRunning {
	    seat: string;
	    session: string;
	
	    static createFrom(source: any = {}) {
	        return new CrewRunning(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seat = source["seat"];
	        this.session = source["session"];
	    }
	}
	export class FactorySeen {
	    id: string;
	    root: string;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new FactorySeen(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.root = source["root"];
	        this.state = source["state"];
	    }
	}
	export class FactoryView {
	    found: boolean;
	    on_path: boolean;
	    path: string;
	    ok: boolean;
	    reason?: string;
	    limit: number;
	    awake: number;
	    seen: FactorySeen[];
	    offers: Record<string, string>;
	    // Go type: time
	    checked_at: any;
	
	    static createFrom(source: any = {}) {
	        return new FactoryView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.found = source["found"];
	        this.on_path = source["on_path"];
	        this.path = source["path"];
	        this.ok = source["ok"];
	        this.reason = source["reason"];
	        this.limit = source["limit"];
	        this.awake = source["awake"];
	        this.seen = this.convertValues(source["seen"], FactorySeen);
	        this.offers = source["offers"];
	        this.checked_at = this.convertValues(source["checked_at"], null);
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
	export class HelpDoc {
	    path: string;
	    key: string;
	    text: string;
	    problem: string;
	
	    static createFrom(source: any = {}) {
	        return new HelpDoc(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.key = source["key"];
	        this.text = source["text"];
	        this.problem = source["problem"];
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
	export class ReviewAddressee {
	    seat: string;
	    why: string;
	
	    static createFrom(source: any = {}) {
	        return new ReviewAddressee(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seat = source["seat"];
	        this.why = source["why"];
	    }
	}
	export class ReviewAsk {
	    marks: review.Marks;
	    to: ReviewAddressee;
	    thread: string;
	    asked: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ReviewAsk(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.marks = this.convertValues(source["marks"], review.Marks);
	        this.to = this.convertValues(source["to"], ReviewAddressee);
	        this.thread = source["thread"];
	        this.asked = source["asked"];
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
	export class ReviewMake {
	    initiative: string;
	    card: string;
	    state: string;
	    started: string;
	    elapsed: number;
	    head: string;
	    error: string;
	    command: string;
	
	    static createFrom(source: any = {}) {
	        return new ReviewMake(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.card = source["card"];
	        this.state = source["state"];
	        this.started = source["started"];
	        this.elapsed = source["elapsed"];
	        this.head = source["head"];
	        this.error = source["error"];
	        this.command = source["command"];
	    }
	}
	export class ReviewStatus {
	    initiative: string;
	    card: string;
	    state: string;
	    head: string;
	    base: string;
	    from: string;
	    map_head: string;
	    map_path: string;
	    reason: string;
	    make?: ReviewMake;
	
	    static createFrom(source: any = {}) {
	        return new ReviewStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.card = source["card"];
	        this.state = source["state"];
	        this.head = source["head"];
	        this.base = source["base"];
	        this.from = source["from"];
	        this.map_head = source["map_head"];
	        this.map_path = source["map_path"];
	        this.reason = source["reason"];
	        this.make = this.convertValues(source["make"], ReviewMake);
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
	
	export class RunsView {
	    initiative: string;
	    input_tokens: number;
	    cards: CardRuns[];
	
	    static createFrom(source: any = {}) {
	        return new RunsView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.initiative = source["initiative"];
	        this.input_tokens = source["input_tokens"];
	        this.cards = this.convertValues(source["cards"], CardRuns);
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
	
	
	export class SleepResult {
	    id: string;
	    action: string;
	    ok: boolean;
	    exit_code: number;
	    output: string;
	    status: string;
	    asleep_since: string;
	    frozen: string[];
	    factory_blind: boolean;
	    factory: FactoryView;
	
	    static createFrom(source: any = {}) {
	        return new SleepResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action = source["action"];
	        this.ok = source["ok"];
	        this.exit_code = source["exit_code"];
	        this.output = source["output"];
	        this.status = source["status"];
	        this.asleep_since = source["asleep_since"];
	        this.frozen = source["frozen"];
	        this.factory_blind = source["factory_blind"];
	        this.factory = this.convertValues(source["factory"], FactoryView);
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
	export class SpecDoc {
	    path: string;
	    text: string;
	    missing: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SpecDoc(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.text = source["text"];
	        this.missing = source["missing"];
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

export namespace usage {
	
	export class Reason {
	    reason: string;
	    sessions: number;
	
	    static createFrom(source: any = {}) {
	        return new Reason(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.reason = source["reason"];
	        this.sessions = source["sessions"];
	    }
	}
	export class RowSession {
	    id: string;
	    name: string;
	    role: string;
	
	    static createFrom(source: any = {}) {
	        return new RowSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.role = source["role"];
	    }
	}
	export class Row {
	    key: string;
	    name: string;
	    initiative?: string;
	    cards?: string[];
	    money: number;
	    share: number;
	    input: number;
	    output: number;
	    cache_read: number;
	    cache_write: number;
	    tokens: number;
	    sessions: number;
	    without_cost: number;
	    not_attributed: boolean;
	    reasons?: Reason[];
	    members?: RowSession[];
	
	    static createFrom(source: any = {}) {
	        return new Row(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.name = source["name"];
	        this.initiative = source["initiative"];
	        this.cards = source["cards"];
	        this.money = source["money"];
	        this.share = source["share"];
	        this.input = source["input"];
	        this.output = source["output"];
	        this.cache_read = source["cache_read"];
	        this.cache_write = source["cache_write"];
	        this.tokens = source["tokens"];
	        this.sessions = source["sessions"];
	        this.without_cost = source["without_cost"];
	        this.not_attributed = source["not_attributed"];
	        this.reasons = this.convertValues(source["reasons"], Reason);
	        this.members = this.convertValues(source["members"], RowSession);
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
	
	export class SessionRow {
	    id: string;
	    name: string;
	    initiative: string;
	    task: string;
	    task_title: string;
	    role: string;
	    reason?: string;
	    model: string;
	    // Go type: time
	    start: any;
	    // Go type: time
	    end: any;
	    minutes: number;
	    active: number;
	    running: boolean;
	    input: number;
	    output: number;
	    cache_read: number;
	    cache_write: number;
	    tokens: number;
	    money?: number;
	    cost_from: string;
	    reset: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SessionRow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.initiative = source["initiative"];
	        this.task = source["task"];
	        this.task_title = source["task_title"];
	        this.role = source["role"];
	        this.reason = source["reason"];
	        this.model = source["model"];
	        this.start = this.convertValues(source["start"], null);
	        this.end = this.convertValues(source["end"], null);
	        this.minutes = source["minutes"];
	        this.active = source["active"];
	        this.running = source["running"];
	        this.input = source["input"];
	        this.output = source["output"];
	        this.cache_read = source["cache_read"];
	        this.cache_write = source["cache_write"];
	        this.tokens = source["tokens"];
	        this.money = source["money"];
	        this.cost_from = source["cost_from"];
	        this.reset = source["reset"];
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
	export class Stats {
	    files: number;
	    files_read: number;
	    bytes_read: number;
	    sessions: number;
	    lines: number;
	    changed: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Stats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.files = source["files"];
	        this.files_read = source["files_read"];
	        this.bytes_read = source["bytes_read"];
	        this.sessions = source["sessions"];
	        this.lines = source["lines"];
	        this.changed = source["changed"];
	    }
	}
	export class Totals {
	    week: string;
	    start: string;
	    end: string;
	    money: number;
	    priced: number;
	    input: number;
	    output: number;
	    cache_read: number;
	    cache_write: number;
	    tokens: number;
	    sessions: number;
	    hours: number;
	    running: number;
	    without_cost: number;
	
	    static createFrom(source: any = {}) {
	        return new Totals(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.week = source["week"];
	        this.start = source["start"];
	        this.end = source["end"];
	        this.money = source["money"];
	        this.priced = source["priced"];
	        this.input = source["input"];
	        this.output = source["output"];
	        this.cache_read = source["cache_read"];
	        this.cache_write = source["cache_write"];
	        this.tokens = source["tokens"];
	        this.sessions = source["sessions"];
	        this.hours = source["hours"];
	        this.running = source["running"];
	        this.without_cost = source["without_cost"];
	    }
	}
	export class WeekPoint {
	    week: string;
	    start: string;
	    money: number;
	    tokens: number;
	    sessions: number;
	    from?: string;
	
	    static createFrom(source: any = {}) {
	        return new WeekPoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.week = source["week"];
	        this.start = source["start"];
	        this.money = source["money"];
	        this.tokens = source["tokens"];
	        this.sessions = source["sessions"];
	        this.from = source["from"];
	    }
	}
	export class View {
	    machine: string;
	    week: string;
	    this_week: Totals;
	    last_week: Totals;
	    first_day: string;
	    history: WeekPoint[];
	    weeks: WeekPoint[];
	    cuts: Record<string, Array<Row>>;
	    sessions: SessionRow[];
	    stats: Stats;
	
	    static createFrom(source: any = {}) {
	        return new View(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.machine = source["machine"];
	        this.week = source["week"];
	        this.this_week = this.convertValues(source["this_week"], Totals);
	        this.last_week = this.convertValues(source["last_week"], Totals);
	        this.first_day = source["first_day"];
	        this.history = this.convertValues(source["history"], WeekPoint);
	        this.weeks = this.convertValues(source["weeks"], WeekPoint);
	        this.cuts = this.convertValues(source["cuts"], Array<Row>, true);
	        this.sessions = this.convertValues(source["sessions"], SessionRow);
	        this.stats = this.convertValues(source["stats"], Stats);
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

