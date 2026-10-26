#!/bin/bash
# Prepara a sessão de nuvem: dependências, navegador do E2E, gitleaks, osv-scanner, semgrep e origin/main para o guarda do piso.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

npm install --no-audit --no-fund

# O Playwright fixado no projeto não acha o Chromium pré-instalado sozinho.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export E2E_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:'"$(go env GOPATH)"'/bin:$HOME/.local/bin"' >> "$CLAUDE_ENV_FILE"
fi

if ! command -v gitleaks >/dev/null && [ ! -x "$(go env GOPATH)/bin/gitleaks" ]; then
  go install github.com/zricethezav/gitleaks/v8@v8.28.0
fi

if ! command -v osv-scanner >/dev/null && [ ! -x "$(go env GOPATH)/bin/osv-scanner" ]; then
  go install github.com/google/osv-scanner/v2/cmd/osv-scanner@v2.2.2
fi

# semgrep e osv-scanner precisam de semgrep.dev e api.osv.dev liberados na rede do ambiente.
if ! command -v semgrep >/dev/null && [ ! -x "$HOME/.local/bin/semgrep" ]; then
  pip3 install --quiet --user semgrep==1.182.1
fi

# check:floor e coverage-changed comparam com origin/main.
git fetch --quiet origin main || echo "aviso: git fetch origin main falhou" >&2
