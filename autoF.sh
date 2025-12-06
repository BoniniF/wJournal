#!/bin/bash

cd "$(dirname "$0")"

BRANCH=main

echo "avvio..."
# Premi CTRL+C per interrompere."

while true; do

if curl -Is https://github.com >/dev/null 2>&1; then

    # Aggiunge tutti i file
    git add -A

    # Commit con timestamp (se ci sono modifiche)
    git commit -m "Auto-f $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1

    # Sincronizza con remoto
        git push

    echo "Sync completato: $(date '+%H:%M:%S')"
else
echo "Connessione assente"
fi
sleep 300 #300 sec = 5 min
done
