# rm-v0 hand lists for c8e1773 (written before the tool ran)

c8e1773 is the merge of lf30-launch-go; base = c8e1773^1 = 736fce3, head = c8e1773.
Sources: `git diff -U0 c8e1773^1...c8e1773 -- '*.go'` (hunk headers and
bodies read by hand), `git show <rev>:<file>` for the enclosing definition,
`git grep -n '\b<name>\b' c8e1773 -- '*.go'` for callers, each hit read to
name its enclosing function. A definition's range includes its doc comment.

## M2: every Go definition whose body (or doc comment) a hunk touches

Non-test files (`internal/cli/crew.go`, `internal/service/crew.go`,
`internal/service/launch.go`); the import hunk at crew.go:20 is no definition.
`frontend/wailsjs/go/models.ts` changed and must yield no node.

| id | kind | change | why |
|---|---|---|---|
| go:organizer/internal/cli.crewCmd | function | modified | hunks at head 46, 51-57, 59-66, 70-74, 77-79 |
| go:organizer/internal/service.Service.CreateCrew | method | modified | doc comment 443-444, body 446-447 now calls StartCrew |
| go:organizer/internal/service.CrewStart | type | added | new type at head ~451-454 |
| go:organizer/internal/service.liveSeats | var | added | new package var (a func literal), head ~456-480 |
| go:organizer/internal/service.Service.StartCrew | method | added | new at head 482-639 (the old CreateCrew body) |
| go:organizer/internal/service.SeatLaunch | type | modified | field FailedAt added, head 45-48 |
| go:organizer/internal/service.Service.runLaunches | method | modified | head 229, 242, 248 |
| go:organizer/internal/service.Service.RetrySeat | method | modified | head 321 |

Test files (changed test definitions; kind test, not expanded one hop):

| id | change |
|---|---|
| go:organizer/internal/cli.TestCrewCmdPrintsEachState | modified |
| go:organizer/internal/cli.crewHome | added (helper in crew_test.go) |
| go:organizer/internal/cli.TestCrewStandIn | added |
| go:organizer/internal/cli.TestCrewCmdSkipsRunningSeat | added |
| go:organizer/internal/service.crewService | added (helper, crewskip_test.go) |
| go:organizer/internal/service.fakeLive | added (helper, crewskip_test.go) |
| go:organizer/internal/service.TestCreateCrewSkipsRunningSeats | added |
| go:organizer/internal/service.TestCreateCrewAllRunningStartsNothing | added |
| go:organizer/internal/service.TestFailedSeatCarriesFailedAt | added |

No deleted definition.

## M3: three changed functions and their callers in head (non-test)

| changed | caller (enclosing definition of the call) | file:line |
|---|---|---|
| Service.StartCrew | go:organizer/internal/cli.crewCmd | internal/cli/crew.go:46 |
| Service.StartCrew | go:organizer/internal/service.Service.CreateCrew | internal/service/crew.go:446 |
| Service.CreateCrew | go:organizer.App.CreateCrew | app.go:407 |
| Service.runLaunches | go:organizer/internal/service.Service.queueLaunch | internal/service/launch.go:169 |
| Service.runLaunches | go:organizer/internal/service.Service.RetrySeat | internal/service/launch.go:332 (itself changed) |

Callers from `_test.go` files are not callers here; they are the node's
`evidence.tests` (StartCrew: crewskip_test.go TestCreateCrewSkipsRunningSeats,
TestCreateCrewAllRunningStartsNothing, failedat_test.go
TestFailedSeatCarriesFailedAt; Service.CreateCrew: launch_test.go, draft_test.go,
crew_test.go tests; runLaunches: none directly).
