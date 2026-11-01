// Plaza Market  actualizacion automatica
// Cada pagina trae <meta name="pm-version">. Si en /version.json hay una version mas nueva
// de esta pagina, se recarga sola (nadie tiene que tocar F5 ni Ctrl+F5).
// Si la persona esta escribiendo algo, no la interrumpe: espera, o le ofrece un boton.
(function () {
  if (window.__pmUpdate) return; window.__pmUpdate = true;

  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); } catch (e) {}

  // ---- Desde donde usa Plaza Market esta persona: la app de Play Store o la pagina web ----
  // La app de Play Store abre la pagina con referrer "android-app://..." y en modo pantalla completa.
  var SB = 'https://djpjgublkjtmprkcypma.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcGpndWJsa2p0bXBya2N5cG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDYwNTQsImV4cCI6MjA5ODg4MjA1NH0.pp3dWXoa-5iUtciNYce6L6DSOWuw3vbd-Do_YlhxusM';
  function canal() {
    try {
      var r = document.referrer || '';
      if (r.indexOf('android-app://') === 0) { sessionStorage.setItem('pm_twa', '1'); localStorage.setItem('pm_tiene_app', '1'); }
      if (sessionStorage.getItem('pm_twa') === '1') return 'app';
      var sa = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
      if (sa && /android/i.test(navigator.userAgent)) { localStorage.setItem('pm_tiene_app', '1'); return 'app'; }
      if (sa) return 'web-instalada';
    } catch (e) {}
    return 'web';
  }
  window.pmCanal = canal;
  function marcarUsoApp() {          // una vez por dia: anota en el perfil que esta persona usa la app
    try {
      var hoy = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('pm_app_uso') === hoy) return;
      var k = Object.keys(localStorage).filter(function (x) { return /^sb-.*-auth-token$/.test(x); })[0];
      if (!k) return;
      var s = JSON.parse(localStorage.getItem(k) || '{}');
      var tok = s.access_token, uid = s.user && s.user.id;
      if (!tok || !uid || (s.expires_at && s.expires_at * 1000 < Date.now())) return;
      var base = SB + '/rest/v1/pm_perfiles?id=eq.' + uid;
      var h = { apikey: ANON, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
      var ahora = new Date().toISOString();
      fetch(base, { method: 'PATCH', headers: h, body: JSON.stringify({ ultimo_uso_app: ahora }) })
        .then(function (r) { if (r.ok) localStorage.setItem('pm_app_uso', hoy); }).catch(function () {});
      fetch(base + '&usa_app_desde=is.null', { method: 'PATCH', headers: h, body: JSON.stringify({ usa_app_desde: ahora }) }).catch(function () {});
    } catch (e) {}
  }
  if (canal() === 'app') setTimeout(marcarUsoApp, 4000);

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
