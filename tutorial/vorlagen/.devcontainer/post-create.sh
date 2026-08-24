#!/usr/bin/env bash
# Laeuft einmalig, nachdem der Container erzeugt wurde (postCreateCommand).
set -euo pipefail

# Ein frisch angelegtes Named Volume gehoert root. Ohne diesen Schritt scheitert
# `npm install` mit EACCES beim Schreiben nach node_modules.
if [ -d node_modules ] && [ ! -w node_modules ]; then
  echo "==> node_modules gehoert nicht $(whoami), korrigiere Eigentuemer"
  sudo chown "$(id -u):$(id -g)" node_modules
fi

# Beim allerersten Hochfahren existiert noch kein Projekt (das scaffoldest du
# selbst im Container). Dann ist hier schlicht nichts zu installieren.
if [ -f package.json ]; then
  echo "==> npm install"
  npm install
else
  echo "==> Noch keine package.json - Projekt zuerst scaffolden:"
  echo "    npm create vue@latest ."
fi
