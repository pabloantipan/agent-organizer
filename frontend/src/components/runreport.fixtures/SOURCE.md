# Contract samples for RunReport's tests

Copied byte for byte from agent-mailbox-specs `contracts/factory-report/`
at 54cf10d (holding factory-report 8474386): `expected.json`,
`expected-windows.json`, `expected.txt`. `RunReport.test.tsx` checks the
copies equal the contract's files whenever `CONTRACTS_DIR` is set, so a
moved pin fails there and the copy is refreshed from the new pin.
