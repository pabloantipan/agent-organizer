//go:build !darwin

// The memory warning's notification is macOS only (notify_darwin.go).
package main

func notifyStart(*App)          {}
func notifyPost(string, string) {}
func notifyState() string       { return "no bundle" }
