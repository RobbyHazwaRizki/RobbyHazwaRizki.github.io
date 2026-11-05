const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function count(n){
  const to=+n.dataset.count;
  if(reduce){n.textContent=to;return}
  let s=null;
  const step=t=>{s??=t;const p=Math.min((t-s)/900,1);n.textContent=Math.round(to*p);if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}
export function initReveal(){
  const items=document.querySelectorAll('.card:not(.in),[data-reveal]');
  if(reduce||!('IntersectionObserver' in window)){items.forEach(i=>i.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(count);
    io.unobserve(e.target);
  }),{threshold:.15});
  items.forEach(i=>io.observe(i));
}
