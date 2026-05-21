<#
.SYNOPSIS
    Commits and pushes blog changes to GitHub Pages.
.DESCRIPTION
    Stages blog content (by default only _posts and _drafts), commits with an
    optional message, and pushes to the danfking.github.io repository.

    Every git step is checked. A failed commit or a rejected push stops the
    script and reports the error, rather than printing "Published successfully"
    when nothing actually reached the remote.
.PARAMETER Message
    Commit message. Defaults to "Update blog".
.PARAMETER Path
    Paths to stage. Defaults to _posts and _drafts so unrelated working-tree
    changes (stray drafts, scratch files, half-finished edits elsewhere) are not
    swept into the commit.
.PARAMETER All
    Stage every change in the repository (git add -A). Use this for site-wide
    changes such as theme, layout, or config edits.
.EXAMPLE
    ./publish-blog.ps1 -Message "Add post: my new post"
.EXAMPLE
    ./publish-blog.ps1 -All -Message "Redesign site theme"
#>
param(
    [string]$Message = "Update blog",
    [string[]]$Path = @("_posts", "_drafts"),
    [switch]$All
)

$ErrorActionPreference = "Stop"
# Manage native (git) exit codes ourselves via $LASTEXITCODE so behaviour is the
# same on Windows PowerShell 5.1 and PowerShell 7+, where the default handling of
# native exit codes differs.
$PSNativeCommandUseErrorActionPreference = $false

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)]$GitArgs)
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

Push-Location $PSScriptRoot

try {
    if ($All) {
        Invoke-Git add -A
    }
    else {
        Invoke-Git add @Path
    }

    # git diff --cached --quiet exits 0 when nothing is staged, 1 when there is.
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Nothing staged to commit." -ForegroundColor Yellow
        return
    }

    Write-Host "Staging these changes:" -ForegroundColor Cyan
    & git diff --cached --name-status

    Invoke-Git commit -m $Message

    try {
        Invoke-Git push origin main
    }
    catch {
        Write-Host "Push rejected. The commit is saved locally but NOT published." -ForegroundColor Red
        Write-Host "The remote has commits you don't. Reconcile, then push again:" -ForegroundColor Red
        Write-Host "    git pull --rebase origin main" -ForegroundColor Yellow
        Write-Host "    git push origin main" -ForegroundColor Yellow
        throw
    }

    Write-Host "Published successfully." -ForegroundColor Green
}
finally {
    Pop-Location
}
