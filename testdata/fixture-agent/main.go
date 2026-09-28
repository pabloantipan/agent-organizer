// Command fixture-agent is the stand-in agent scripts/fixture-home.sh starts:
// it sleeps for the seconds given (default six hours) and does nothing else.
// /bin/sleep will not do where an identity is involved: macOS hides a
// platform binary's environment from ps -E, and the scan reads AGENT_NAME,
// PROJECT_ID and AGENT_SESSION from there.
package main

import (
	"os"
	"strconv"
	"time"
)

func main() {
	secs := 21600
	if len(os.Args) > 1 {
		if n, err := strconv.Atoi(os.Args[1]); err == nil {
			secs = n
		}
	}
	time.Sleep(time.Duration(secs) * time.Second)
}
