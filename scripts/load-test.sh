#!/usr/bin/env bash
# ============================================================
# Stone Memory CRM — basic load / smoke test.
# Fires N concurrent requests at every critical endpoint and
# reports p50/p95/p99 latency + error counts. Pure bash + curl
# so it runs anywhere without installing tools.
#
# Usage:
#   SM_BASE=http://localhost:3000 \
#   SM_SUPABASE_URL=https://xxx.supabase.co \
#   SM_SUPABASE_ANON_KEY=eyJhb... \
#   SM_SUPER_EMAIL=sttonememory@gmail.com \
#   SM_SUPER_PASSWORD=... \
#   SM_CONCURRENCY=20 \
#   SM_REPETITIONS=5 \
#   bash scripts/load-test.sh
#
# Exits 0 if every endpoint had error_rate < 5% AND p95 < 2000ms.
# Otherwise exits 1 and prints which endpoints failed the SLO.
#
# Notes:
#   * Pure read-only — no rows are created/deleted.
#   * Auth: logs in once via Supabase Auth REST, reuses token.
# ============================================================

set -u
RED=$(printf '\033[31m'); GREEN=$(printf '\033[32m'); YELLOW=$(printf '\033[33m'); RESET=$(printf '\033[0m')

BASE=${SM_BASE:-http://localhost:3000}
SUPABASE_URL=${SM_SUPABASE_URL:?Set SM_SUPABASE_URL}
ANON_KEY=${SM_SUPABASE_ANON_KEY:?Set SM_SUPABASE_ANON_KEY}
SUPER_EMAIL=${SM_SUPER_EMAIL:?Set SM_SUPER_EMAIL}
SUPER_PASSWORD=${SM_SUPER_PASSWORD:?Set SM_SUPER_PASSWORD}
CONCURRENCY=${SM_CONCURRENCY:-20}
REPETITIONS=${SM_REPETITIONS:-5}

# Endpoints to hammer. Each entry = "method|path|name"
# Read-only endpoints only. Critical hot paths first.
ENDPOINTS=(
  "GET|/api/auth/me|auth.me"
  "GET|/api/crm/team?active=true|crm.team"
  "GET|/api/crm/custom-roles|crm.customRoles"
  "GET|/api/crm/communications?limit=50|crm.communications"
  "GET|/api/crm/deals?limit=50|crm.deals"
  "GET|/api/crm/notifications/counts|crm.notifications"
  "GET|/api/crm/integrations/status|crm.integrationsStatus"
  "GET|/api/reviews|public.reviews"
)

# SLO thresholds — adjust per deployment
P95_MS_LIMIT=2000
ERROR_RATE_LIMIT_PCT=5

# ----------------------------------------------------------------
# Setup
# ----------------------------------------------------------------
echo "${YELLOW}== Stone Memory load test ==${RESET}"
echo "  Base:        $BASE"
echo "  Concurrency: $CONCURRENCY"
echo "  Repetitions: $REPETITIONS  (per endpoint per worker)"
echo ""

echo "${YELLOW}Logging in as super_admin...${RESET}"
TOKEN_BODY=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${SUPER_EMAIL}\",\"password\":\"${SUPER_PASSWORD}\"}")
TOKEN=$(python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('access_token',''))" <<<"$TOKEN_BODY")
if [[ -z "$TOKEN" ]]; then
  echo "${RED}Login failed — aborting${RESET}"
  echo "Response: $TOKEN_BODY" | head -c 300
  echo
  exit 1
fi
echo "${GREEN}✓ logged in${RESET}"
echo ""

# Shared workspace for per-request results
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Single worker: runs one HTTP call and appends "status latency_ms" to file.
hit() {
  local method="$1" path="$2" outfile="$3"
  local start_ms end_ms code latency
  start_ms=$(python3 -c 'import time; print(int(time.time()*1000))')
  code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
    "${BASE}${path}" \
    -H "Authorization: Bearer ${TOKEN}" \
    --max-time 10)
  end_ms=$(python3 -c 'import time; print(int(time.time()*1000))')
  latency=$((end_ms - start_ms))
  echo "$code $latency" >> "$outfile"
}

