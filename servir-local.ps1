# Servidor estático solo para probar en localhost (no se usa en producción).
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8765/')
$listener.Start()
Write-Output 'Servidor en http://localhost:8765/'

$mimes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.md'   = 'text/plain; charset=utf-8'
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $relativa = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrEmpty($relativa)) { $relativa = 'index.html' }
    $archivo = [System.IO.Path]::GetFullPath((Join-Path $root $relativa))
    if (-not $archivo.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $archivo -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $datos = [System.Text.Encoding]::UTF8.GetBytes('No encontrado')
      $ctx.Response.OutputStream.Write($datos, 0, $datos.Length)
    } else {
      $extension = [System.IO.Path]::GetExtension($archivo).ToLowerInvariant()
      $ctx.Response.ContentType = $mimes[$extension]
      $datos = [System.IO.File]::ReadAllBytes($archivo)
      $ctx.Response.ContentLength64 = $datos.Length
      $ctx.Response.OutputStream.Write($datos, 0, $datos.Length)
    }
    $ctx.Response.Close()
  }
} finally {
  $listener.Stop()
}
