package scan

import "testing"

func TestSplitFrontmatter(t *testing.T) {
	cases := []struct {
		name, in, front, body string
		wantErr               bool
	}{
		{"basic", "---\na: 1\n---\nbody\n", "a: 1", "body\n", false},
		{"crlf", "---\r\na: 1\r\n---\r\nbody", "a: 1", "body", false},
		{"no trailing newline", "---\na: 1\n---", "a: 1", "", false},
		{"missing start", "a: 1\n---\n", "", "", true},
		{"unterminated", "---\na: 1\n", "", "", true},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			f, b, err := splitFrontmatter(c.in)
			if (err != nil) != c.wantErr {
				t.Fatalf("err=%v wantErr=%v", err, c.wantErr)
			}
			if f != c.front || b != c.body {
				t.Fatalf("front=%q body=%q", f, b)
			}
		})
	}
}
