/* Plaza Market - Motor de Tour guiado (compartido). Cada pagina define window.PM_TOUR = {key, steps:[{sel,title,text}]}. */
(function(){
  if(window.__pmTourEngine) return; window.__pmTourEngine=true;
  var CFG = window.PM_TOUR || {};
  var KEY = CFG.key || 'pm_tour_generic_v1';
  var steps = CFG.steps || [];
  var css = ".pmTour-overlay{position:fixed;inset:0;z-index:99998;pointer-events:auto;background:transparent;}"
    +".pmTour-ring{position:absolute;border:3px solid #7dd3fc;border-radius:14px;box-shadow:0 0 0 9999px rgba(2,6,23,.74);transition:top .3s ease,left .3s ease,width .3s ease,height .3s ease;pointer-events:none;}"
    +".pmTour-card{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);width:min(93vw,430px);background:#0f172a;border:1px solid rgba(125,211,252,.35);border-radius:18px;padding:16px 18px 15px;z-index:99999;box-shadow:0 14px 44px rgba(0,0,0,.55);font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    +".pmTour-step{color:#7dd3fc;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px;}"
    +".pmTour-title{color:#fff;font-size:1.08rem;font-weight:800;margin-bottom:6px;}"
    +".pmTour-text{color:#cbd5e1;font-size:.93rem;line-height:1.55;margin-bottom:14px;}"
    +".pmTour-btns{display:flex;justify-content:space-between;align-items:center;gap:10px;}"
    +".pmTour-skip{background:transparent;border:none;color:#94a3b8;font-size:.9rem;cursor:pointer;padding:8px 4px;}"
    +".pmTour-next{background:linear-gradient(160deg,#60a5fa,#6366f1);border:none;color:#fff;font-weight:800;font-size:.95rem;padding:10px 20px;border-radius:11px;cursor:pointer;}"
    +".pmTour-help{position:fixed;right:14px;bottom:14px;z-index:99990;background:linear-gradient(160deg,#60a5fa,#6366f1);color:#fff;border:none;border-radius:999px;padding:9px 15px;font-weight:800;font-size:.86rem;box-shadow:0 6px 20px rgba(0,0,0,.42);cursor:pointer;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;}"
    +".pmTour-help:active{transform:scale(.96);}";
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var i=0, ring, card, overlay;
  function mk(tag,cls){var e=document.createElement(tag); if(cls)e.className=cls; return e;}
  function build(){ overlay=mk('div','pmTour-overlay'); ring=mk('div','pmTour-ring'); card=mk('div','pmTour-card'); overlay.appendChild(ring); document.body.appendChild(overlay); document.body.appendChild(card); }
  function render(){
    var s=steps[i];
    var target=null; try{ target = s.sel?document.querySelector(s.sel):null; }catch(e){ target=null; }
    if(target){ try{target.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){} }
    setTimeout(function(){
      if(!card) return;
      if(target){ var r=target.getBoundingClientRect(); var pad=8; ring.style.display='block'; ring.style.top=(r.top-pad)+'px'; ring.style.left=(r.left-pad)+'px'; ring.style.width=(r.width+pad*2)+'px'; ring.style.height=(r.height+pad*2)+'px'; overlay.style.background='transparent'; }
      else { ring.style.display='none'; overlay.style.background='rgba(2,6,23,.74)'; }
      card.innerHTML='<div class="pmTour-step">Paso '+(i+1)+' de '+steps.length+'</div>'
        +'<div class="pmTour-title">'+s.title+'</div>'
        +'<div class="pmTour-text">'+s.text+'</div>'
        +'<div class="pmTour-btns"><button class="pmTour-skip" id="pmTourSkip">Saltar</button>'
        +'<button class="pmTour-next" id="pmTourNext">'+(i===steps.length-1?'\u00A1Entendido!':'Siguiente \u2192')+'</button></div>';
      document.getElementById('pmTourNext').onclick=next; document.getElementById('pmTourSkip').onclick=end;
    }, target?350:10);
  }
  function next(){ i++; if(i>=steps.length) end(); else render(); }
  function end(){ try{localStorage.setItem(KEY,'1');}catch(e){} if(overlay)overlay.remove(); if(card)card.remove(); overlay=card=ring=null; }
  function start(){ if(!steps.length) return; i=0; if(overlay)overlay.remove(); if(card)card.remove(); build(); render(); }
  window.pmStartTour=start;
  function addHelp(){ if(document.getElementById('pmTourHelp')||!steps.length) return; var h=mk('button','pmTour-help'); h.id='pmTourHelp'; h.innerHTML='\u2753 Ayuda'; h.onclick=start; document.body.appendChild(h); }
  function boot(){ addHelp(); try{ if(steps.length && !localStorage.getItem(KEY)){ setTimeout(start,1000); } }catch(e){} }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',boot); } else { boot(); }
})();
