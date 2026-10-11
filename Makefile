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
	@# Wails 2.15 rewrites frontend/wailsjs/runtime/ byte for byte at 0644, and
	@# git holds those three files 0644, so neither this nor a bare wails build
	@# dirties the tree (leftovers-15 FR-12, leftovers-18 FR-11).
	@# Wails 2.15 always makes the .icns from build/appicon.png; the exported one
	@# (floating-icon Amendment 5) carries the 16 and 32 px cuts, so it replaces it.
	@# Wails copies no other resource, so the Icon Composer car (Amendment 6,
	@# CFBundleIconName, scripts/app-icon-car.sh) goes in here too.
	cp build/darwin/iconfile.icns "$(APP)/Contents/Resources/iconfile.icns"
	cp build/darwin/Assets.car "$(APP)/Contents/Resources/Assets.car"
	codesign --force --deep --sign - "$(APP)"

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
	@# main.go embeds frontend/dist: from a clean checkout, build it first
	@# (leftovers-8 FR-8), installing the frontend's packages if missing.
	@# pnpm from its lockfile, as wails build does (wails.json), so no
	@# package-lock.json is left behind (leftovers-19 FR-9).
	test -d frontend/node_modules || (cd frontend && pnpm install --frozen-lockfile)
	test -f frontend/dist/index.html || (cd frontend && pnpm run build)
	go vet ./... && go test ./...
	cd frontend && pnpm test

version:
	@echo $(VERSION)

clean:
	rm -rf build/bin frontend/dist
