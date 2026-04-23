<#
.SYNOPSIS
    Commits and pushes blog changes to GitHub Pages.
.DESCRIPTION
    Stages all changes in the blog directory, commits with an optional message,
    and pushes to the danfking.github.io repository.
.PARAMETER Message
    Commit message. Defaults to "Update blog".
#>
param(
    [string]$Message = "Update blog"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot

try {
    git add -A
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "Nothing to commit." -ForegroundColor Yellow
        return
    }

    git commit -m $Message
    git push origin main

    Write-Host "Published successfully." -ForegroundColor Green
}
finally {
    Pop-Location
}
