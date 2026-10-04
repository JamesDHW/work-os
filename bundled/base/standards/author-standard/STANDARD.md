---
id: author-standard
describes: A new standard for this workspace
consumer: The people who start runs in this workspace, and the agents that follow the standard
agent: default
skills:
  - writing-standards
capabilities:
  - workos.standard.read
  - workos.standard.save
review: required
input: Describe the kind of output, who receives it, and what good looks like.
---
- The standard describes one kind of output and names who consumes it.
- Every criterion can be checked by reading the output; none says "high quality" or "best practice" without saying what that means here.
- Checks are commands that actually exist in projects that will use the standard, or there are none.
- Capabilities and egress are the smallest set the work needs.
- The method is a short sequence of steps an agent can follow; it is separate from the criteria.
- The standard was saved with workos.standard.save and the user approved the text.
