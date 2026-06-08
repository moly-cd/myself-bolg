param(
  [string]$Domain = "momoxjk.xyz",
  [string]$Server = "root@YOUR_SERVER_IP",
  [string]$RemoteArchive = "/tmp/public.tar.gz",
  [string]$RemoteWebRoot = "/var/www/myself-bolg"
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Command '$Name' was not found. Please install it or add it to PATH."
  }
}

Require-Command "hugo"
Require-Command "tar"
Require-Command "scp"
Require-Command "ssh"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ArchivePath = Join-Path $ProjectRoot "public.tar.gz"

Set-Location $ProjectRoot

Write-Host "Building Hugo site for https://$Domain/ ..."
hugo --minify --baseURL "https://$Domain/"

if (Test-Path $ArchivePath) {
  Remove-Item $ArchivePath
}

Write-Host "Packing public/ ..."
tar -czf $ArchivePath -C public .

Write-Host "Uploading to ${Server}:$RemoteArchive ..."
scp $ArchivePath "${Server}:$RemoteArchive"

$RemoteScript = @"
set -e
mkdir -p '$RemoteWebRoot'
rm -rf '$RemoteWebRoot'/*
tar -xzf '$RemoteArchive' -C '$RemoteWebRoot'
chown -R www-data:www-data '$RemoteWebRoot'
systemctl reload nginx
"@

Write-Host "Publishing on server ..."
$RemoteScript | ssh $Server "bash -se"

Write-Host "Done. Open: https://$Domain/"
