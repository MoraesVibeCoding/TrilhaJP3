# Issue tracker: GitHub

Issues and specs for this repo (`MoraesVibeCoding/TrilhaJP3`) live as GitHub issues.

The `gh` CLI is not available in the cloud environment. Use the GitHub MCP tools (`mcp__github__*`) instead; where `gh` is available, the `gh` equivalent works too.

## Conventions

- **Create an issue**: `mcp__github__issue_write` (method `create`) or `gh issue create --title "..." --body "..."`.
- **Read an issue**: `mcp__github__issue_read` or `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `mcp__github__list_issues` / `mcp__github__search_issues`, filtered by label and state.
- **Sub-issue of a parent**: `mcp__github__sub_issue_write`. Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `mcp__github__add_issue_comment`.
- **Apply / remove labels**: `mcp__github__issue_write` (method `update`, `labels` field).
- **Close**: `mcp__github__issue_write` (method `update`, `state: closed`, with `state_reason`).

Every comment posted by Claude ends with the attribution footer required by the environment.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.
