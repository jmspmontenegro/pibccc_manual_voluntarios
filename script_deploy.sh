#!/bin/bash

# Script para automatizar commit e deploy com prefixo de data/hora
# Uso: ./script_deploy.sh "Descrição do commit"
# Ou apenas: ./script_deploy.sh (ele perguntará a descrição)

DESCRIPTION=$1

# Se não foi passado como parâmetro, pergunta
if [ -z "$DESCRIPTION" ]; then
    echo "Qual a descrição do commit?"
    read DESCRIPTION
fi

# Se ainda estiver vazio, encerra
if [ -z "$DESCRIPTION" ]; then
    echo "Erro: Descrição não fornecida. Commit cancelado."
    exit 1
fi

# Valida o build do Next.js antes de subir (evita quebrar produção no Vercel)
# Nota: roda nativo dentro do WSL sempre que possível (evita os bugs de UNC
# do npm/Turbopack/tsc — ver AGENTS.md). Se já estiver dentro do WSL, roda
# direto; se estiver no lado Windows, chama via wsl.exe.
echo "Validando build do Next.js..."
if [ -f /proc/version ] && grep -qi microsoft /proc/version; then
    BUILD_OK=0; npm run build || BUILD_OK=1
else
    BUILD_OK=0
    wsl.exe -e bash -lc 'export NVM_DIR=/root/.nvm; source $NVM_DIR/nvm.sh; nvm use v26.2.0 >/dev/null; cd /home/projetos/pibccc_manual_voluntarios && npm run build' || BUILD_OK=1
fi
if [ "$BUILD_OK" != "0" ]; then
    echo "Erro: build falhou. Deploy cancelado."
    exit 1
fi

# Gera o prefixo vYYYY.MM.DD-HH.ii
# Nota: %M é o minuto (ii no formato solicitado)
DATETIME=$(date +"%Y.%m.%d-%H.%M")

COMMIT_MESSAGE="v$DATETIME/$DESCRIPTION"

echo "----------------------------------------"
echo "Iniciando deploy..."
echo "Mensagem: $COMMIT_MESSAGE"
echo "----------------------------------------"

# Executa os comandos git
git add .

if git commit -m "$COMMIT_MESSAGE"; then
    echo "Commit realizado com sucesso."
else
    echo "Nada novo pra commitar (working tree já estava limpa) - seguindo pro push mesmo assim."
fi

echo "Enviando para origin main..."
git push origin main

echo "----------------------------------------"
echo "Processo finalizado."
