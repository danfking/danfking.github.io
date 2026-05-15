# Local preview server for the blog.
# Usage: .\serve.ps1
# Opens http://localhost:4000 with live reload.

$ErrorActionPreference = 'Stop'

$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
    Write-Error "bundle not found. Install Ruby with: winget install RubyInstallerTeam.RubyWithDevKit.3.3"
}

Push-Location $PSScriptRoot
try {
    if (-not (Test-Path 'vendor/bundle')) {
        Write-Host "First run: installing gems into vendor/bundle..." -ForegroundColor Cyan
        bundle config set --local path 'vendor/bundle'
        bundle install
    }
    bundle exec jekyll serve --livereload --open-url
}
finally {
    Pop-Location
}