# Run one endpoint at $CONCURRENCY parallelism × $REPETITIONS rounds
run_endpoint() {
  local name="$1" method="$2" path="$3"
  local out="$TMPDIR/${name}.tsv"
  : > "$out"
  for ((r = 0; r < REPETITIONS; r++)); do
    for ((w = 0; w < CONCURRENCY; w++)); do
      hit "$method" "$path" "$out" &
    done
    wait
  done
}

# Stats from a results file via Python (avoids sort/awk math drift)
report_endpoint() {
  local name="$1" path="$2"
  local out="$TMPDIR/${name}.tsv"
  python3 - "$out" "$name" "$path" "$P95_MS_LIMIT" "$ERROR_RATE_LIMIT_PCT" <<'PY'
import sys
path_log, name, route, p95_limit, err_limit = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), float(sys.argv[5])
codes = []
latencies = []
with open(path_log) as f:
    for line in f:
        parts = line.split()
        if len(parts) < 2: continue
        codes.append(int(parts[0]))
        latencies.append(int(parts[1]))
n = len(latencies)
if n == 0:
    print(f"  ✗ {name:<24} NO DATA")
    sys.exit(2)
errors = sum(1 for c in codes if c >= 500 or c == 0)
err_pct = (errors / n) * 100
latencies_sorted = sorted(latencies)
def pct(p):
    if not latencies_sorted: return 0
    idx = min(len(latencies_sorted) - 1, int(len(latencies_sorted) * p / 100))
    return latencies_sorted[idx]
p50, p95, p99 = pct(50), pct(95), pct(99)
fastest, slowest = latencies_sorted[0], latencies_sorted[-1]
slo_p95_ok = p95 <= p95_limit
slo_err_ok = err_pct <= err_limit
GREEN, RED, YEL, RESET = "\033[32m", "\033[31m", "\033[33m", "\033[0m"
status = f"{GREEN}✓{RESET}" if (slo_p95_ok and slo_err_ok) else f"{RED}✗{RESET}"
print(f"  {status} {name:<24} {route}")
print(f"      n={n:<5} errors={errors} ({err_pct:.1f}%)   p50={p50}ms p95={p95}ms p99={p99}ms  range=[{fastest}–{slowest}]ms")
if not slo_p95_ok:
    print(f"      {RED}p95 over limit ({p95_limit}ms){RESET}")
if not slo_err_ok:
    print(f"      {RED}error rate over limit ({err_limit}%){RESET}")
sys.exit(0 if (slo_p95_ok and slo_err_ok) else 1)
PY
}

# ----------------------------------------------------------------
# Run all endpoints
# ----------------------------------------------------------------
FAILURES=0
for entry in "${ENDPOINTS[@]}"; do
  IFS='|' read -r METHOD PATH NAME <<<"$entry"
  echo "${YELLOW}→ ${NAME}${RESET}  (${CONCURRENCY}×${REPETITIONS} = $((CONCURRENCY * REPETITIONS)) reqs)"
  run_endpoint "$NAME" "$METHOD" "$PATH"
  if ! report_endpoint "$NAME" "$PATH"; then
    FAILURES=$((FAILURES + 1))
  fi
  echo ""
done

echo "${YELLOW}== Summary ==${RESET}"
if [[ "$FAILURES" -eq 0 ]]; then
  echo "${GREEN}✓ all endpoints within SLO (p95 ≤ ${P95_MS_LIMIT}ms, errors ≤ ${ERROR_RATE_LIMIT_PCT}%)${RESET}"
  exit 0
else
  echo "${RED}✗ ${FAILURES} endpoint(s) failed SLO — see details above${RESET}"
  exit 1
fi
