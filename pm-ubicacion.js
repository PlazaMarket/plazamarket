/* Plaza Market — Provincia, localidad y código postal de cada usuario.
   Se usa en el registro, en "Mi perfil" y en un aviso de una sola vez para los
   usuarios que ya estaban registrados y no lo tienen cargado.
   Las localidades se sugieren con la API oficial Georef (datos.gob.ar). */
(function () {
  var PROVINCIAS = [
    ['02', 'Ciudad Autónoma de Buenos Aires'], ['06', 'Buenos Aires'], ['10', 'Catamarca'], ['22', 'Chaco'],
    ['26', 'Chubut'], ['14', 'Córdoba'], ['18', 'Corrientes'], ['30', 'Entre Ríos'], ['34', 'Formosa'],
    ['38', 'Jujuy'], ['42', 'La Pampa'], ['46', 'La Rioja'], ['50', 'Mendoza'], ['54', 'Misiones'],
    ['58', 'Neuquén'], ['62', 'Río Negro'], ['66', 'Salta'], ['70', 'San Juan'], ['74', 'San Luis'],
    ['78', 'Santa Cruz'], ['82', 'Santa Fe'], ['86', 'Santiago del Estero'], ['94', 'Tierra del Fuego'], ['90', 'Tucumán']
  ];
  var n = 0;

  function css() {
    if (document.getElementById('pmu-css')) return;
    var s = document.createElement('style'); s.id = 'pmu-css';
    s.textContent =
      '.pmu-sel{width:100%;font-size:.92rem;color:#fff;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.15);border-radius:.8rem;padding:.8rem 1rem;outline:none;-webkit-appearance:none;appearance:none;' +
      'background-image:linear-gradient(45deg,transparent 50%,#94A3B8 50%),linear-gradient(135deg,#94A3B8 50%,transparent 50%);background-position:calc(100% - 20px) 55%,calc(100% - 14px) 55%;background-size:6px 6px;background-repeat:no-repeat}' +
      '.pmu-sel:focus{border-color:#3B82F6;box-shadow:0 0 0 4px rgba(0,82,212,.22)}.pmu-sel option{color:#0B1120}' +
      '.pmu-ayuda{font-size:.76rem;color:rgba(226,232,240,.55);margin-top:.35rem;line-height:1.4}.pmu-ayuda a{color:#93C5FD}' +
      '.pmu-ov{position:fixed;inset:0;background:rgba(2,6,23,.72);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.pmu-box{width:100%;max-width:440px;max-height:92vh;overflow:auto;background:#0f172a;border:1px solid rgba(96,165,250,.3);border-radius:18px;padding:20px;color:#E2E8F0;font-family:Inter,"Segoe UI",Arial,sans-serif}' +
      '.pmu-box h3{font-size:1.2rem;font-weight:800;color:#fff;margin:0 0 .3rem}.pmu-box p.pmu-sub{font-size:.88rem;color:#CBD5E1;margin:0 0 .6rem;line-height:1.45}' +
      '.pmu-box label{display:block;font-size:.85rem;font-weight:700;color:#fff;margin-top:.9rem}' +
      '.pmu-box input{width:100%;margin-top:.4rem;font-size:1rem;color:#fff;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.15);border-radius:.8rem;padding:.8rem 1rem;outline:none;box-sizing:border-box}' +
      '.pmu-box select{margin-top:.4rem}.pmu-msg{color:#FCA5A5;font-size:.84rem;margin-top:.7rem;min-height:1em}' +
      '.pmu-btn{width:100%;margin-top:.9rem;border:0;border-radius:12px;padding:.9rem;font-weight:800;font-size:1rem;cursor:pointer;background:linear-gradient(135deg,#0052D4,#3949AB);color:#fff}' +
      '.pmu-luego{width:100%;margin-top:.5rem;border:0;background:transparent;color:#94A3B8;font-size:.85rem;cursor:pointer;padding:.4rem}';
    document.head.appendChild(s);
  }

  /* Dibuja los 3 campos dentro de "el". opts.campoClass: clase del contenedor de cada campo (ej. "campo").
     opts.inputClass: clase extra para los inputs (ej. "mt-2"). */
  function montar(el, opts) {
    css(); opts = opts || {}; n++;
    var id = 'pmu' + n, cc = opts.campoClass || '', ic = opts.inputClass || '';
    var ops = '<option value="">Elegí tu provincia</option>' + PROVINCIAS.map(function (p) { return '<option value="' + p[1] + '" data-id="' + p[0] + '">' + p[1] + '</option>'; }).join('');
    el.innerHTML =
      '<div class="' + cc + '" style="margin-top:' + (cc ? '0' : '1rem') + '"><label>Provincia *</label><select class="pmu-sel pmu-prov ' + ic + '">' + ops + '</select></div>' +
      '<div class="' + cc + '" style="margin-top:' + (cc ? '0' : '1rem') + '"><label>Localidad *</label><input type="text" class="pmu-loc ' + ic + '" list="' + id + '-dl" placeholder="Ej: Lanús, Rosario, Godoy Cruz" autocomplete="address-level2"><datalist id="' + id + '-dl"></datalist></div>' +
      '<div class="' + cc + '" style="margin-top:' + (cc ? '0' : '1rem') + '"><label>Código postal *</label><input type="text" class="pmu-cp ' + ic + '" placeholder="Ej: 1824" inputmode="numeric" maxlength="8" autocomplete="postal-code">' +
      '<p class="pmu-ayuda">Son 4 números. Si no lo sabés, buscalo en <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noopener">Correo Argentino</a>.</p></div>';
    var loc = el.querySelector('.pmu-loc'), prov = el.querySelector('.pmu-prov'), dl = el.querySelector('datalist'), t = null;
    loc.addEventListener('input', function () {
      clearTimeout(t);
      var q = loc.value.trim(); if (q.length < 3) return;
      t = setTimeout(function () {
        var o = prov.selectedOptions[0], pid = o && o.dataset.id ? '&provincia=' + o.dataset.id : '';
        fetch('https://apis.datos.gob.ar/georef/api/localidades?nombre=' + encodeURIComponent(q) + pid + '&max=12&campos=nombre,municipio.nombre,provincia.nombre')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var vistos = {};
            dl.innerHTML = (j.localidades || []).map(function (l) {
              if (vistos[l.nombre]) return ''; vistos[l.nombre] = 1;
              return '<option value="' + l.nombre.replace(/"/g, '&quot;') + '">' + (l.municipio && l.municipio.nombre ? l.municipio.nombre + ', ' : '') + (l.provincia ? l.provincia.nombre : '') + '</option>';
            }).join('');
          }).catch(function () {});
      }, 280);
    });
    return el;
  }

  function cp4(v) { var m = String(v || '').toUpperCase().match(/\d{4}/); return m ? m[0] : ''; }

  /* Lee y valida. Devuelve { provincia, localidad, cp } o { error } */
  function leer(el) {
    var provincia = el.querySelector('.pmu-prov').value.trim();
    var localidad = el.querySelector('.pmu-loc').value.trim().replace(/\s+/g, ' ');
    var cp = cp4(el.querySelector('.pmu-cp').value);
    if (!provincia) return { error: 'Elegí tu provincia.' };
    if (localidad.length < 2) return { error: 'Escribí tu localidad.' };
    if (!cp) return { error: 'Revisá el código postal: son 4 números (ej: 1824).' };
    return { provincia: provincia, localidad: localidad, cp: cp };
  }

  function setear(el, v) {
    v = v || {};
    if (v.provincia) el.querySelector('.pmu-prov').value = v.provincia;
    if (v.localidad) el.querySelector('.pmu-loc').value = v.localidad;
    if (v.cp) el.querySelector('.pmu-cp').value = v.cp;
  }

  /* Guarda en el perfil. El CP va en cp_origen; provincia y localidad en sus columnas.
     Además queda copia en los datos de la cuenta, por las dudas. */
  async function guardar(cli, uid, v) {
    var r1 = await cli.from('pm_perfiles').update({ cp_origen: v.cp }).eq('id', uid);
    var r2 = await cli.from('pm_perfiles').update({ provincia: v.provincia, localidad: v.localidad }).eq('id', uid);
    try { await cli.auth.updateUser({ data: { provincia: v.provincia, localidad: v.localidad, cp: v.cp } }); } catch (e) {}
    if (r1.error) throw r1.error;
    return !r2.error;
  }

  /* Valores ya guardados: del perfil o, si no, de los datos de la cuenta */
  function valores(perf, user) {
    var m = (user && user.user_metadata) || {};
    perf = perf || {};
    return { provincia: perf.provincia || m.provincia || '', localidad: perf.localidad || m.localidad || '', cp: perf.cp_origen || m.cp || '' };
  }

  /* Aviso de una sola vez para los que ya estaban registrados */
  async function pedirSiFalta(cli) {
    try {
      if (!cli) return;
      if (sessionStorage.getItem('pmu_luego')) return;
      var s = (await cli.auth.getSession()).data.session; if (!s) return;
      var perf = (await cli.from('pm_perfiles').select('*').eq('id', s.user.id).maybeSingle()).data;
      if (!perf) return;
      var v = valores(perf, s.user);
      if (v.provincia && v.localidad && v.cp) return;
      css();
      var ov = document.createElement('div'); ov.className = 'pmu-ov';
      ov.innerHTML = '<div class="pmu-box"><h3>📍 ¿De dónde sos?</h3><p class="pmu-sub">Contanos tu provincia, localidad y código postal. Así calculamos bien los envíos y te mostramos lo que tenés cerca. Lo hacés una sola vez.</p><div class="pmu-campos"></div><div class="pmu-msg"></div><button class="pmu-btn" type="button">Guardar</button><button class="pmu-luego" type="button">Más tarde</button></div>';
      document.body.appendChild(ov);
      var campos = montar(ov.querySelector('.pmu-campos'), {});
      setear(campos, v);
      ov.querySelector('.pmu-luego').onclick = function () { try { sessionStorage.setItem('pmu_luego', '1'); } catch (e) {} ov.remove(); };
      ov.querySelector('.pmu-btn').onclick = async function () {
        var r = leer(campos), msg = ov.querySelector('.pmu-msg'); msg.textContent = '';
        if (r.error) { msg.textContent = r.error; return; }
        this.disabled = true; this.textContent = 'Guardando...';
        try { await guardar(cli, s.user.id, r); ov.remove(); }
        catch (e) { msg.textContent = 'No se pudo guardar. Probá de nuevo.'; this.disabled = false; this.textContent = 'Guardar'; }
      };
    } catch (e) { console.error('pmu', e); }
  }


  /* ───────── Cuenta completa ───────── */
  var AREAS_OK = ' 11 220 2202 221 2221 2223 2224 2225 2226 2227 2229 223 2241 2242 2243 2244 2245 2246 2252 2254 2255 2257 2261 2262 2264 2265 2266 2267 2268 2271 2272 2273 2274 2281 2283 2284 2285 2286 2291 2292 2296 2297 230 2302 2314 2316 2317 2320 2323 2324 2325 2326 2331 2333 2334 2335 2336 2337 2338 2342 2343 2344 2345 2346 2352 2353 2354 2355 2356 2357 2358 236 237 2392 2393 2394 2395 2396 2473 2474 2475 2477 2478 249 260 261 2622 2624 2625 2626 263 264 2646 2647 2648 2651 2655 2656 2657 2658 266 280 2901 2902 2903 291 2920 2921 2922 2923 2924 2925 2926 2927 2928 2929 2931 2932 2933 2934 2935 2936 294 2940 2942 2945 2946 2948 2952 2953 2954 2962 2963 2964 2966 297 2972 298 2982 2983 299 3327 3329 336 3382 3385 3387 3388 3400 3401 3402 3404 3405 3406 3407 3408 3409 341 342 343 3435 3436 3437 3438 3442 3444 3445 3446 3447 345 3454 3455 3456 3458 3460 3462 3463 3464 3465 3466 3467 3468 3469 3471 3472 3476 348 3482 3483 3487 3489 3491 3492 3493 3496 3497 3498 351 3521 3522 3524 3525 353 3532 3533 3537 3541 3542 3543 3544 3546 3547 3548 3549 3562 3563 3564 3571 3572 3573 3574 3575 3576 358 3582 3583 3584 3585 362 364 370 3711 3715 3716 3718 3721 3725 3731 3734 3735 3741 3743 3751 3754 3755 3756 3757 3758 376 3772 3773 3774 3775 3777 3781 3782 3786 379 380 381 3821 3825 3826 3827 383 3832 3835 3837 3838 3841 3843 3844 3845 3846 385 3854 3855 3856 3857 3858 3861 3862 3863 3865 3867 3868 3869 387 3873 3876 3877 3878 388 3885 3886 3887 3888 3891 3892 3894 ';
  function celularValido(tel) {
    var d = String(tel || '').replace(/\D/g, '');
    if (d.indexOf('54') === 0) d = d.slice(2);
    if (d.indexOf('9') === 0) d = d.slice(1);
    while (d.indexOf('0') === 0) d = d.slice(1);
    if (d.length !== 10) return false;
    return [4, 3, 2].some(function (l) { return AREAS_OK.indexOf(' ' + d.slice(0, l) + ' ') !== -1; });
  }
  /* Qué le falta a la cuenta. accion: 'comprar' | 'vender' */
  function faltantes(perf, user, accion) {
    perf = perf || {}; var v = valores(perf, user), f = [];
    if (!String(perf.nombre || '').trim()) f.push('nombre');
    if (!celularValido(perf.telefono)) f.push('celular');
    if (!v.provincia || !v.localidad || !v.cp) f.push('ubicacion');
    if (accion === 'vender' && !perf.mp_conectado) f.push('mp');
    return f;
  }
  var TXT = { nombre: 'Tu nombre y apellido', celular: 'Un celular válido (con código de área, sin 0 ni 15)', ubicacion: 'Tu provincia, localidad y código postal', mp: 'Conectar tu Mercado Pago (para cobrar tus ventas)' };

  /* Antes de comprar o vender. Devuelve true si la cuenta está completa;
     si no, muestra qué paso falta (con los campos para completarlo) y devuelve false. */
  async function verificarCuenta(cli, accion) {
    try {
      var s = (await cli.auth.getSession()).data.session; if (!s) return true;
      var perf = (await cli.from('pm_perfiles').select('*').eq('id', s.user.id).maybeSingle()).data || {};
      var f = faltantes(perf, s.user, accion);
      if (!f.length) return true;
      css();
      var verbo = accion === 'vender' ? 'publicar y vender' : 'comprar';
      var ov = document.createElement('div'); ov.className = 'pmu-ov';
      var pasos = f.map(function (k, i) { return '<li style="margin:.25rem 0;">' + (i + 1) + '. ' + TXT[k] + '</li>'; }).join('');
      var form = '';
      if (f.indexOf('nombre') !== -1) form += '<label>Nombre y apellido *</label><input type="text" class="pmu-nom" autocomplete="name">';
      if (f.indexOf('celular') !== -1) form += '<label>Celular *</label><input type="tel" class="pmu-tel" inputmode="numeric" placeholder="Ej: 11 2345 6789" value="' + String(perf.telefono || '').replace(/"/g, '') + '"><p class="pmu-ayuda">Código de área + número, sin el 0 y sin el 15.</p>';
      var datos = (f.indexOf('nombre') !== -1 || f.indexOf('celular') !== -1 || f.indexOf('ubicacion') !== -1);
      ov.innerHTML = '<div class="pmu-box"><h3>⚠️ Tu cuenta está incompleta</h3><p class="pmu-sub">Para ' + verbo + ' te falta:</p><ul style="list-style:none;padding:0;margin:0 0 .4rem;font-size:.9rem;color:#FDE68A;">' + pasos + '</ul>' +
        (datos ? form + '<div class="pmu-campos"></div><div class="pmu-msg"></div><button class="pmu-btn pmu-ok" type="button">Guardar mis datos</button>' : '') +
        (f.indexOf('mp') !== -1 ? '<button class="pmu-btn pmu-mp" type="button" style="background:linear-gradient(135deg,#009EE3,#0070BA);">💳 Conectar Mercado Pago</button><p class="pmu-ayuda" style="text-align:center;">Es un solo paso y no se mueve ni un peso: solo queda enlazada tu cuenta para cobrar.</p>' : '') +
        '<button class="pmu-luego" type="button">Ahora no, sigo mirando</button></div>';
      document.body.appendChild(ov);
      var campos = null;
      if (f.indexOf('ubicacion') !== -1) { campos = montar(ov.querySelector('.pmu-campos'), {}); setear(campos, valores(perf, s.user)); }
      ov.querySelector('.pmu-luego').onclick = function () { ov.remove(); };
      var bmp = ov.querySelector('.pmu-mp');
      if (bmp) bmp.onclick = function () {
        if (typeof window.conectarMercadoPago === 'function') { ov.remove(); window.conectarMercadoPago(); }
        else location.href = 'plaza-market-panel-carga-productos.html#seccionCobros';
      };
      var bok = ov.querySelector('.pmu-ok');
      if (bok) bok.onclick = async function () {
        var msg = ov.querySelector('.pmu-msg'); msg.textContent = '';
        var upd = {};
        var en = ov.querySelector('.pmu-nom'); if (en) { if (en.value.trim().length < 3) { msg.textContent = 'Escribí tu nombre y apellido.'; return; } upd.nombre = en.value.trim(); }
        var et = ov.querySelector('.pmu-tel'); if (et) { if (!celularValido(et.value)) { msg.textContent = 'Revisá el celular: 10 números, con código de área y sin el 0 ni el 15. Ej: 11 2345 6789.'; return; } var d = et.value.replace(/\D/g, ''); if (d.indexOf('54') === 0) d = d.slice(2); if (d.indexOf('9') === 0) d = d.slice(1); while (d.indexOf('0') === 0) d = d.slice(1); upd.telefono = d; }
        var ub = null; if (campos) { ub = leer(campos); if (ub.error) { msg.textContent = ub.error; return; } }
        bok.disabled = true; bok.textContent = 'Guardando...';
        try {
          if (Object.keys(upd).length) { var r = await cli.from('pm_perfiles').update(upd).eq('id', s.user.id); if (r.error) throw r.error; }
          if (ub) await guardar(cli, s.user.id, ub);
          var quedaMp = f.indexOf('mp') !== -1;
          ov.querySelector('.pmu-box').innerHTML = '<h3>✅ ¡Listo!</h3><p class="pmu-sub">' + (quedaMp ? 'Tus datos quedaron guardados. Ahora solo falta conectar tu Mercado Pago para poder vender.' : 'Tu cuenta ya está completa. Tocá de nuevo el botón para ' + (accion === 'vender' ? 'publicar' : 'comprar') + '.') + '</p>' +
            (quedaMp ? '<button class="pmu-btn pmu-mp2" type="button" style="background:linear-gradient(135deg,#009EE3,#0070BA);">💳 Conectar Mercado Pago</button>' : '') + '<button class="pmu-btn pmu-cerrar" type="button">Entendido</button>';
          ov.querySelector('.pmu-cerrar').onclick = function () { ov.remove(); };
          var m2 = ov.querySelector('.pmu-mp2'); if (m2) m2.onclick = function () { if (typeof window.conectarMercadoPago === 'function') { ov.remove(); window.conectarMercadoPago(); } else location.href = 'plaza-market-panel-carga-productos.html#seccionCobros'; };
        } catch (e) { msg.textContent = 'No se pudo guardar. Probá de nuevo.'; bok.disabled = false; bok.textContent = 'Guardar mis datos'; }
      };
      return false;
    } catch (e) { console.error('pmu', e); return true; }
  }

  /* Cartel fijo "Cuenta incompleta" dentro de un contenedor (perfil / vender) */
  async function cartelIncompleta(cli, el, accion) {
    try {
      var s = (await cli.auth.getSession()).data.session; if (!s || !el) return;
      var perf = (await cli.from('pm_perfiles').select('*').eq('id', s.user.id).maybeSingle()).data || {};
      var f = faltantes(perf, s.user, accion);
      if (!f.length) { el.innerHTML = ''; return; }
      el.innerHTML = '<div style="background:rgba(250,204,21,.1);border:1px solid rgba(250,204,21,.45);border-radius:.85rem;padding:.85rem 1rem;margin-bottom:1rem;color:#FDE68A;font-size:.85rem;line-height:1.5;"><b>⚠️ Cuenta incompleta.</b> Podés mirar la plaza, pero para ' + (accion === 'vender' ? 'vender' : 'comprar o vender') + ' te falta: ' + f.map(function (k) { return TXT[k].split(' (')[0].toLowerCase(); }).join(', ') + '.</div>';
    } catch (e) {}
  }

  window.PMU = { montar: montar, leer: leer, setear: setear, guardar: guardar, valores: valores, pedirSiFalta: pedirSiFalta, cp4: cp4, celularValido: celularValido, faltantes: faltantes, verificarCuenta: verificarCuenta, cartelIncompleta: cartelIncompleta };
})();
