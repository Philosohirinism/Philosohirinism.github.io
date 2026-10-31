const region=document.querySelector('.comic-paths');
if(region){
 const data=JSON.parse(document.querySelector('#comic-data').textContent);
 const tabs=[...region.querySelectorAll('[role=tab]')],panel=region.querySelector('[role=tabpanel]');
 function select(index,focus=false,updateUrl=false){
  const entry=data.paths[index];
  region.dataset.selected=entry.id;
  for(const [i,tab] of tabs.entries()){tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;}
  panel.setAttribute('aria-labelledby',tabs[index].id);
  panel.querySelector('.comic-description').textContent=entry.description;
  panel.querySelector('.comic-links').replaceChildren(...entry.links.map(link=>{const li=document.createElement('li'),a=document.createElement('a');a.href=link.href;const title=document.createElement('span');title.textContent=link.title;const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';a.append(title,arrow);li.append(a);return li;}));
  const enter=panel.querySelector('.comic-enter');enter.href=entry.href;enter.firstElementChild.textContent=document.documentElement.lang==='ja'?entry.title+data.enter:document.documentElement.lang.startsWith('zh')?data.enter+entry.title:data.enter+' '+entry.title;
  if(updateUrl){const u=new URL(location.href);u.searchParams.set('reading',entry.id);history.replaceState(null,'',u);for(const link of document.querySelectorAll('.language-switch a')){const target=new URL(link.href);target.search=u.search;link.href=target.href;}}
  if(focus)tabs[index].focus();
 }
 for(const [i,tab] of tabs.entries()){
  tab.addEventListener('click',()=>select(i,false,true));
  tab.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=(i+1)%tabs.length;if(event.key==='ArrowLeft')target=(i+tabs.length-1)%tabs.length;if(event.key==='Home')target=0;if(event.key==='End')target=tabs.length-1;if(target!==undefined){event.preventDefault();select(target,true,true);}});
 }
 const requested=new URLSearchParams(location.search).get('reading');select(Math.max(0,data.paths.findIndex(p=>p.id===requested)));region.querySelector('.comic-enhanced').hidden=false;region.classList.add('is-ready');
}
