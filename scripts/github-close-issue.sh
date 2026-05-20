#!/usr/bin/env bash
# Close a GitHub issue with a comment.
# Usage: ./scripts/github-close-issue.sh <issue-number> [comment-file]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GH_BIN="${GH_BIN:-$ROOT/.tools/gh_2.63.2_linux_amd64/bin/gh}"
REPO="${GITHUB_REPO:-arashazhdary/OneSign}"

if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 <issue-number> [comment-markdown-file]"
  exit 1
fi

ISSUE="$1"
COMMENT="${2:-}"

if [[ -n "${GH_TOKEN:-}" ]]; then
  export GH_TOKEN
fi

if [[ -n "$COMMENT" && -f "$COMMENT" ]]; then
  "$GH_BIN" issue comment "$ISSUE" --repo "$REPO" --body-file "$COMMENT"
elif [[ -n "$COMMENT" ]]; then
  "$GH_BIN" issue comment "$ISSUE" --repo "$REPO" --body "$COMMENT"
fi

"$GH_BIN" issue close "$ISSUE" --repo "$REPO"
echo "Closed #$ISSUE on $REPO"
