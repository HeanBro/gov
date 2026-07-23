$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path (Split-Path -Parent $root) 'scripts\static-server.mjs'
$server = Start-Process -FilePath 'node.exe' -ArgumentList @($serverScript, $root, '4173') -WindowStyle Hidden -PassThru

Start-Sleep -Milliseconds 700
Start-Process 'http://127.0.0.1:4173/index.html'

Write-Host '企业经营管理驾驶舱 H5 已启动：http://127.0.0.1:4173/index.html'
Write-Host '按 Enter 停止本地服务器。'
Read-Host

if (-not $server.HasExited) {
  Stop-Process -Id $server.Id
}
