#!/usr/bin/env bash
# Close GitHub issues for completed backlog work (requires GH_TOKEN).
# Usage: GH_TOKEN=... ./scripts/github-close-completed-issues.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GH_BIN="${GH_BIN:-$ROOT/.tools/gh_2.63.2_linux_amd64/bin/gh}"
REPO="${GITHUB_REPO:-arashazhdary/OneSign}"

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "GH_TOKEN is required. Example:"
  echo "  GH_TOKEN=ghp_xxx ./scripts/github-close-completed-issues.sh"
  exit 1
fi
export GH_TOKEN

declare -A MESSAGES=(
  [60]="Copilot sidebar and tenant API integration (6a16ca7)"
  [61]="Tenant branding ETag/304 caching (c872efc)"
  [62]="SendTestEmail wired to IEmailService (8e418f4)"
  [63]="SMS providers Twilio/Logging (613066b)"
  [64]="Onesign.Sdk.AspNetCore (ccb6fa5)"
  [65]="@onesign/sdk-node (a3f18e9)"
  [66]="onesign CLI config export (12bff85)"
  [67]="Dev sandbox, samples, Postman (bed11cc)"
  [68]="Platform UI wired to global platform APIs (2ab068d)"
)

# Newer batch — update issue numbers after running create-github-issues.sh if different
declare -A MESSAGES_NEW=(
  [69]="Unified monorepo CI workflow"
  [70]="Helm chart and DEPLOYMENT guide"
  [71]="Integration tests for Platform/Copilot/ChangeSets"
  [72]="LICENSE, CONTRIBUTING, OpenAPI export docs"
  [73]="OpenAPI/Postman developer docs"
  [74]="Production email SendGrid + health + runbook"
)

close_one() {
  local num="$1"
  local msg="$2"
  if "$GH_BIN" issue view "$num" --repo "$REPO" --json state -q .state 2>/dev/null | grep -q OPEN; then
    "$GH_BIN" issue comment "$num" --repo "$REPO" --body "Implemented on master: $msg"
    "$GH_BIN" issue close "$num" --repo "$REPO"
    echo "Closed #$num"
  else
    echo "Skip #$num (not open or missing)"
  fi
}

for n in "${!MESSAGES[@]}"; do
  close_one "$n" "${MESSAGES[$n]}"
done

for n in "${!MESSAGES_NEW[@]}"; do
  close_one "$n" "${MESSAGES_NEW[$n]}" || true
done

echo "Done. https://github.com/${REPO}/issues"
