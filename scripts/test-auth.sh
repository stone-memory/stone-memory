#!/usr/bin/env bash
# ============================================================
# Stone Memory CRM — auth boundary tests
# Smoke tests Fix 4 / 5 / 6 security gates against a running server.
#
# Usage:
#   SM_BASE=http://localhost:3000 \
#   SM_SUPABASE_URL=https://xxxx.supabase.co \
#   SM_SUPABASE_ANON_KEY=eyJhbGc...   \
#   SM_SUPER_EMAIL=sttonememory@gmail.com \
#   SM_SUPER_PASSWORD=… \
#   SM_OTHER_EMAIL=manager@example.com \
#   SM_OTHER_PASSWORD=… \
#   bash scripts/test-auth.sh
#
# Exits 0 if every assertion passes, 1 otherwise. Designed for manual
# QA runs (we don't have a CI test framework yet) — see PR-description
# checklist in fix/admin-dashboard-improvements for full criteria.
# ============================================================

set -u
shopt -s nullglob
RED=$(printf '\033[31m'); GREEN=$(printf '\033[32m'); YELLOW=$(printf '\033[33m'); RESET=$(printf '\033[0m')

BASE=${SM_BASE:-http://localhost:3000}
SUPABASE_URL=${SM_SUPABASE_URL:?Set SM_SUPABASE_URL=https://<project>.supabase.co}
ANON_KEY=${SM_SUPABASE_ANON_KEY:?Set SM_SUPABASE_ANON_KEY (Supabase anon key)}
SUPER_EMAIL=${SM_SUPER_EMAIL:?Set SM_SUPER_EMAIL (super_admin login)}
SUPER_PASSWORD=${SM_SUPER_PASSWORD:?Set SM_SUPER_PASSWORD}
OTHER_EMAIL=${SM_OTHER_EMAIL:?Set SM_OTHER_EMAIL (a non-super-admin teammate, e.g. role=manager)}
OTHER_PASSWORD=${SM_OTHER_PASSWORD:?Set SM_OTHER_PASSWORD}

PASSED=0
FAILED=0

login() {
  # Echo the access token for an email/password pair via Supabase Auth REST.
  local email="$1" password="$2"
  local body
  body=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
  python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print(d.get('access_token',''))" <<<"$body"
}

assert_status() {
  # assert_status <expected> <description> <curl args...>
  local expected="$1" desc="$2"; shift 2
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  if [[ "$actual" == "$expected" ]]; then
    echo "${GREEN}✓${RESET} $desc — got $actual"
    PASSED=$((PASSED+1))
  else
    echo "${RED}✗${RESET} $desc — expected $expected, got $actual"
    FAILED=$((FAILED+1))
  fi
}

echo "${YELLOW}== Logging in ==${RESET}"
SUPER_TOKEN=$(login "$SUPER_EMAIL" "$SUPER_PASSWORD")
OTHER_TOKEN=$(login "$OTHER_EMAIL" "$OTHER_PASSWORD")
[[ -n "$SUPER_TOKEN" ]] || { echo "${RED}Could not log in as super_admin — aborting${RESET}"; exit 1; }
[[ -n "$OTHER_TOKEN" ]] || { echo "${RED}Could not log in as ${OTHER_EMAIL} — aborting${RESET}"; exit 1; }

echo
echo "${YELLOW}== /api/auth/me — read role ==${RESET}"
assert_status 401 "Anonymous → 401" \
  -X GET "${BASE}/api/auth/me"
assert_status 200 "super_admin → 200" \
  -X GET "${BASE}/api/auth/me" \
  -H "Authorization: Bearer ${SUPER_TOKEN}"
assert_status 200 "manager → 200 (anyone authed can read own role)" \
  -X GET "${BASE}/api/auth/me" \
  -H "Authorization: Bearer ${OTHER_TOKEN}"

echo
echo "${YELLOW}== Fix 4 · /api/auth/update-password ==${RESET}"
assert_status 401 "Anonymous → 401" \
  -X POST "${BASE}/api/auth/update-password" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"this-should-not-work"}'
assert_status 403 "Manager → 403 (super_admin only)" \
  -X POST "${BASE}/api/auth/update-password" \
  -H "Authorization: Bearer ${OTHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"this-should-not-work"}'
# Super_admin authorization without side effects: short password → 422.
# Endpoint reached + permission granted, but body validation rejects.
assert_status 422 "super_admin with too-short password → 422 (validation)" \
  -X POST "${BASE}/api/auth/update-password" \
  -H "Authorization: Bearer ${SUPER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"short"}'

echo
echo "${YELLOW}== Fix 4 · /api/auth/update-email ==${RESET}"
assert_status 401 "Anonymous → 401" \
  -X POST "${BASE}/api/auth/update-email" \
  -H "Content-Type: application/json" \
  -d '{"newEmail":"fake@example.com"}'
assert_status 403 "Manager → 403" \
  -X POST "${BASE}/api/auth/update-email" \
  -H "Authorization: Bearer ${OTHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"newEmail":"fake@example.com"}'
assert_status 422 "super_admin with invalid email → 422 (validation)" \
  -X POST "${BASE}/api/auth/update-email" \
  -H "Authorization: Bearer ${SUPER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"newEmail":"not-an-email"}'

echo
echo "${YELLOW}== Fix 6 · /api/crm/integrations/status ==${RESET}"
assert_status 401 "Anonymous → 401" \
  -X GET "${BASE}/api/crm/integrations/status"
assert_status 403 "Manager → 403 (super_admin only)" \
  -X GET "${BASE}/api/crm/integrations/status" \
  -H "Authorization: Bearer ${OTHER_TOKEN}"
assert_status 200 "super_admin → 200" \
  -X GET "${BASE}/api/crm/integrations/status" \
  -H "Authorization: Bearer ${SUPER_TOKEN}"

echo
echo "${YELLOW}== Self-PATCH whitelist · /api/crm/team/me ==${RESET}"
# Manager tries to escalate themselves to super_admin via PATCH. The
# endpoint whitelists display_name + phone only, so role/email fields
# are silently dropped. Status should still be 200 (allowed fields
# accepted) but the returned row's role must be unchanged.
echo -n "  Manager attempts role escalation in PATCH → "
RESP=$(curl -s -X PATCH "${BASE}/api/crm/team/me" \
  -H "Authorization: Bearer ${OTHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"escalation-test","role":"super_admin","email":"hacker@example.com"}')
ROLE_AFTER=$(python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print(d.get('role',''))" <<<"$RESP")
if [[ "$ROLE_AFTER" == "super_admin" ]]; then
  echo "${RED}✗${RESET} role got escalated to super_admin — DANGER"
  FAILED=$((FAILED+1))
else
  echo "${GREEN}✓${RESET} role unchanged (got: ${ROLE_AFTER:-empty})"
  PASSED=$((PASSED+1))
fi

echo
echo "${YELLOW}== Summary ==${RESET}"
echo "  Passed: ${GREEN}${PASSED}${RESET}"
echo "  Failed: ${RED}${FAILED}${RESET}"
[[ "$FAILED" -eq 0 ]]
