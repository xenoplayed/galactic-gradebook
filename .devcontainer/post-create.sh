#!/usr/bin/env bash
# Laeuft einmalig, nachdem der Container erzeugt wurde (postCreateCommand).
set -euo pipefail

# Ein frisch angelegtes Named Volume gehoert root. Ohne diesen Schritt
# scheitert `npm install` mit EACCES beim Schreiben nach node_modules.
for dir in reference/node_modules tutorial/playground/node_modules; do
  if [ -d "$dir" ] && [ ! -w "$dir" ]; then
    echo "==> korrigiere Eigentuemer von $dir"
    sudo chown "$(id -u):$(id -g)" "$dir"
  fi
done

echo "==> npm install (reference)"
npm --prefix reference install

echo "==> npm install (tutorial/playground)"
npm --prefix tutorial/playground install

echo "==> fertig. Dev-Server starten mit:  npm --prefix reference run dev"
