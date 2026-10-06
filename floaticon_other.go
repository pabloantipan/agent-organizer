//go:build !darwin

// The floating icon is macOS only (floaticon_darwin.go); elsewhere every call
// is a no-op and the top bar shows no Compact to icon.
package main

import "context"

func floatIconStart(context.Context) {}

func (a *App) FloatAvailable() bool { return false }
func (a *App) FloatCompact()        {}
func (a *App) FloatPick()           {}
func (a *App) FloatDismiss()        {}
func (a *App) FloatListHeight(int)  {}
