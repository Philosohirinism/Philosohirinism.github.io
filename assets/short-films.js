(()=>{
 const video=document.querySelector('#short-film-player video'),select=document.querySelector('[data-caption-select]');if(!video)return;
 function choose(){for(const track of Array.from(video.textTracks))track.mode=select?.value===track.language?'showing':'disabled';}
 select?.addEventListener('change',choose);video.addEventListener('loadedmetadata',choose);choose();
 video.textTracks.addEventListener('change',()=>{const showing=Array.from(video.textTracks).find(t=>t.mode==='showing');const value=showing?.language||'off';if(select&&select.value!==value)select.value=value;});
 let seekVersion=0;
 document.addEventListener('click',event=>{const a=event.target.closest('a[data-seek]');if(!a)return;event.preventDefault();const version=++seekVersion;const seek=()=>{if(version!==seekVersion)return;video.currentTime=Number(a.dataset.seek);video.play().catch(()=>{});};if(video.readyState<1){video.addEventListener('loadedmetadata',seek,{once:true});video.load();}else seek();video.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});});
})();
