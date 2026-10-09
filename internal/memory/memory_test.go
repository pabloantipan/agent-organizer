package memory

import (
	"errors"
	"testing"
)

const vmStat = `Mach Virtual Memory Statistics: (page size of 16384 bytes)
Pages free:                                4274.
Pages active:                            319058.
Pages inactive:                          318012.
Pages speculative:                          536.
Pages throttled:                              0.
Pages wired down:                        215050.
Pages purgeable:                           8243.
"Translation faults":                 229417726.
File-backed pages:                       218228.
Anonymous pages:                         419378.
Pages stored in compressor:             1267373.
Pages occupied by compressor:            660288.
`

type fake struct {
	sysctl map[string]string
	vm     string
	err    map[string]error
}

func (f fake) Sysctl(name string) (string, error) {
	if e := f.err[name]; e != nil {
		return "", e
	}
	return f.sysctl[name], nil
}

func (f fake) VMStat() (string, error) {
	if e := f.err["vm_stat"]; e != nil {
		return "", e
	}
	return f.vm, nil
}

func reader(level string) fake {
	return fake{sysctl: map[string]string{"kern.memorystatus_vm_pressure_level": level, "hw.memsize": "25769803776"}, vm: vmStat}
}

// G1: levels 1, 2, 4 read as normal, high, critical; free is the free,
// speculative and file-backed pages.
func TestReadLevels(t *testing.T) {
	for level, want := range map[string]string{"1": Normal, "2": High, "4": Critical} {
		r, err := Read(reader(level))
		if err != nil {
			t.Fatalf("level %s: %v", level, err)
		}
		if r.Pressure != want {
			t.Errorf("level %s: pressure %q, want %q", level, r.Pressure, want)
		}
		free := uint64(4274+536+218228) * 16384
		if r.TotalBytes != 25769803776 || r.FreeBytes != free {
			t.Errorf("level %s: total %d free %d, want free %d", level, r.TotalBytes, r.FreeBytes, free)
		}
	}
}

// G1: a read that fails is an error, never a zero.
func TestReadFails(t *testing.T) {
	cases := map[string]fake{
		"pressure fails": {err: map[string]error{"kern.memorystatus_vm_pressure_level": errors.New("unknown oid")}},
		"level 3":        reader("3"),
		"memsize fails":  func() fake { f := reader("1"); f.err = map[string]error{"hw.memsize": errors.New("nope")}; return f }(),
		"vm_stat fails":  func() fake { f := reader("1"); f.err = map[string]error{"vm_stat": errors.New("nope")}; return f }(),
		"vm_stat empty":  func() fake { f := reader("1"); f.vm = ""; return f }(),
	}
	for name, f := range cases {
		if r, err := Read(f); err == nil {
			t.Errorf("%s: no error, got %+v", name, r)
		}
	}
}
