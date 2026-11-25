// Genera una página liviana por publicación (p/<id>/index.html) con la vista previa
// (foto, título y precio) para cuando se comparte el enlace en WhatsApp, Facebook o Instagram.
// Lo corre GitHub Actions cada 10 minutos.
import fs from 'node:fs';
import path from 'node:path';

const URL_SB = 'https://djpjgublkjtmprkcypma.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcGpndWJsa2p0bXBya2N5cG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDYwNTQsImV4cCI6MjA5ODg4MjA1NH0.pp3dWXoa-5iUtciNYce6L6DSOWuw3vbd-Do_YlhxusM';
const SITIO = 'https://plazamarket.com.ar';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pesos = n => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');
const esVideo = u => /\.(mp4|mov|webm|m4v|3gp)(\?|$)/i.test(u || '');

const r = await fetch(`${URL_SB}/rest/v1/productos?select=id,titulo,descripcion,precio,estado,tipo,fotos,activa&activa=neq.false&order=id.asc&limit=2000`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
});
if (!r.ok) { console.error('Error al leer productos', r.status, await r.text()); process.exit(1); }
const prods = await r.json();

const dir = 'p';
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

for (const p of prods) {
  const foto = (p.fotos || []).find(u => u && !esVideo(u)) || `${SITIO}/icon-512.png`;
  const consultar = p.estado === 'consultar';
  const precio = consultar ? 'Consultá el precio' : pesos(p.precio);
  const titulo = `${p.titulo} — ${precio}`;
  const extra = p.tipo === 'servicio' ? 'Reservás con una seña del 20%.' : 'Envíos a todo el país. Pagás por Mercado Pago.';
  const desc = `${precio} en Plaza Market. ${extra}`;
  const destino = `/plaza-market-catalogo.html?id=${p.id}`;
  const url = `${SITIO}/p/${p.id}/`;
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titulo)} | Plaza Market</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Plaza Market">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(foto)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="es_AR">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0B1120">
<link rel="icon" href="/icon-192.png">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B1120;color:#E2E8F0;font-family:Arial,sans-serif;text-align:center;padding:20px}img{max-width:260px;max-height:260px;border-radius:16px;object-fit:cover}a{display:inline-block;margin-top:16px;background:#0052D4;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700}</style>
<script>location.replace(${JSON.stringify(destino)});</script>
</head>
<body>
<div><img src="${esc(foto)}" alt=""><h1 style="font-size:1.2rem">${esc(p.titulo)}</h1><p style="font-size:1.3rem;font-weight:800;color:#FFD60A">${esc(precio)}</p><a href="${destino}">Ver en Plaza Market</a></div>
</body>
</html>
`;
  fs.mkdirSync(path.join(dir, String(p.id)), { recursive: true });
  fs.writeFileSync(path.join(dir, String(p.id), 'index.html'), html);
}
console.log('Fichas generadas:', prods.length);
