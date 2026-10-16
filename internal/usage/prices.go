package usage

// Price is one model's price in dollars per million tokens of each kind
// (usage-audit FR-4), with the day it was checked and where.
type Price struct {
	Input        float64
	Output       float64
	CacheRead    float64
	CacheWrite5m float64 // a cache write kept 5 minutes
	CacheWrite1h float64 // a cache write kept an hour
	Checked      string  // YYYY-MM-DD
	Source       string
}

// Prices is the organizer's one price table. A model not in it has no
// price: none is guessed, and a session with any of its tokens keeps the
// cost its records give, or none.
var Prices = map[string]Price{
	"claude-opus-5-5": {Input: 4, Output: 20, CacheRead: 0.20, CacheWrite5m: 5, CacheWrite1h: 8,
		Checked: "2026-10-15", Source: "checked by Hephaistos (usage-audit FR-4, 0138)"},
}

// priceOf is k's tokens of model at the table, and whether it has a price.
// Cache writes are priced by how long they were kept: CacheWrite1h at the
// hour's price, the rest at the 5 minutes' (a transcript without the split
// counts every write as 5 minutes).
func priceOf(model string, k Kinds) (float64, bool) {
	p, ok := Prices[model]
	if !ok {
		return 0, false
	}
	oneHour := min(k.CacheWrite1h, k.CacheWrite)
	return (float64(k.Input)*p.Input + float64(k.Output)*p.Output + float64(k.CacheRead)*p.CacheRead +
		float64(k.CacheWrite-oneHour)*p.CacheWrite5m + float64(oneHour)*p.CacheWrite1h) / 1e6, true
}

// priceOfModels prices a day's tokens by model; false when any model with
// tokens has no price.
func priceOfModels(ms map[string]Kinds) (float64, bool) {
	var sum float64
	for m, k := range ms {
		if k.Total() == 0 {
			continue
		}
		p, ok := priceOf(m, k)
		if !ok {
			return 0, false
		}
		sum += p
	}
	return sum, true
}

// priceLine prices one day of a session; false when it has a token of an
// unpriced model, or tokens with no model.
func priceLine(l *Line) (float64, bool) {
	var byModel int64
	for _, k := range l.Models {
		byModel += k.Total()
	}
	p, ok := priceOfModels(l.Models)
	return p, ok && byModel == l.Total()
}

// priceLines prices a session's days; false when any day is not priced.
func priceLines(ls []*Line) (float64, bool) {
	var sum float64
	for _, l := range ls {
		p, ok := priceLine(l)
		if !ok {
			return 0, false
		}
		sum += p
	}
	return sum, true
}
