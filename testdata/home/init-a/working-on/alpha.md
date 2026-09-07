---
title: Alpha card
status: now
repos: [repo-one]
branch: feat/alpha
updated: 2026-08-30
next: "Finish alpha"
due: 2026-09-12
threads: [01M1N893SRYKX2F6H6G9WCCCMA]
depends_on: [beta]
boundary: ["repo-one/src/", "repo-one/README.md"]
spec: "docs/alpha.md#shape"
gate: "go test ./... green and the golden refreshed"
review: "tech lead reads the diff before merge"
---

## Goal
Alpha.
