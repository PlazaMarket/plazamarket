// Plaza Market  actualizacion automatica
// Cada pagina trae <meta name="pm-version">. Si en /version.json hay una version mas nueva
// de esta pagina, se recarga sola (nadie tiene que tocar F5 ni Ctrl+F5).
// Si la persona esta escribiendo algo, no la interrumpe: espera, o le ofrece un boton.
(function () {
  if (window.__pmUpdate) return; window.__pmUpdate = true;

  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); } catch (e) {}

  var meta = document.querySelector('meta[name="pm-version"]');
  var mia = meta ? meta.content : '';
  if (!mia) return;
  var pagina = location.pathname.split('/').pop() || 'index.html';
  if (!/\.html$/.test(pagina)) pagina += '.html';

  function escribiendo() {
    var a = document.activeElement;
    return !!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable));
  }
  function formularioConDatos() {
    var campos = document.querySelectorAll('input[type=text],input[type=email],input[type=tel],input[type=password],input[type=number],input:not([type]),textarea');
    for (var i = 0; i < campos.length; i++) {
      var c = campos[i];
      if (c.readOnly || c.disabled || c.offsetParent === null) continue;
      if (/buscador|busq|search/i.test(c.id + ' ' + c.name)) continue;
      if ((c.value || '').trim() && c.value !== c.defaultValue) return true;
    }
    return false;
  }

  function recargar(nueva) {
    var clave = 'pm_upd_' + pagina + '_' + nueva, intentos = 0;
    try { intentos = +(sessionStorage.getItem(clave) || 0); sessionStorage.setItem(clave, intentos + 1); } catch (e) {}
    if (intentos >= 2) return;                 // nunca entra en un bucle de recargas
    if (intentos === 0) { location.reload(); return; }
    var u = new URL(location.href); u.searchParams.set('v', nueva); location.replace(u.toString());
  }

  var barra = null;
  function ofrecer(nueva) {
    if (barra) return;
    barra = document.createElement('div');
    barra.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;background:#0f172a;color:#e2e8f0;' +
      'border:1px solid rgba(96,165,250,.5);border-radius:14px;padding:10px 12px 10px 16px;font:600 14px/1.3 Inter,system-ui,sans-serif;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.5);display:flex;gap:12px;align-items:center;max-width:92vw;';
    barra.innerHTML = '<span>\u2728 Hay una versi\u00f3n nueva de Plaza Market</span>';
    var b = document.createElement('button');
    b.textContent = 'Actualizar';
    b.style.cssText = 'background:#2563eb;color:#fff;border:none;border-radius:10px;padding:8px 14px;font:700 14px Inter,system-ui,sans-serif;cursor:pointer;';
    b.onclick = function () { recargar(nueva); };
    barra.appendChild(b);
    document.body.appendChild(barra);
  }

  var pendiente = null;
  function revisar() {
    fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) {
        if (!v) return;
        var nueva = v[pagina];
        if (!nueva || nueva <= mia) return;   // misma version (o mas vieja): no hace nada
        if (escribiendo() || formularioConDatos()) { pendiente = nueva; ofrecer(nueva); return; }
        recargar(nueva);
      })
      .catch(function () {});
  }

  setTimeout(revisar, 2500);                                   // al entrar
  setInterval(revisar, 3 * 60 * 1000);                         // cada 3 minutos
  document.addEventListener('visibilitychange', function () {  // al volver a la app o a la pestana
    if (document.visibilityState === 'visible') revisar();
  });
  window.addEventListener('focus', revisar);
})();
