package main

import (
	"embed"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"organizer/internal/cli"
)

//go:embed all:frontend/dist
var assets embed.FS

// version is set at build time: -ldflags "-X main.version=v0.1.0".
var version = "dev"

func main() {
	cli.Version = version
	// Same binary, two faces: a known subcommand runs the CLI and exits;
	// anything else (including no args, or macOS launch args) is the app.
	if len(os.Args) > 1 && cli.IsSubcommand(os.Args[1]) {
		os.Exit(cli.Run(os.Args[1:], os.Stdout, os.Stderr))
	}

	app := NewApp()
	err := wails.Run(&options.App{
		Logger:             appLogger(),
		LogLevel:           logger.INFO,
		LogLevelProduction: logger.INFO,
		Title:              windowTitle(),
		Width:              1440,
		Height:             900,
		MinWidth:           1024,
		MinHeight:          640,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}

// windowTitle is the bundle's display name, else its name, else Deltagos:
// the review build (scripts/review-build.sh renames its copy) says
// "Deltagos Review", so nobody types into a reviewer's window thinking it
// is the lead's (leftovers-13 FR-3). Outside a bundle (wails dev, go run)
// there is no Info.plist and the title is Deltagos.
func windowTitle() string {
	exe, err := os.Executable()
	if err != nil {
		return "Deltagos"
	}
	plist := filepath.Join(filepath.Dir(filepath.Dir(exe)), "Info.plist")
	if _, err := os.Stat(plist); err != nil {
		return "Deltagos"
	}
	for _, key := range []string{"CFBundleDisplayName", "CFBundleName"} {
		out, err := exec.Command("/usr/bin/plutil", "-extract", key, "raw", "-o", "-", plist).Output()
		if name := strings.TrimSpace(string(out)); err == nil && name != "" {
			return name
		}
	}
	return "Deltagos"
}

// appLogger writes to ~/.local/share/organizer/organizer.log so a crash or a
// failed sync leaves a trace when the app was launched from Finder.
func appLogger() logger.Logger {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	dir := filepath.Join(base, "organizer")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return logger.NewDefaultLogger()
	}
	return logger.NewFileLogger(filepath.Join(dir, "organizer.log"))
}
