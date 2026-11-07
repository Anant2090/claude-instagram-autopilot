$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/Jakeschincariol/instagram-agent-skill.git"
$commit = "d03c56bb598be770c60b201f94237e5d1a4268a6"
$temp = Join-Path $env:TEMP "instagram-agent-skill"
$skillsDir = Join-Path (Get-Location) ".claude\skills"

if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
git clone $repoUrl $temp
git -C $temp checkout $commit
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

Get-ChildItem (Join-Path $temp "skills") -Directory -Filter "ig-*" | ForEach-Object {
    $target = Join-Path $skillsDir $_.Name
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    Copy-Item -Recurse $_.FullName $target
}
$voiceDir = Join-Path $HOME ".claude\instagram"
New-Item -ItemType Directory -Force -Path $voiceDir | Out-Null
Copy-Item "auto-generate\voice.md" (Join-Path $voiceDir "voice.md") -Force
Write-Host "Installed 13 Instagram skills into $skillsDir"
Write-Host "Voice profile copied to $voiceDir\voice.md"
