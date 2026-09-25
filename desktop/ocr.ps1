param([string]$ListFile, [string]$Lang = "ko")
# re:boot console - Windows built-in OCR (Windows.Media.Ocr).
# Input: a UTF-8 text file with one image path per line. Output: JSON array, same order, lines + words with pixel boxes.
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$t) { $m = $asTaskGeneric.MakeGenericMethod($t); $task = $m.Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new($Lang))
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }
$paths = @(Get-Content -LiteralPath $ListFile -Encoding UTF8 | Where-Object { $_.Trim() -ne "" } | ForEach-Object { [string]($_.ToString().Trim()) })
$results = @()
foreach ($p0 in $paths) {
  $p = [string]$p0
  try {
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($p)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $res = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $lines = @()
    foreach ($ln in $res.Lines) {
      $ws = @(); $x1 = 1e9; $y1 = 1e9; $x2 = 0; $y2 = 0
      foreach ($w in $ln.Words) {
        $r = $w.BoundingRect
        $ws += @{ t = [string]$w.Text; x = [int]$r.X; y = [int]$r.Y; w = [int]$r.Width; h = [int]$r.Height }
        if ($r.X -lt $x1) { $x1 = $r.X }; if ($r.Y -lt $y1) { $y1 = $r.Y }
        if ($r.X + $r.Width -gt $x2) { $x2 = $r.X + $r.Width }; if ($r.Y + $r.Height -gt $y2) { $y2 = $r.Y + $r.Height }
      }
      $lines += @{ text = [string]$ln.Text; x = [int]$x1; y = [int]$y1; w = [int]($x2 - $x1); h = [int]($y2 - $y1); words = $ws }
    }
    $results += @{ ok = $true; path = $p; w = $bmp.PixelWidth; h = $bmp.PixelHeight; lines = $lines }
    $stream.Dispose()
  } catch {
    $results += @{ ok = $false; path = $p; error = [string]$_.Exception.Message }
  }
}
ConvertTo-Json -InputObject @($results) -Depth 7 -Compress
