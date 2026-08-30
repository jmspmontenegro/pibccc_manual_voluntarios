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
# Nota: chama o binário via node diretamente (não "npm run build") porque o
# wrapper npm.cmd do Windows não suporta caminho UNC (\\wsl.localhost\...)
echo "Validando build do Next.js..."
if ! node ./node_modules/next/dist/bin/next build; then
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
    echo "Enviando para origin main..."
    git push origin main
else
    echo "Erro: Falha ao realizar o commit (talvez não haja alterações?)."
fi

echo "----------------------------------------"
echo "Processo finalizado."
