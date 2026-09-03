# organizer build, package, install.
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
LDFLAGS  = -X main.version=$(VERSION)
APP      = build/bin/organizer.app
DMG      = build/bin/organizer-$(VERSION).dmg
PLATFORM ?= darwin/arm64
WAILS   ?= $(shell command -v wails 2>/dev/null || echo $(HOME)/go/bin/wails)

.PHONY: build universal dmg install uninstall test clean version

build: ## build the .app for this machine
	$(WAILS) build -clean -platform $(PLATFORM) -ldflags "$(LDFLAGS)"

universal: ## build a universal (arm64 + amd64) .app
	$(MAKE) build PLATFORM=darwin/universal

dmg: build ## package the .app as a drag-to-Applications DMG
	scripts/make-dmg.sh "$(APP)" "$(DMG)"

install: build ## copy to /Applications and link the CLI into ~/.local/bin
	rm -rf /Applications/organizer.app
	cp -R "$(APP)" /Applications/organizer.app
	mkdir -p $(HOME)/.local/bin
	ln -sf /Applications/organizer.app/Contents/MacOS/organizer $(HOME)/.local/bin/organizer
	@echo "installed /Applications/organizer.app and ~/.local/bin/organizer ($(VERSION))"

uninstall:
	rm -rf /Applications/organizer.app $(HOME)/.local/bin/organizer

test:
	go vet ./... && go test ./...

version:
	@echo $(VERSION)

clean:
	rm -rf build/bin frontend/dist
