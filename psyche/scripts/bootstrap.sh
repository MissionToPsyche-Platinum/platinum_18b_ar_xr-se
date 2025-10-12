#!/usr/bin/env bash
# Psyche bootstrap (Linux/macOS)
# Ensures Node LTS + npm + deps for psyche/
# If you run, it *should* let you run the entire framework with ease
# meant to keep all dev machines on the same page
set -eo pipefail

# ---------- config ----------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PSYCHE_DIR="${PROJECT_DIR}/psyche"
: "${NVM_DIR:=$HOME/.nvm}"
# ----------------------------

need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' missing" >&2; exit 1; }; }

echo "==> Psyche bootstrap"

need_cmd bash
need_cmd curl
need_cmd git

if [ ! -d "$NVM_DIR" ]; then
  echo "==> Installing nvm to $NVM_DIR ..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

_enable_nounset() { set -u; }
_disable_nounset() { set +u; }

_disable_nounset
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
else
  echo "ERROR: nvm not found at $NVM_DIR/nvm.sh" >&2
  exit 1
fi
_enable_nounset

_disable_nounset
nvm install --lts >/dev/null
nvm use --lts >/dev/null
_enable_nounset

NODE_VER="$(node -v)"
NPM_VER="$(npm -v)"
echo "==> Using Node $NODE_VER, npm $NPM_VER"

echo "lts/*" > "$PROJECT_DIR/.nvmrc"

if command -v corepack >/dev/null 2>&1; then corepack enable >/dev/null || true; fi

if [ ! -d "$PSYCHE_DIR" ]; then
  echo "ERROR: expected '$PSYCHE_DIR' but it doesn't exist."
  echo "Create the Astro app at repo/psyche first:  npm create astro@latest psyche"
  exit 1
fi

echo "==> Installing dependencies in psyche/ ..."
cd "$PSYCHE_DIR"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

if ! node -e "process.exit(!(require('./package.json').devDependencies||{}).astro)"; then
  echo "==> Adding Astro (dev dependency) ..."
  npm install -D astro
fi

echo "==> Generating app registry (if script exists) ..."
npm run predev >/dev/null 2>&1 || true

if [[ "${1:-}" == "--dev" ]]; then
  echo "==> Starting dev server (Ctrl+C to stop) ..."
  npm run dev
else
  echo "==> Bootstrap complete. Next:"
  echo "   cd psyche && npm run dev"
fi
