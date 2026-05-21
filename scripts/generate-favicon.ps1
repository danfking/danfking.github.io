<#
.SYNOPSIS
    Generates the site favicon set from a source image.
.DESCRIPTION
    Resizes a square source image into the standard favicon assets (16x16, 32x32
    and apple-touch PNGs, plus a multi-size favicon.ico) using System.Drawing, so
    it needs no external tools like ImageMagick. Re-run it whenever the source
    profile image changes.
.PARAMETER Source
    Path to the source image. Should be square for best results.
.PARAMETER AssetDir
    Directory for the PNG icons. Defaults to ../assets relative to this script.
.PARAMETER IcoPath
    Output path for favicon.ico. Defaults to the site root (../favicon.ico).
.EXAMPLE
    ./generate-favicon.ps1
.EXAMPLE
    ./generate-favicon.ps1 -Source C:\path\to\new-photo.jpg
#>
param(
    [string]$Source   = "$PSScriptRoot/../assets/images/profile.jpg",
    [string]$AssetDir = "$PSScriptRoot/../assets",
    [string]$IcoPath  = "$PSScriptRoot/../favicon.ico"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-Resized {
    param([System.Drawing.Image]$Image, [int]$Size)
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($Image, 0, 0, $Size, $Size)
    $g.Dispose()
    return $bmp
}

function Get-PngBytes {
    param([System.Drawing.Bitmap]$Bitmap)
    $ms = New-Object System.IO.MemoryStream
    $Bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return , $bytes
}

$srcPath = (Resolve-Path $Source).Path
$src = [System.Drawing.Image]::FromFile($srcPath)
if ($src.Width -ne $src.Height) {
    Write-Host "Warning: source is $($src.Width)x$($src.Height), not square. Output will be squashed." -ForegroundColor Yellow
}

if (-not (Test-Path $AssetDir)) { New-Item -ItemType Directory -Path $AssetDir -Force | Out-Null }

# PNG icons written to disk
$pngSizes = [ordered]@{
    "favicon-16x16.png"    = 16
    "favicon-32x32.png"    = 32
    "apple-touch-icon.png" = 180
}
foreach ($name in $pngSizes.Keys) {
    $bmp = New-Resized -Image $src -Size $pngSizes[$name]
    $out = Join-Path $AssetDir $name
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "wrote $out"
}

# favicon.ico containing PNG-encoded 16 and 32 entries
$entries = @()
foreach ($size in 16, 32) {
    $bmp = New-Resized -Image $src -Size $size
    $entries += [pscustomobject]@{ Size = $size; Bytes = (Get-PngBytes -Bitmap $bmp) }
    $bmp.Dispose()
}
$src.Dispose()

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms
$bw.Write([UInt16]0)              # reserved
$bw.Write([UInt16]1)              # type: icon
$bw.Write([UInt16]$entries.Count) # image count
$offset = 6 + 16 * $entries.Count
foreach ($e in $entries) {
    $dim = if ($e.Size -ge 256) { 0 } else { $e.Size }
    $bw.Write([byte]$dim)               # width
    $bw.Write([byte]$dim)               # height
    $bw.Write([byte]0)                  # palette size
    $bw.Write([byte]0)                  # reserved
    $bw.Write([UInt16]1)                # color planes
    $bw.Write([UInt16]32)               # bits per pixel
    $bw.Write([UInt32]$e.Bytes.Length)  # image data size
    $bw.Write([UInt32]$offset)          # offset to image data
    $offset += $e.Bytes.Length
}
foreach ($e in $entries) { $bw.Write($e.Bytes) }
$bw.Flush()

$icoFull = [System.IO.Path]::GetFullPath($IcoPath)
[System.IO.File]::WriteAllBytes($icoFull, $ms.ToArray())
$bw.Dispose(); $ms.Dispose()
Write-Host "wrote $icoFull"
