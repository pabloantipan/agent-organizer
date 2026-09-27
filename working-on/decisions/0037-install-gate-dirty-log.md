---
title: The install's gate item 1 is met by the binary's clean version
status: withdrawn
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [the binary's version is the proof, pin VERSION and reinstall]
chosen:
cards: [install-current-build]
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

The review of `install-current-build` failed gate item 1
(a51835b): the `make install` log ends with
`v0.2.0-229-g3472f6b-dirty`. The reviewer notes that the installed binary
reports the clean describe. The FSE wrote the gate: item 1 says "succeeds,
its output tail as evidence", and item 2 checks the binary's version. It did
not say which one proves the version, so the gate is ambiguous. That is the
owner's to settle, not the reviewer's or the FSE's (the fse skill).

The likely cause is that the Makefile's `VERSION` is a lazy `=`, so the
closing echo re-runs `git describe` after the builder's card edit dirtied
the tree. This is not verified.

## Options

- **the binary's version is the proof**: item 2, the binary's clean
  describe, shows the right build is installed; item 1 needs only that
  `make install` succeeded. The card passes on re-review with no rebuild.
  The Makefile's lazy `VERSION` goes to the FSE's open questions as a
  candidate card.
- **pin VERSION and reinstall**: a card changes the Makefile to
  `VERSION :=` (a source change, outside this card's boundary); then
  reinstall and re-review. One more small task before Pablo sees stage 2.

## Recommendation

The FSE's: the binary's version is the proof. The installed app is the right
build; the dirty suffix is in the log line, not in the app.

## Ruling

Withdrawn by the FSE, 2026-09-27: a second review passed the card before
Pablo ruled (a2ee7ad). Both binaries carry the clean describe; the dirty
suffix came from make re-evaluating VERSION after the build. Nothing is
left to decide. sup7 later reported that the failing check was in its review
prompt, not in the gate (thread 01M3J29YBHEVGYG277K7WTD696). The Makefile item is in the FSE's open questions.

## Consequences

The first option: the FSE rewrites the card's `next` to a re-review against
this ruling, and logs the Makefile item. The second: the FSE cuts the
Makefile card for sup7.
