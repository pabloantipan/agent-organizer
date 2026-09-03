package sync

import (
	"context"

	"cloud.google.com/go/datastore"
)

// dsClient is the slice of *datastore.Client this package uses. Keeping it
// small makes the fake in tests trivial.
type dsClient interface {
	PutMulti(ctx context.Context, keys []*datastore.Key, src any) ([]*datastore.Key, error)
	GetAll(ctx context.Context, q *datastore.Query, dst any) ([]*datastore.Key, error)
	Close() error
}

var _ dsClient = (*datastore.Client)(nil)
