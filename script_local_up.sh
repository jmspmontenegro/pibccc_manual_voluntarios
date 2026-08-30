#!/bin/bash
# Sobe o app localmente na porta 9010 em modo produção (build + start).
# Nota: "next dev" entra em loop de restart nesse ambiente porque o watcher
# de arquivos não funciona sobre caminho UNC (\\wsl.localhost\...). Modo
# produção não usa watcher e reflete melhor o que roda no Vercel.
# Chama o binário via node diretamente (não "npm run ...") porque o
# wrapper npm.cmd do Windows não suporta caminho UNC.
node ./node_modules/next/dist/bin/next build && node ./node_modules/next/dist/bin/next start -p 9010
