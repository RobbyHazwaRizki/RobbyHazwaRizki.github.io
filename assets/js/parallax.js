const reduce=matchMedia('(prefers-reduced-motion: reduce)');
export function initParallax(){
  const els=[...document.querySelectorAll('[data-speed]')];
  if(!els.length||reduce.matches)return;
  let queued=false;
  const run=()=>{
    queued=false;
    const vh=innerHeight,k=innerWidth<640?.4:1;
    els.forEach(el=>{
      const r=el.parentElement.getBoundingClientRect();
      if(r.bottom<-100||r.top>vh+100)return;
      const y=-(r.top+r.height/2-vh/2)*el.dataset.speed*k;
      el.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
    });
  };
  const req=()=>{if(!queued){queued=true;requestAnimationFrame(run)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  run();
}
