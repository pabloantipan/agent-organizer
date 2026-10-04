// Package config reads and writes ~/.config/organizer/config.yaml.
package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// Auth modes. Identity is opt-in: the organizer runs without one, and when
// it gets one it is Azure Entra ID, not this Firebase email flow.
const (
	AuthOff      = "off"
	AuthFirebase = "firebase"
)

type Config struct {
	Machine    string   `yaml:"machine" json:"machine"`
	Roots      []string `yaml:"roots" json:"roots"`
	MaxDepth   int      `yaml:"max_depth" json:"max_depth"`
	IgnoreDirs []string `yaml:"ignore_dirs" json:"ignore_dirs"`
	GCPProject string   `yaml:"gcp_project" json:"gcp_project"`
	// Auth is the identity mode: "off" (the default) means no sign-in
	// anywhere — no gate, no account UI, sync skipped; "firebase" is the
	// email flow of internal/auth.
	Auth string `yaml:"auth" json:"auth"`
	// FirebaseAPIKey is the web API key of the Firebase project (public by design).
	FirebaseAPIKey string `yaml:"firebase_api_key" json:"firebase_api_key"`
	// FirestoreDatabase is the named Firestore database in native mode.
	FirestoreDatabase   string `yaml:"firestore_database" json:"firestore_database"`
	SyncIntervalMinutes int    `yaml:"sync_interval_minutes" json:"sync_interval_minutes"`
	Editor              string `yaml:"editor" json:"editor"`
	GitTimeoutSeconds   int    `yaml:"git_timeout_seconds" json:"git_timeout_seconds"`
	// Agent is the command run by "review in terminal". Default claude.
	Agent string `yaml:"agent" json:"agent"`
	// ProbeStateDir holds the probe layouts (one .kdl per session). Empty disables.
	ProbeStateDir string `yaml:"probe_state_dir" json:"probe_state_dir"`
	// Zellij is the zellij binary used to list sessions.
	Zellij string `yaml:"zellij" json:"zellij"`
	// AgentBinary is the process name that counts as an agent. Default claude.
	AgentBinary string `yaml:"agent_binary" json:"agent_binary"`
	// DiscussStateDir holds the discuss socket and token registry, and the
	// files the pusher reads: push.key, factory, projects.json.
	DiscussStateDir string `yaml:"discuss_state_dir" json:"discuss_state_dir"`
	// CannedHealth names a JSON file read in place of the discuss health
	// endpoint: {"<project>": {"agents": [...], "threads": [...]}}, the
	// endpoint's own shape per project. A test seam for the fixture, where
	// deaf and capped cannot be made on demand; empty (the default) asks
	// discuss as always.
	CannedHealth string `yaml:"canned_health" json:"canned_health"`
	// CrewModel is the model crew seats start with (ANTHROPIC_MODEL in the
	// prelude, which beats the settings file). A cell.json "model" overrides
	// it. Default opus: personas reason and talk, they do not need the top tier.
	CrewModel string `yaml:"crew_model" json:"crew_model"`
	// RecordURL is the origin of discuss-record, the service a factory pushes
	// its cell events to. Empty means this laptop is not a factory yet:
	// `organizer factory-key` refuses and the crew skips registration.
	RecordURL string `yaml:"record_url" json:"record_url"`
	// HelpDoc is the markdown file the Help renders, read each time the Help
	// opens and never copied. Hephaistos owns its content.
	HelpDoc string `yaml:"help_doc" json:"help_doc"`
	// Roles are the transversal seats Deltagos shows apart from the
	// initiatives (spec docs/ux/specs/transversal-roles.md, 0082). The key
	// absent gives DefaultRoles; `roles: []` gives none.
	Roles []Role `yaml:"roles" json:"roles"`
}

// Role is one transversal role: how its sessions are recognised and where it
// keeps its bitácora. Deltagos only shows a role, it never starts one.
type Role struct {
	Name        string `yaml:"name" json:"name"`
	Description string `yaml:"description" json:"description"`
	// Sessions is a glob (path.Match) on the zellij session name.
	Sessions string `yaml:"sessions" json:"sessions"`
	// Bitacora is a path; `<initiative>` stands for each scanned initiative
	// root, and a leading ~ is the home directory.
	Bitacora string `yaml:"bitacora" json:"bitacora"`
	// Here is false for a role that runs on another machine: it is named,
	// and nothing else about it is looked up.
	Here bool `yaml:"here" json:"here"`
}

// InitiativeToken is the placeholder a role's bitácora path uses for an
// initiative root.
const InitiativeToken = "<initiative>"

