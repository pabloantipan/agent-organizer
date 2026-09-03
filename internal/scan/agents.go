package scan

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"organizer/internal/model"
)

var (
	cwdRe     = regexp.MustCompile(`(?m)^\s*cwd\s+"([^"]+)"`)
	sessionRe = regexp.MustCompile(`^(\S+)\s+\[Created\s+(.*?)\s+ago\]\s*(\(EXITED.*\))?`)
	nameArgRe = regexp.MustCompile(`(?:^|\s)(?:-n|--resume)\s+'?"?([^'"\s]+)`)
)

// AgentOptions configures agent discovery.
type AgentOptions struct {
	ProbeStateDir string
	Zellij        string
	AgentBinary   string // basename of the agent command, default claude
	Timeout       time.Duration
	// PrevCPU holds CPU seconds per pid from the previous sample and PrevAt
	// its time. A pid whose CPU rate over the interval exceeds WorkingRate
	// (fraction of one core, default 0.01) is working.
	PrevCPU     map[int]float64
	PrevAt      time.Time
	WorkingRate float64
}

type zsession struct {
	name, created, dir string
	exited             bool
	hasLayout          bool
}

// Agents lists agent processes and sessions on this machine.
func Agents(o AgentOptions) []model.Agent {
	if o.Timeout <= 0 {
		o.Timeout = 5 * time.Second
	}
	if o.AgentBinary == "" {
		o.AgentBinary = "claude"
	}
	sessions := zellijSessions(o)
	procs := agentProcesses(o)

	var out []model.Agent
	used := map[string]bool{}
	for _, p := range procs {
		a := p
		if zs, ok := sessions[p.Session]; ok && p.Session != "" {
			used[p.Session] = true
			a.Created = zs.created
			if a.Dir == "" {
				a.Dir = zs.dir
			}
			a.Kind = kindOf(p.Session, zs.hasLayout)
		} else {
			a.Kind = "terminal"
		}
		if a.Name == "" {
			a.Name = filepath.Base(a.Dir)
		}
		out = append(out, a)
	}
	for name, zs := range sessions {
		if used[name] {
			continue
		}
		a := model.Agent{Name: name, Session: name, Dir: zs.dir, Created: zs.created, Kind: kindOf(name, zs.hasLayout)}
		a.Family, a.Short = splitProbe(name)
		if zs.exited {
			a.State = model.AgentExited
		} else {
			a.State = model.AgentShell
		}
		out = append(out, a)
	}
	sort.Slice(out, func(i, j int) bool {
		if ri, rj := stateRank(out[i].State), stateRank(out[j].State); ri != rj {
			return ri < rj
		}
		return out[i].Name < out[j].Name
	})
	return out
}

func stateRank(s string) int {
	switch s {
	case model.AgentWorking:
		return 0
	case model.AgentRunning:
		return 1
	case model.AgentShell:
		return 2
	}
	return 3
}

func kindOf(name string, hasLayout bool) string {
	if hasLayout || strings.Contains(name, "probe-") {
		return "probe"
	}
	return "zellij"
}

// zellijSessions merges `zellij list-sessions -n` with the probe layouts.
func zellijSessions(o AgentOptions) map[string]zsession {
	res := map[string]zsession{}
	if o.ProbeStateDir != "" {
		if entries, err := os.ReadDir(o.ProbeStateDir); err == nil {
			for _, e := range entries {
				if e.IsDir() || !strings.HasSuffix(e.Name(), ".kdl") {
					continue
				}
				b, err := os.ReadFile(filepath.Join(o.ProbeStateDir, e.Name()))
				if err != nil {
					continue
				}
				name := strings.TrimSuffix(e.Name(), ".kdl")
				zs := zsession{name: name, exited: true, hasLayout: true}
				if m := cwdRe.FindSubmatch(b); m != nil {
					zs.dir = string(m[1])
				}
				res[name] = zs
			}
		}
	}
	for _, line := range strings.Split(runCmd(o.Zellij, o.Timeout, "list-sessions", "-n"), "\n") {
		m := sessionRe.FindStringSubmatch(strings.TrimSpace(line))
		if m == nil {
			continue
		}
		zs := res[m[1]]
		zs.name = m[1]
		zs.created = shortAge(m[2])
		zs.exited = m[3] != ""
		res[m[1]] = zs
	}
	return res
}

