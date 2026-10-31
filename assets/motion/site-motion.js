(()=>{
 'use strict';
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),pause=document.querySelector('[data-motion-pause]');
 let userPaused=false;try{userPaused=localStorage.getItem('hai-motion-paused')==='true';}catch{}
 const widgets=[],reduced=()=>userPaused||preference.matches;
 const mediaPlaying=()=>[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.ended);
 function sync(){const stopped=reduced();document.body.dataset.motionPaused=String(stopped);if(pause){pause.setAttribute('aria-pressed',String(stopped));pause.textContent=stopped?pause.dataset.paused:pause.dataset.run;pause.setAttribute('aria-label',stopped?pause.dataset.labelPaused:pause.dataset.labelRun);pause.title=stopped?pause.dataset.labelPaused:pause.dataset.labelRun;pause.disabled=preference.matches;}
  const comic=document.querySelector('.comic-paths');if(comic)comic.dataset.reduce=String(stopped);document.dispatchEvent(new Event('site-motion-preference'));for(const w of widgets)w.preference();}
 pause?.addEventListener('click',()=>{userPaused=!userPaused;try{localStorage.setItem('hai-motion-paused',String(userPaused));}catch{}sync();});preference.addEventListener('change',sync);
 for(const region of document.querySelectorAll('[data-motion-widget]')){
  const data=JSON.parse(region.querySelector('.m-data').textContent),stage=region.querySelector('.m-stage'),card=region.querySelector('.m-card'),prev=region.querySelector('[data-m-prev]'),next=region.querySelector('[data-m-next]'),replay=region.querySelector('[data-m-replay]');
  let i=0,animation=[],visible=false,timer=null,drag=null,interacted=false,clone;
  const numeric=(key,fallback)=>parseFloat(getComputedStyle(region).getPropertyValue(key))||fallback;
  const duration=()=>parseFloat(getComputedStyle(region).getPropertyValue('--m-duration'))||850;
  function stop(){for(const a of animation)a.cancel();animation=[];clone?.remove();clone=null;region.dataset.motionState=reduced()?'static':'idle';}
  function animate(mode,direction=1){stop();if(reduced()||!card.animate)return;
   region.dataset.motionState=mode;
   if(region.dataset.kind==='paper'||mode==='turn'&&region.dataset.kind==='concept'){
    // Previous content is a visual overlay; the actual semantic card is already current.
    clone=previousCard.cloneNode(true);clone.classList.add('m-clone');clone.setAttribute('aria-hidden','true');clone.inert=true;for(const x of clone.querySelectorAll('[id]'))x.removeAttribute('id');
    clone.style.left=card.offsetLeft+'px';clone.style.top=card.offsetTop+'px';clone.style.width=card.offsetWidth+'px';clone.style.height=card.offsetHeight+'px';clone.style.margin='0';stage.append(clone);
    animation.push(clone.animate([{transform:'rotateY(0deg)',opacity:1},{transform:`rotateY(${-direction*numeric('--m-angle',155)}deg) translateX(${-direction*55}px)`,opacity:0}],{duration:duration(),easing:'cubic-bezier(.22,.7,.25,1)'}));
   }else if(region.dataset.kind==='film')animation.push(card.animate([{transform:`translateX(${direction*180}px) rotate(${direction*3}deg)`,opacity:.25},{transform:'none',opacity:1}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)'}));
   else if(region.dataset.kind==='letter')animation.push(card.animate([{transform:'rotateX(-55deg) translateY(50px)',opacity:.1},{transform:'none',opacity:1}],{duration:duration()+250,easing:'cubic-bezier(.22,1,.36,1)'}));
   else animation.push(card.animate([{transform:`translateY(${numeric('--m-entry',55)}px) rotate(-5deg) scale(.94)`,opacity:.2},{transform:'none',opacity:1}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)'}));
   if(region.dataset.kind==='cv'){
    const img=card.querySelector('img');if(img){const travel=Math.max(0,img.offsetHeight-img.parentElement.offsetHeight);if(travel>20)animation.push(img.animate([{transform:'translateY(0)'},{transform:`translateY(-${Math.min(travel,240)}px)`},{transform:'translateY(0)'}],{duration:5000,easing:'ease-in-out'}));}
   }
   const own=animation;Promise.all(own.map(a=>a.finished.catch(()=>{}))).then(()=>{if(animation===own){clone?.remove();clone=null;region.dataset.motionState=reduced()?'static':'idle';}});
  }
  let previousCard=card.cloneNode(true);
  function render(){const c=data.cards[i];region.querySelector('.m-kicker').textContent=c.kicker||'';card.querySelector('h3').textContent=c.title;const body=card.querySelector('.m-body');body.textContent=c.body;body.lang=c.lang||document.documentElement.lang;body.scrollTop=0;card.querySelector('.m-note').textContent=c.note||'';const a=card.querySelector('.m-link');a.href=c.href;a.textContent=c.label+' ↗';
   const image=card.querySelector('img');if(image){image.src=c.image;image.alt=c.title;}
   region.querySelector('.m-count').textContent=String(i+1).padStart(2,'0')+' / '+String(data.cards.length).padStart(2,'0');region.querySelector('.m-status').textContent=c.title;region.dataset.index=String(i);prev.disabled=data.cards.length<2;next.disabled=data.cards.length<2;
   if(c.video){a.href='#local-candidate-player';a.dataset.candidateVideo=c.video;}else delete a.dataset.candidateVideo;
  }
  function choose(n,manual=true){previousCard=card.cloneNode(true);const direction=n>=i?1:-1;i=(n+data.cards.length)%data.cards.length;if(manual){interacted=true;clearTimeout(timer);}render();animate('turn',direction);}
  prev.addEventListener('click',()=>choose(i-1));next.addEventListener('click',()=>choose(i+1));replay?.addEventListener('click',()=>{interacted=true;clearTimeout(timer);previousCard=card.cloneNode(true);animate('opening');});
  stage.addEventListener('keydown',event=>{if(event.target!==stage)return;let target;if(event.key==='ArrowLeft')target=i-1;if(event.key==='ArrowRight')target=i+1;if(event.key==='Home')target=0;if(event.key==='End')target=data.cards.length-1;if(target!==undefined){event.preventDefault();choose(target);}});
  stage.addEventListener('dragstart',event=>event.preventDefault());
  stage.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('a,button,.m-body'))return;drag={x:event.clientX,y:event.clientY,pointer:event.pointerId};interacted=true;clearTimeout(timer);try{stage.setPointerCapture(event.pointerId);}catch{}});
  stage.addEventListener('pointermove',event=>{if(!drag||reduced())return;const dx=Math.max(-110,Math.min(110,event.clientX-drag.x));card.style.transform=`translateX(${dx*.55}px) rotate(${dx*.015}deg)`;});
  const end=event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag=null;card.style.transform='';if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))choose(i+(dx<0?1:-1));};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',()=>{drag=null;card.style.transform='';});
  card.querySelector('.m-link').addEventListener('click',event=>{const c=data.cards[i];if(!c.video)return;event.preventDefault();const player=document.querySelector('.m-candidate-player video');if(!player)return;player.id='local-candidate-player';player.src=c.video;player.poster=c.image;document.querySelector('[data-candidate-status]').textContent=c.title;player.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'center'});player.play().catch(()=>{});});
  function schedule(){clearTimeout(timer);if(!visible||reduced()||interacted||data.cards.length<2||document.hidden||mediaPlaying())return;timer=setTimeout(()=>{if(region.matches(':hover')||region.contains(document.activeElement)){schedule();return;}choose(i+1,false);schedule();},data.interval);}
  const controller={preference(){stop();if(replay)replay.disabled=reduced();schedule();}};widgets.push(controller);
  region.addEventListener('focusin',()=>{clearTimeout(timer);});region.addEventListener('focusout',schedule);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();schedule();});
  new IntersectionObserver(entries=>{for(const entry of entries){const was=visible;visible=entry.isIntersecting&&entry.intersectionRatio>.12;if(visible&&!was){animate('opening');schedule();}if(!visible){clearTimeout(timer);stop();}}},{threshold:[0,.12]}).observe(region);
  card.querySelector('img')?.addEventListener('load',()=>{if(visible&&region.dataset.kind==='cv'&&!reduced())animate('opening');});
  render();
 }
 document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')for(const w of widgets)w.preference();},true);
 document.addEventListener('pause',()=>{for(const w of widgets)w.preference();},true);
 sync();
 const hash=decodeURIComponent(location.hash.slice(1));if(hash&&document.getElementById(hash)?.matches('.m-preview'))requestAnimationFrame(()=>document.getElementById(hash).scrollIntoView({block:'start'}));
})();
