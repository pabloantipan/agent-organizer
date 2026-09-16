# crew-session-names — progress

Card: `~/organizer/working-on/crew-session-names.md`. Branch `crew-names` in
`.wt/crew-names`, from main after the run-gate merge.

The rule being built: a crew session is `<cell project>-probe-<seat short
name>` (`camp-probe-andrea`), the name the sessions that actually ran had;
`<initiative>-probe-<seat>` is 49 characters for ccint-camp-monorepo and
zellij refuses anything over ~22.

| # | Phase | Gate item | State |
|---|---|---|---|
| 1 | `crewSession(cell, seat)`: cell project, short seat, 22-character budget as an error | 1 | done |
| 2 | `CreateCrew` launches with that name; the prelude exports `AGENT_SESSION` to match | 2 | done |
| 3 | The joins: `buildCrew`, `Retirable`, `PlanRetire` sessions, `scan.AssignAgents` family | 3 | done |
| 4 | Camp fixture (five seats, five sessions) → the five names the run passed by hand | 3, 4 | done |
| 5 | `go test ./...`, the status golden, CLAUDE.md | 5 | done |
