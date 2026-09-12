# grabs the latest classic-themes and puts it somewhere your browser wont lose it
$ErrorActionPreference = 'Stop'

$dest = Join-Path $env:LOCALAPPDATA 'ClassicThemes'
$zip  = Join-Path $env:TEMP 'classic-themes.zip'
$tmp  = Join-Path $env:TEMP 'classic-themes-unzip'

Write-Host 'downloading...' -ForegroundColor Cyan
Invoke-WebRequest 'https://codeload.github.com/barbiewire/classic-themes/zip/refs/heads/main' -OutFile $zip -UseBasicParsing

if (Test-Path $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
Expand-Archive -LiteralPath $zip -DestinationPath $tmp -Force

# copy into the folder instead of replacing it, so an already loaded extension keeps working
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path (Join-Path $tmp 'classic-themes-main\*') -Destination $dest -Recurse -Force
Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue

Set-Clipboard -Value $dest
Start-Process explorer.exe $dest

Write-Host ''
Write-Host "done -> $dest" -ForegroundColor Green
Write-Host 'the path is on your clipboard and the folder is open.'
Write-Host ''
Write-Host 'now open chrome://extensions (or brave://extensions), flip Developer mode top right,'
Write-Host 'and drag that folder onto the page. or press Load unpacked and paste the path.'
Write-Host 'already installed? this just updated it - hit the reload arrow on the extension.'
