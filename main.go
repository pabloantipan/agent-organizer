package main

import (
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"organizer/internal/cli"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Same binary, two faces: a known subcommand runs the CLI and exits;
	// anything else (including no args, or macOS launch args) is the app.
	if len(os.Args) > 1 && cli.IsSubcommand(os.Args[1]) {
		os.Exit(cli.Run(os.Args[1:], os.Stdout, os.Stderr))
	}

	app := NewApp()
	err := wails.Run(&options.App{
		Title:     "organizer",
		Width:     1440,
		Height:    900,
		MinWidth:  1024,
		MinHeight: 640,
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
