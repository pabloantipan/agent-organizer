package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"organizer/internal/auth"
	"organizer/internal/config"
	"organizer/internal/record"
)

// FactoryKey issues this laptop's factory key from the record as the signed-in
// developer and writes it to push.key in the discuss state dir, 0600. With
// rotate, the new key is issued and written first and the old one revoked
// after, so the pusher is never without a key. The key is returned to nobody:
// it goes to the file and nowhere else, and never into a log line. Returns
// the factory id the key belongs to.
func (s *Service) FactoryKey(ctx context.Context, rotate bool) (string, error) {
	return factoryKey(ctx, s.Config(), s.Auth.Token, rotate)
}

// factoryKey is FactoryKey with the developer token injectable for tests.
func factoryKey(ctx context.Context, cfg config.Config, token func(context.Context) (string, error), rotate bool) (string, error) {
	if strings.TrimSpace(cfg.RecordURL) == "" {
		return "", errors.New("record_url is not set in " + config.Path())
	}
	dir := discussStateDir(cfg)
	devToken, err := token(ctx)
	if errors.Is(err, auth.ErrSignedOut) {
		return "", ErrNotSignedIn
	}
	if err != nil {
		return "", err
	}
	factory, err := record.Factory(dir)
	if errors.Is(err, os.ErrNotExist) {
		// The factory is this machine, by the spec; record it once so the
		// pusher and every later run agree.
		factory = cfg.Machine
		if err := record.WriteFactory(dir, factory); err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}
	var old string
	if rotate {
		old, err = record.ReadKey(dir)
		if errors.Is(err, os.ErrNotExist) {
			return "", errors.New("no key to rotate; run organizer factory-key first")
		}
		if err != nil {
			return "", err
		}
	}
	rc := record.New(cfg.RecordURL)
	key, err := rc.IssueKey(ctx, devToken, factory)
	if err != nil {
		return "", err
	}
	if err := record.WriteKey(dir, key); err != nil {
		return "", err
	}
	if rotate {
		if err := rc.RevokeKey(ctx, devToken, factory, record.KeyHash(old)); err != nil {
			return factory, fmt.Errorf("new key written but the old one is still valid: %w", err)
		}
	}
	return factory, nil
}

// discussStateDir is where discuss-api keeps its socket, tokens and the
// pusher's files.
func discussStateDir(cfg config.Config) string {
	if d := config.Expand(cfg.DiscussStateDir); d != "" {
		return d
	}
	if d := os.Getenv("DISCUSS_STATE_DIR"); d != "" {
		return d
	}
	home, _ := os.UserHomeDir()
	return home + "/.local/state/discuss"
}