// agentProcesses reads the process table for the agent binary and resolves
// each process's working directory in one lsof call.
func agentProcesses(o AgentOptions) []model.Agent {
	out := runCmd("ps", o.Timeout, "-axo", "pid=,etime=,tty=,time=,command=")
	var procs []model.Agent
	for _, line := range strings.Split(out, "\n") {
		f := strings.Fields(line)
		if len(f) < 5 {
			continue
		}
		cmd := f[4]
		if filepath.Base(cmd) != o.AgentBinary {
			continue
		}
		pid, err := strconv.Atoi(f[0])
		if err != nil {
			continue
		}
		args := strings.Join(f[5:], " ")
		a := model.Agent{PID: pid, Uptime: f[1], TTY: f[2], CPUSeconds: parseCPUTime(f[3]), State: model.AgentRunning}
		if m := nameArgRe.FindStringSubmatch(" " + args); m != nil {
			a.Session = m[1]
			a.Name = m[1]
			a.Family, a.Short = splitProbe(m[1])
		}
		if prev, ok := o.PrevCPU[pid]; ok && !o.PrevAt.IsZero() {
			elapsed := time.Since(o.PrevAt).Seconds()
			rate := o.WorkingRate
			if rate <= 0 {
				rate = 0.01
			}
			if elapsed > 0 && (a.CPUSeconds-prev)/elapsed >= rate {
				a.State = model.AgentWorking
			}
		}
		procs = append(procs, a)
	}
	if len(procs) == 0 {
		return nil
	}
	ids := make([]string, len(procs))
	for i, p := range procs {
		ids[i] = strconv.Itoa(p.PID)
	}
	cwds := map[int]string{}
	cur := 0
	for _, line := range strings.Split(runCmd("lsof", o.Timeout, "-a", "-p", strings.Join(ids, ","), "-d", "cwd", "-Fpn"), "\n") {
		if len(line) < 2 {
			continue
		}
		switch line[0] {
		case 'p':
			cur, _ = strconv.Atoi(line[1:])
		case 'n':
			cwds[cur] = line[1:]
		}
	}
	for i := range procs {
		procs[i].Dir = cwds[procs[i].PID]
	}
	return procs
}

// parseCPUTime handles ps TIME like "1:02.33", "12:34:56", "3-01:02:03".
func parseCPUTime(s string) float64 {
	days := 0.0
	if i := strings.Index(s, "-"); i > 0 {
		d, _ := strconv.Atoi(s[:i])
		days = float64(d)
		s = s[i+1:]
	}
	parts := strings.Split(s, ":")
	total := 0.0
	for _, p := range parts {
		v, _ := strconv.ParseFloat(p, 64)
		total = total*60 + v
	}
	return total + days*86400
}

func runCmd(bin string, timeout time.Duration, args ...string) string {
	if bin == "" {
		return ""
	}
	if _, err := exec.LookPath(bin); err != nil {
		if _, err := os.Stat(bin); err != nil {
			return ""
		}
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, bin, args...)
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	_ = cmd.Run()
	return stdout.String()
}

// splitProbe: "shop-probe-dog-11" -> ("shop", "dog-11"); "probe-fox-1" -> ("", "fox-1");
// anything else -> ("", name).
func splitProbe(name string) (family, short string) {
	i := strings.Index(name, "probe-")
	if i < 0 {
		return "", name
	}
	return strings.TrimSuffix(name[:i], "-"), name[i+len("probe-"):]
}

// shortAge keeps the two most significant units of zellij's age text.
func shortAge(s string) string {
	f := strings.Fields(s)
	if len(f) > 2 {
		f = f[:2]
	}
	return strings.Join(f, " ")
}

// AssignAgents attaches each agent to the initiative whose root is the longest
// prefix of its directory, then by probe family. The rest are returned.
func AssignAgents(inits []model.ScannedInitiative, agents []model.Agent) []model.Agent {
	for i := range inits {
		inits[i].Agents = nil
	}
	var unassigned []model.Agent
	for _, a := range agents {
		best, bestLen := -1, -1
		if a.Dir != "" {
			for i := range inits {
				root := filepath.Clean(inits[i].Path)
				if a.Dir == root || strings.HasPrefix(a.Dir, root+string(filepath.Separator)) {
					if len(root) > bestLen {
						best, bestLen = i, len(root)
					}
				}
			}
		}
		if best < 0 && a.Family != "" {
			for i := range inits {
				if inits[i].ID == a.Family {
					best = i
					break
				}
			}
		}
		if best >= 0 {
			inits[best].Agents = append(inits[best].Agents, a)
		} else {
			unassigned = append(unassigned, a)
		}
	}
	return unassigned
}
