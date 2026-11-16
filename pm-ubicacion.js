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

  window.PMU = { montar: montar, leer: leer, setear: setear, guardar: guardar, valores: valores, pedirSiFalta: pedirSiFalta, cp4: cp4 };
})();
