const sceneRegion=document.querySelector('.comic-paths');
if(sceneRegion){
 const viewport=sceneRegion.querySelector('.comic-scene-viewport'),strip=sceneRegion.querySelector('.comic-scene-strip'),scenes=[...sceneRegion.querySelectorAll('.comic-scene')],tabs=[...sceneRegion.querySelectorAll('[role=tab]')];
 const prev=sceneRegion.querySelector('[data-scene-prev]'),next=sceneRegion.querySelector('[data-scene-next]'),replay=sceneRegion.querySelector('[data-replay]');
 viewport.tabIndex=0;sceneRegion.classList.add('scene-ready');
 const media=matchMedia('(prefers-reduced-motion:reduce)');let animations=[],generation=0,opened=false,drag=null;
 const number=(name,fallback)=>{const value=parseFloat(getComputedStyle(sceneRegion).getPropertyValue(name));return Number.isFinite(value)?value:fallback;};
 const reduced=()=>media.matches||sceneRegion.dataset.reduce==='true'||number('--comic-duration',900)===0;
 const index=()=>Math.max(0,scenes.findIndex(s=>s.dataset.scene===sceneRegion.dataset.selected));
 function stop(){generation++;for(const a of animations)a.cancel();animations=[];sceneRegion.dataset.motionState=reduced()?'static':'idle';}
 function animate(phase){
  stop();if(reduced())return;
  const current=generation,ms=phase==='opening'?number('--comic-scene',1400):number('--comic-duration',900),scene=scenes[index()];
  const props=[...scene.querySelectorAll('.comic-prop,.comic-secondary,.comic-scene-number')];if(!props.every(p=>typeof p.animate==='function'))return;
  sceneRegion.dataset.motionState=phase;
  animations=props.map((prop,i)=>prop.animate([{transform:prop.classList.contains('comic-prop')?`translateY(${number('--comic-lift',64)}px) rotate(${number('--comic-angle',-12)}deg) scale(.72)`:'translateX(48px) rotate(8deg)',opacity:.25},{transform:'translate(0px,0px) rotate(0deg) scale(1)',opacity:1}],{duration:ms,delay:i*number('--comic-stagger',90),easing:'cubic-bezier(.22,1,.36,1)'}));
  Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(current===generation){animations=[];sceneRegion.dataset.motionState='idle';}});
 }
 function syncScene(play=true){const i=index();strip.style.setProperty('--comic-index',i);prev.disabled=i===0;next.disabled=i===scenes.length-1;sceneRegion.dataset.sceneIndex=String(i);if(play)animate('scene-transition');}
 function choose(i){tabs[Math.max(0,Math.min(tabs.length-1,i))].click();}
 function syncPreference(){if(reduced())stop();if(replay)replay.disabled=reduced();}
 for(const tab of tabs){tab.addEventListener('click',()=>syncScene());tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))syncScene();});}
 prev.addEventListener('click',()=>choose(index()-1));next.addEventListener('click',()=>choose(index()+1));
 if(replay){replay.hidden=false;replay.addEventListener('click',()=>animate('opening'));}
 viewport.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;let target;if(e.key==='ArrowLeft')target=index()-1;if(e.key==='ArrowRight')target=index()+1;if(e.key==='Home')target=0;if(e.key==='End')target=tabs.length-1;if(target!==undefined){e.preventDefault();choose(target);}});
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;stop();sceneRegion.dataset.motionState='dragging';drag={x:e.clientX,y:e.clientY,dx:0,pointer:e.pointerId};viewport.classList.add('is-dragging');try{viewport.setPointerCapture(e.pointerId);}catch{}});
 viewport.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const limit=number('--comic-drag-limit',160);drag.dx=Math.max(-limit,Math.min(limit,e.clientX-drag.x));const resistance=(index()===0&&drag.dx>0)||(index()===scenes.length-1&&drag.dx<0)?.28:1;if(!reduced())strip.style.setProperty('--comic-drag',drag.dx*resistance+'px');});
 function endDrag(cancel=false){if(!drag)return;const dx=drag.dx;drag=null;viewport.classList.remove('is-dragging');strip.style.setProperty('--comic-drag','0px');if(!cancel&&Math.abs(dx)>45)choose(index()+(dx<0?1:-1));else sceneRegion.dataset.motionState=reduced()?'static':'idle';}
 viewport.addEventListener('pointerup',()=>endDrag());viewport.addEventListener('pointercancel',()=>endDrag(true));
 const controls=document.querySelector('[data-preview-settings]');controls?.addEventListener('input',syncPreference);controls?.querySelector('[data-reset]')?.addEventListener('click',syncPreference);media.addEventListener('change',syncPreference);document.addEventListener('site-motion-preference',syncPreference);
 syncScene(false);syncPreference();
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{for(const entry of entries){sceneRegion.classList.toggle('is-suspended',!entry.isIntersecting);if(!entry.isIntersecting)stop();else if(entry.intersectionRatio>=.15&&!opened){opened=true;animate('opening');}}},{threshold:[0,.15]}).observe(sceneRegion);else animate('opening');
 sceneRegion.dataset.motionVersion='3';
}
