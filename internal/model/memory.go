package model

import "time"

// Memory is this Mac's memory on the agents feed (docs/specs/ram-indicator.md
// FR-1, FR-2, FR-4). Bytes are bytes.
type Memory struct {
	// Pressure is normal, high or critical (kern.memorystatus_vm_pressure_level).
	Pressure string `json:"pressure"`
	// Since is when the current level began, or the app's first sample when
	// the level was already there; SinceOpened says which.
	Since       time.Time `json:"since"`
	SinceOpened bool      `json:"since_opened"`
	// WasCriticalUntil is when critical last ended, kept 30 minutes; nil
	// otherwise and while critical.
	WasCriticalUntil *time.Time `json:"was_critical_until"`
	TotalBytes       uint64     `json:"total_bytes"`
	// FreeBytes is Activity Monitor's available: its Physical Memory less
	// Memory Used (free, speculative and file-backed pages).
	FreeBytes uint64 `json:"free_bytes"`
	// Top is the five biggest agent sessions, biggest first.
	Top []MemorySession `json:"top"`
	// AgentsBytes is every agent session together.
	AgentsBytes uint64 `json:"agents_bytes"`
	// ByInitiative is each initiative running agents, unassigned agents as one
	// more row, biggest first; the rows sum to AgentsBytes.
	ByInitiative []MemoryInitiative `json:"by_initiative"`
	// Warn is true on the one sample that should notify (FR-4).
	Warn bool `json:"warn"`
}

// MemorySession is one session's memory: its agents summed.
type MemorySession struct {
	// Name is the session name, else "pid <n>".
	Name       string `json:"name"`
	Initiative string `json:"initiative"` // empty when unassigned
	Bytes      uint64 `json:"bytes"`
	// AgentID is the Agents row's key, `<session>#<pid>` of its first agent.
	AgentID string `json:"agent_id"`
}

// MemoryInitiative is one initiative's agents together.
type MemoryInitiative struct {
	Initiative string `json:"initiative"` // empty on the unassigned row
	Unassigned bool   `json:"unassigned"`
	Bytes      uint64 `json:"bytes"`
	Agents     int    `json:"agents"`
}
