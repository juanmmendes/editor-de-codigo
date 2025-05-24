<#
██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗██║   ██║
██████╔╝█████╗  ██████╔╝██║     ██║   ██║██║   ██║
██╔═══╝ ██╔══╝  ██╔═══╝ ██║     ██║   ██║██║   ██║
██║     ███████╗██║     ███████╗╚██████╔╝╚██████╔╝
╚═╝     ╚══════╝╚═╝     ╚══════╝ ╚═════╝  ╚═════╝ 
#>

<#
SCRIPT DE DEPLOY AUTOMÁTICO PARA GITHUB PAGES
Autor: Juan Mendes

🚀 O QUE ELE FAZ?
- Adiciona todos os arquivos modificados com `git add .`
- Faz um commit automático com data e hora
- Dá push para a branch `main`
- Informa o link do GitHub Pages após o deploy

▶ COMO USAR:
1. Abra o PowerShell na pasta do projeto.
2. Execute o script com:
   .\deploy.ps1
3. Pronto! O deploy será feito automaticamente.

⚠ IMPORTANTE:
- Só funciona se o repositório já estiver configurado com Git e GitHub Pages.
- Se for a primeira vez usando scripts no PowerShell, libere com:
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#>

Write-Host "🚀 Iniciando deploy..." -ForegroundColor Green

# Verifica se Git está instalado
try {
    git --version > $null
} catch {
    Write-Host "❌ Git não está instalado ou acessível." -ForegroundColor Red
    exit 1
}

# Adiciona arquivos modificados
git add .

# Commit com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "deploy: update $timestamp"

# Push para a branch main
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Acesse: https://juanmmendes.github.io/editor-de-codigo" -ForegroundColor Cyan
} else {
    Write-Host "❌ Algo deu errado no push. Verifique seu Git." -ForegroundColor Red
}
