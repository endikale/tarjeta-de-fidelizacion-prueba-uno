# Genera los 4 iconos PNG del proyecto (no hace falta ejecutarlo: ya están creados).
Add-Type -AssemblyName System.Drawing

$ruta = Join-Path $PSScriptRoot 'icons'
New-Item -ItemType Directory -Force -Path $ruta | Out-Null

function Add-Rounded([System.Drawing.Drawing2D.GraphicsPath]$path, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
  $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
  $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
  $path.CloseFigure()
}

function Save-Sizes([System.Drawing.Bitmap]$bmp, [string]$nombre) {
  foreach ($tamano in @(192, 512)) {
    $salida = New-Object System.Drawing.Bitmap($tamano, $tamano)
    $g = [System.Drawing.Graphics]::FromImage($salida)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($bmp, 0, 0, $tamano, $tamano)
    $destino = Join-Path $ruta ($nombre + '-' + $tamano + '.png')
    $salida.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $salida.Dispose()
  }
  $bmp.Dispose()
}

# CLIENTE: tarjeta con sellos sobre fondo ámbar.
$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

$fondo = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-Rounded $fondo 0 0 1024 1024 220
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), $fondo)

$tarjeta = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-Rounded $tarjeta 180 320 664 400 44
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $tarjeta)
$pluma = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(17, 24, 39), 14)
$g.DrawPath($pluma, $tarjeta)

for ($i = 0; $i -lt 5; $i++) {
  $cx = 272 + $i * 120
  $cy = 520
  $rect = New-Object System.Drawing.RectangleF(($cx - 36), ($cy - 36), 72, 72)
  if ($i -lt 3) {
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(17, 24, 39))), $rect)
  } else {
    $g.DrawEllipse($pluma, $rect)
  }
}
$g.Dispose()
Save-Sizes $bmp 'cliente'

# DUEÑA: sello con check sobre fondo oscuro.
$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

$fondo = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-Rounded $fondo 0 0 1024 1024 220
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(17, 24, 39))), $fondo)
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 242, 242, 540, 540)

$check = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 48)
$check.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$check.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$check.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($check, @(
  (New-Object System.Drawing.PointF(378, 520)),
  (New-Object System.Drawing.PointF(474, 616)),
  (New-Object System.Drawing.PointF(656, 414))
))
$g.Dispose()
Save-Sizes $bmp 'duena'

Get-ChildItem $ruta | Select-Object Name, Length | Format-Table -AutoSize
