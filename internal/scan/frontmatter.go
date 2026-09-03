package scan

import (
	"errors"
	"strings"

	"gopkg.in/yaml.v3"
)

var errNoFrontmatter = errors.New("no frontmatter: file must start with ---")

// splitFrontmatter separates the YAML block between the first two `---`
// lines from the markdown body. Tolerates CRLF and a missing trailing newline.
func splitFrontmatter(content string) (front string, body string, err error) {
	content = strings.ReplaceAll(content, "\r\n", "\n")
	if !strings.HasPrefix(content, "---\n") {
		return "", "", errNoFrontmatter
	}
	rest := content[4:]
	end := strings.Index(rest, "\n---")
	if end < 0 {
		return "", "", errors.New("unterminated frontmatter: missing closing ---")
	}
	front = rest[:end]
	body = rest[end+4:]
	body = strings.TrimPrefix(body, "\n")
	return front, body, nil
}

// parseFrontmatter decodes the YAML block into out. Unknown fields are kept
// tolerated so a card can carry extra keys without breaking the scan.
func parseFrontmatter(content string, out any) (body string, err error) {
	front, body, err := splitFrontmatter(content)
	if err != nil {
		return "", err
	}
	if err := yaml.Unmarshal([]byte(front), out); err != nil {
		return "", err
	}
	return body, nil
}
