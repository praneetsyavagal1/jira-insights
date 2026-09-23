param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $NpmArguments
)

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS*\node-*-win-x64\node.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $nodeExecutable) {
  throw "Node.js was not found. Install the Node.js LTS package or restart the shell."
}

$nodeRoot = Split-Path $nodeExecutable -Parent
$npmCli = Join-Path $nodeRoot "node_modules\npm\bin\npm-cli.js"
$env:Path = "$nodeRoot;$env:Path"
$env:NODE_USE_SYSTEM_CA = "1"

& $nodeExecutable --use-system-ca $npmCli @NpmArguments
exit $LASTEXITCODE
