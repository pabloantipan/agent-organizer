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

type Config struct {
	Machine             string   `yaml:"machine" json:"machine"`
	Roots               []string `yaml:"roots" json:"roots"`
	MaxDepth            int      `yaml:"max_depth" json:"max_depth"`
	IgnoreDirs          []string `yaml:"ignore_dirs" json:"ignore_dirs"`
	GCPProject          string   `yaml:"gcp_project" json:"gcp_project"`
	Namespace           string   `yaml:"namespace" json:"namespace"`
	SyncIntervalMinutes int      `yaml:"sync_interval_minutes" json:"sync_interval_minutes"`
	Editor              string   `yaml:"editor" json:"editor"`
	GitTimeoutSeconds   int      `yaml:"git_timeout_seconds" json:"git_timeout_seconds"`
	// Agent is the command run by "review in terminal". Default claude.
	Agent string `yaml:"agent" json:"agent"`
	// ProbeStateDir holds the probe layouts (one .kdl per session). Empty disables.
	ProbeStateDir string `yaml:"probe_state_dir" json:"probe_state_dir"`
	// Zellij is the zellij binary used to list sessions.
	Zellij string `yaml:"zellij" json:"zellij"`
	// AgentBinary is the process name that counts as an agent. Default claude.
	AgentBinary string `yaml:"agent_binary" json:"agent_binary"`
}

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
		Namespace:           "organizer",
		SyncIntervalMinutes: 15,
		Editor:              "code",
		GitTimeoutSeconds:   5,
		Agent:               "claude",
		ProbeStateDir:       "~/.local/state/probe",
		Zellij:              "/opt/homebrew/bin/zellij",
		AgentBinary:         "claude",
	}
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
