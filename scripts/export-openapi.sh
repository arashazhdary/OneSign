#!/usr/bin/env bash
# Export OpenAPI JSON from a running OneSign API instance.
# Usage: ./scripts/export-openapi.sh [base-url]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${1:-https://localhost:7001}"
OUT="$ROOT/docs/openapi/onesign-v1.json"

mkdir -p "$(dirname "$OUT")"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "${BASE_URL%/}/swagger/v1/swagger.json" -o "$OUT"
  echo "Wrote $OUT"
else
  echo "curl is required" >&2
  exit 1
fi
