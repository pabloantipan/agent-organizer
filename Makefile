# Deltagos (the organizer app) build, package, install.
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
LDFLAGS  = -X main.version=$(VERSION)
APP      = build/bin/Deltagos.app
DMG      = build/bin/Deltagos-$(VERSION).dmg
PLATFORM ?= darwin/arm64
WAILS   ?= $(shell command -v wails 2>/dev/null || echo $(HOME)/go/bin/wails)

.PHONY: build review-build universal dmg install uninstall test clean version

build: ## build the .app for this machine
	$(WAILS) build -clean -platform $(PLATFORM) -ldflags "$(LDFLAGS)"

review-build: build ## build/bin/Deltagos Review.app: a copy under cl.antipan.organizer.review for reviewers
	scripts/review-build.sh "$(APP)"

universal: ## build a universal (arm64 + amd64) .app
	$(MAKE) build PLATFORM=darwin/universal

dmg: build ## package the .app as a drag-to-Applications DMG
	scripts/make-dmg.sh "$(APP)" "$(DMG)"

install: build ## copy to /Applications and link the CLI into ~/.local/bin
	rm -rf /Applications/organizer.app /Applications/Deltagos.app
	cp -R "$(APP)" /Applications/Deltagos.app
	mkdir -p $(HOME)/.local/bin
	ln -sf /Applications/Deltagos.app/Contents/MacOS/organizer $(HOME)/.local/bin/organizer
	@echo "installed /Applications/Deltagos.app and ~/.local/bin/organizer ($(VERSION))"

uninstall: ## remove the app under either name and the CLI link
	rm -rf /Applications/Deltagos.app /Applications/organizer.app $(HOME)/.local/bin/organizer

test: ## go vet, go test, then the frontend's vitest run
	go vet ./... && go test ./...
	cd frontend && npm test

version:
	@echo $(VERSION)

clean:
	rm -rf build/bin frontend/dist
