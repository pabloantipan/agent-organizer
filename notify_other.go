//go:build !darwin

// The memory warning's notification is macOS only (notify_darwin.go).
package main

func notifyStart(*App, bool)    {}
func notifyPost(string, string) {}
func notifyState() string       { return "no bundle" }
