package cli

import (
	"context"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/record"
	"organizer/internal/service"
)

// factoryKeyCmd makes this laptop a factory: it signs the developer in when
// needed, asks the record for a key and writes it to push.key. The key is
// never printed. --rotate issues the new key, writes it, then revokes the old.
func factoryKeyCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	rotate := false
	for _, a := range args {
		switch a {
		case "--rotate":
			rotate = true
		default:
			fmt.Fprintf(stderr, "unknown flag %s\nusage: organizer factory-key [--rotate]\n", a)
			return 2
		}
	}
	if cfg.RecordURL == "" {
		fmt.Fprintln(stderr, "record_url is not set in", config.Path())
		return 2
	}
	svc := service.NewWith(cfg, cache.State{}, now)
	if !svc.Auth.Account().SignedIn {
		if rc := loginCmd(cfg, nil, stdout, stderr, now); rc != 0 {
			return rc
		}
		// loginCmd remembered the session in the keychain; pick it up.
		svc = service.NewWith(cfg, cache.State{}, now)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	factory, err := svc.FactoryKey(ctx, rotate)
	if errors.Is(err, service.ErrNotSignedIn) {
		fmt.Fprintln(stderr, "not signed in; run organizer login")
		return 1
	}
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	path := filepath.Join(config.Expand(cfg.DiscussStateDir), record.KeyFile)
	if rotate {
		fmt.Fprintf(stdout, "factory %s: new key written to %s (0600); the previous key is revoked\n", factory, path)
	} else {
		fmt.Fprintf(stdout, "factory %s: key written to %s (0600)\n", factory, path)
	}
	return 0
}
