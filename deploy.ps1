# SCRIPT DE DEPLOY AUTOMÁTICO
# Execute este arquivo para fazer deploy completo

Write-Host "🚀 Iniciando deploy..." -ForegroundColor Green

# Adicionar todos os arquivos
git add .

# Commit com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "deploy: update $timestamp"

# Push para repositório
git push origin main

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://juanmmendes.github.io/editor-de-codigo" -ForegroundColor Cyan
