package scan

import "gopkg.in/yaml.v3"

func yamlUnmarshal(b []byte, out any) error { return yaml.Unmarshal(b, out) }
