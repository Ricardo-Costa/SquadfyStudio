#!/usr/bin/env bash
# Frees the given TCP ports on the local host by killing whatever process is
# listening on them. Safe to run when nothing is listening — it just no-ops.
#
# Usage:
#   ./scripts/free-ports.sh            # frees the default ports (3000, 3001)
#   ./scripts/free-ports.sh 3000       # frees only port 3000
#   ./scripts/free-ports.sh 3000 3001  # frees both, explicitly

set -uo pipefail

DEFAULT_PORTS=(3000 3001)

if [ "$#" -gt 0 ]; then
  PORTS=("$@")
else
  PORTS=("${DEFAULT_PORTS[@]}")
fi

kill_with_fuser() {
  local port="$1"
  command -v fuser >/dev/null 2>&1 || return 1
  fuser -k "${port}/tcp" >/dev/null 2>&1
}

kill_with_lsof() {
  local port="$1"
  command -v lsof >/dev/null 2>&1 || return 1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null)
  [ -z "$pids" ] && return 1
  for pid in $pids; do
    kill -9 "$pid" 2>/dev/null
  done
}

for port in "${PORTS[@]}"; do
  if kill_with_fuser "$port"; then
    echo "[free-ports] Freed port $port"
  elif kill_with_lsof "$port"; then
    echo "[free-ports] Freed port $port"
  fi
done
