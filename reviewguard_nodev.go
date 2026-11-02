//go:build !dev

package main

// devBuild is false for every build but `wails dev` (leftovers-65 FR-1).
const devBuild = false
