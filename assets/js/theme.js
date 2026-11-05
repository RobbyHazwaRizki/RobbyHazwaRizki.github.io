export function initTheme(btn){
  const root=document.documentElement;
  const set=t=>{root.dataset.theme=t;btn.setAttribute('aria-pressed',String(t==='dark'));btn.textContent=t==='dark'?'Mode terang':'Mode gelap'};
  let t=root.dataset.theme||'light';
  set(t);
  btn.addEventListener('click',()=>{t=t==='dark'?'light':'dark';set(t);try{localStorage.setItem('theme',t)}catch(e){}});
}
