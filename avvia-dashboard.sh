#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v npm >/dev/null 2>&1; then
    echo "Errore: npm non è installato o non è disponibile nel PATH."
    exit 1
fi

if [[ ! -f package.json ]]; then
    echo "Errore: package.json non trovato."
    echo "Metti questo script nella cartella principale di dashboard-quinta."
    exit 1
fi

echo "Avvio Dashboard Quinta su http://127.0.0.1:5173"

npm run dev -- \
    --host 127.0.0.1 \
    --port 5173 \
    --strictPort \
    --open
