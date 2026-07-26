# Build fullchain.pem from Timeweb cert files for Nginx (Windows PowerShell).
# Place .crt, .key, and optional ca-bundle in this folder, then run:
#   .\combine-timeweb.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$crt = Get-ChildItem -File -Filter '*.crt' |
  Where-Object { $_.Name -notmatch 'ca-bundle|fullchain' } |
  Select-Object -First 1

$bundle = Get-ChildItem -File |
  Where-Object { $_.Name -match 'ca-bundle|\.ca-bundle$' } |
  Select-Object -First 1

$key = Get-ChildItem -File -Filter '*.key' | Select-Object -First 1

if (-not $crt -or -not $key) {
  throw "Need *.crt and *.key files. Optional: *ca-bundle*"
}

Copy-Item $key.FullName -Destination '.\privkey.pem' -Force

if ($bundle) {
  $crtText = Get-Content -Raw -Encoding Ascii $crt.FullName
  $bundleText = Get-Content -Raw -Encoding Ascii $bundle.FullName
  $combined = ($crtText.TrimEnd() + "`n" + $bundleText.TrimEnd() + "`n")
  [System.IO.File]::WriteAllText((Join-Path $PWD 'fullchain.pem'), $combined)
  Write-Host "fullchain.pem = $($crt.Name) + $($bundle.Name)"
} else {
  Copy-Item $crt.FullName -Destination '.\fullchain.pem' -Force
  Write-Host "fullchain.pem = $($crt.Name) (no ca-bundle found)"
  Write-Host "Tip: add ca-bundle from Timeweb for better client trust."
}

Write-Host "Done:"
Write-Host "  deploy/certs/fullchain.pem"
Write-Host "  deploy/certs/privkey.pem"
