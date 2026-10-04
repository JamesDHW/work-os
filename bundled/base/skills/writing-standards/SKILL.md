---
name: writing-standards
description: How STANDARD.md and METHOD.md files are written in work-os
---
A standard lives in `standards/<id>/` in the workspace package and has two files.

`STANDARD.md` starts with YAML frontmatter, followed by the criteria as a short Markdown list:

```yaml
---
id: weekly-report          # lowercase letters, digits and hyphens; same as the folder name
describes: A weekly status report for the leadership team
consumer: The leadership team
agent: default             # an agent in agents/<id>/AGENT.md
skills: []                 # skills the agent may load
capabilities: []           # e.g. github.pr.create, git.push
egress: []                 # extra hostnames the environment may reach
checks:                    # commands run in the environment before review
  - name: tests
    command: npm test
review: required           # required | optional | none
input: What should the report cover?
---
```

Criteria are observable: someone reading the output can say whether each one holds. Avoid vague words such as "clean", "robust" or "best practice" unless the criterion says what they mean here.

`METHOD.md` is optional plain Markdown: numbered steps the agent follows. Keep the method separate from the criteria, so reviewers judge the output against the criteria only.
