# cleanup-unused.ps1
# Script para remover arquivos que não são referenciados pelo projeto
# Execute este script na raiz do projeto (PowerShell) para apagar os arquivos listados abaixo.

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $projectRoot

$filesToRemove = @(
    'src\imagens\playlist\1.jpeg',
    'src\imagens\playlist\2.png',
    'src\imagens\playlist\3.jpeg',
    'src\imagens\playlist\4.jpeg',
    'src\imagens\playlist\5.jpeg',
    'src\imagens\playlist\6.jpeg',
    'src\imagens\playlist\7.jpeg',
    'src\imagens\playlist\8.jpeg',
    'src\imagens\playlist\9.jpeg',
    'src\imagens\playlist\10.jpeg',
    'src\imagens\playlist\11.jpeg',
    'src\imagens\playlist\12.jpeg',
    'src\imagens\playlist\13.jpeg',
    'src\imagens\playlist\14.jpeg',
    'src\imagens\playlist\15.jpeg',
    'src\imagens\icons\logo-spotify.png',
    'src\imagens\icons\small-right.png',
    'player.js'
)

Write-Host "Este script removerá os seguintes arquivos (se existirem):" -ForegroundColor Yellow
$filesToRemove | ForEach-Object { Write-Host " - $_" }

$confirm = Read-Host "Deseja prosseguir e apagar esses arquivos? (s/N)"
if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Cyan
    exit 0
}

$deleted = @()
$notFound = @()

foreach ($f in $filesToRemove) {
    if (Test-Path $f) {
        try {
            Remove-Item $f -Force
            $deleted += $f
            Write-Host "Removido: $f" -ForegroundColor Green
        } catch {
            Write-Host "Erro ao remover $f: $_" -ForegroundColor Red
        }
    } else {
        $notFound += $f
        Write-Host "Não encontrado: $f" -ForegroundColor DarkYellow
    }
}

Write-Host "\nResumo:" -ForegroundColor Cyan
Write-Host "Removidos: $($deleted.Count)" -ForegroundColor Green
Write-Host "Não encontrados: $($notFound.Count)" -ForegroundColor Yellow

exit 0
