package cli

import (
	"fmt"
	"io"
	"strings"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

const ruleUsage = `usage: organizer rule <initiative> <NNNN> --chosen <option> --words <text>

Write a ruling into a proposed decision record, whoever owns it, and commit
that one file: status: ruled, ruled, ruled_by, chosen and a ## Ruling section.
ruled_by is the person who rules, the cell's human else pablo, not the owner;
the Ruling line names the owner when someone else ruled (0045). Every other
byte of the record is left as it was.

  <initiative>   an initiative id (organizer status)
  <NNNN>         a record number (organizer decisions <initiative>)
  --chosen       one of the record's options, spelled as the record spells it
  --words        the ruling in the ruler's own words

It refuses a record that is not proposed, a chosen value that is not one of
the options, and empty words, and writes nothing when it does.`

// takeValue pulls `--name value` or `--name=value` out of args wherever it
// sits, so the verb reads the same in any order (takeFlag's shape for a flag
// that carries a value).
func takeValue(args []string, name string) ([]string, string, bool) {
	var rest []string
	value, found := "", false
	for i := 0; i < len(args); i++ {
		switch {
		case args[i] == name && i+1 < len(args):
			value, found = args[i+1], true
			i++
		case args[i] == name:
			found = true
		case strings.HasPrefix(args[i], name+"="):
			value, found = strings.TrimPrefix(args[i], name+"="), true
		default:
			rest = append(rest, args[i])
		}
	}
	return rest, value, found
}

// ruleCmd is the same path as the app's Rule box: FR-13's write, from the
// terminal (0019).
func ruleCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, longHelp := takeFlag(args, "--help")
	args, shortHelp := takeFlag(args, "-h")
	if longHelp || shortHelp {
		fmt.Fprintln(stdout, ruleUsage)
		return 0
	}
	args, chosen, _ := takeValue(args, "--chosen")
	args, words, _ := takeValue(args, "--words")
	if len(args) != 2 {
		fmt.Fprintln(stderr, ruleUsage)
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	if err := svc.RuleDecision(args[0], args[1], chosen, words); err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Fprintf(stdout, "%s %s ruled: %s. Committed the record.\n", args[0], args[1], chosen)
	return 0
}
