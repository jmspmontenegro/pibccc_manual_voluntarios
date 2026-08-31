#!/bin/bash
# Sobe o app localmente na porta 9010 em modo produção (build + start).
# Nota: "next dev" entra em loop de restart nesse ambiente porque o watcher
# de arquivos não funciona sobre caminho UNC. Modo produção não usa watcher
# e reflete melhor o que roda no Vercel.
#
# Roda nativo dentro do WSL sempre que possível (evita os bugs de UNC do
# npm/Turbopack/tsc — ver AGENTS.md). Se já estiver rodando de dentro do
# WSL (bash real, não Git Bash), roda direto; se estiver no lado Windows,
# chama via wsl.exe.

if [ -f /proc/version ] && grep -qi microsoft /proc/version; then
    npm run build && npx next start -p 9010
else
    wsl.exe -e bash -lc 'export NVM_DIR=/root/.nvm; source $NVM_DIR/nvm.sh; nvm use v26.2.0 >/dev/null; cd /home/projetos/pibccc_manual_voluntarios && npm run build && npx next start -p 9010'
fi