// DefaultRoles is the spec's "Which roles" table, in its order (Daedalus in,
// 0083).
func DefaultRoles() []Role {
	return []Role{
		{Name: "Hephaistos", Description: "Forges the agent factory with Pablo: skills, seats, shared primitives", Sessions: "probe-hefesto*", Bitacora: "~/agent-slack/docs/bitacora/hephaistos_bitacora.md", Here: true},
		{Name: "Aglaea", Description: "Product designer: UI, user research and validation, one seat per initiative", Sessions: "*-probe-aglaea", Bitacora: InitiativeToken + "/docs/bitacora/aglaea_bitacora.md", Here: true},
		{Name: "Ariadna", Description: "Business analyst beside a non-technical person", Sessions: "*-probe-ariadna", Bitacora: InitiativeToken + "/docs/bitacora/ariadna_bitacora.md", Here: true},
		{Name: "Daedalus", Description: "Head of architecture: reviews a solution from an initiative's docs", Sessions: "*-probe-daedalus", Bitacora: InitiativeToken + "/docs/bitacora/daedalus_bitacora.md", Here: true},
		{Name: "Talos", Description: "PLV infra, on odyssey", Here: false},
		{Name: "Hermione", Description: "PLV infra, on odyssey", Here: false},
	}
}

// DefaultHelpDoc is the Help's source when help_doc is not set.
const DefaultHelpDoc = "~/agent-slack/docs/how-we-build.md"

// Default returns the config used when no file exists yet.
func Default() Config {
	host, _ := os.Hostname()
	if i := strings.IndexByte(host, '.'); i > 0 {
		host = host[:i]
	}
	return Config{
		Machine:  host,
		Roots:    []string{"~"},
		MaxDepth: 3,
		IgnoreDirs: []string{
			"node_modules", "vendor", "dist", "build", "target",
			"Library", "Applications", "Movies", "Music", "Pictures", "Public",
			"Downloads", "Desktop", "Documents", "go", "flutter", "google-cloud-sdk",
		},
		Auth:                AuthOff,
		FirestoreDatabase:   "organizer",
		SyncIntervalMinutes: 15,
		Editor:              "code",
		GitTimeoutSeconds:   5,
		Agent:               "claude",
		ProbeStateDir:       "~/.local/state/probe",
		Zellij:              "/opt/homebrew/bin/zellij",
		AgentBinary:         "claude",
		DiscussStateDir:     "~/.local/state/discuss",
		CrewModel:           "opus",
		HelpDoc:             DefaultHelpDoc,
		Roles:               DefaultRoles(),
	}
}

// AuthMode is the identity mode this config asks for. Anything other than an
// explicit "firebase" is off: a typo must not put a sign-in screen back in
// front of the board.
func (c Config) AuthMode() string {
	if strings.EqualFold(strings.TrimSpace(c.Auth), AuthFirebase) {
		return AuthFirebase
	}
	return AuthOff
}

// HelpDocPath is help_doc with ~ expanded, the default when it is empty.
func (c Config) HelpDocPath() string {
	p := strings.TrimSpace(c.HelpDoc)
	if p == "" {
		p = DefaultHelpDoc
	}
	return Expand(p)
}

// Path is where the config file lives.
func Path() string {
	if p := os.Getenv("ORGANIZER_CONFIG"); p != "" {
		return p
	}
	base := os.Getenv("XDG_CONFIG_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".config")
	}
	return filepath.Join(base, "organizer", "config.yaml")
}

// Load reads the config file. When the file does not exist it returns
// Default() and created=false; nothing is written.
func Load() (cfg Config, created bool, err error) {
	cfg = Default()
	b, rerr := os.ReadFile(Path())
	if errors.Is(rerr, os.ErrNotExist) {
		return cfg, false, nil
	}
	if rerr != nil {
		return cfg, false, rerr
	}
	if err := yaml.Unmarshal(b, &cfg); err != nil {
		return cfg, false, fmt.Errorf("parse %s: %w", Path(), err)
	}
	if cfg.MaxDepth <= 0 {
		cfg.MaxDepth = 3
	}
	if cfg.GitTimeoutSeconds <= 0 {
		cfg.GitTimeoutSeconds = 5
	}
	return cfg, true, nil
}

// Save writes the config file, creating the directory.
func Save(cfg Config) error {
	p := Path()
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return err
	}
	b, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}
	return os.WriteFile(p, b, 0o644)
}

// Expand resolves a leading ~ in a path.
func Expand(p string) string {
	home, _ := os.UserHomeDir()
	if p == "~" {
		return home
	}
	if strings.HasPrefix(p, "~/") {
		return filepath.Join(home, p[2:])
	}
	return p
}

// ExpandedRoots returns roots with a leading ~ resolved and duplicates removed.
func (c Config) ExpandedRoots() []string {
	home, _ := os.UserHomeDir()
	seen := map[string]bool{}
	var out []string
	for _, r := range c.Roots {
		if r == "~" {
			r = home
		} else if strings.HasPrefix(r, "~/") {
			r = filepath.Join(home, r[2:])
		}
		r = filepath.Clean(r)
		if !seen[r] {
			seen[r] = true
			out = append(out, r)
		}
	}
	return out
}
