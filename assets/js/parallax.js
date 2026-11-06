const reduce=matchMedia('(prefers-reduced-motion: reduce)');
export function initParallax(){
  const els=[...document.querySelectorAll('[data-speed]')];
  if(!els.length||reduce.matches)return;
  let queued=false;
  const run=()=>{
    queued=false;
    const vh=innerHeight,k=innerWidth<640?.6:1;
    els.forEach(el=>{
      const r=el.parentElement.getBoundingClientRect();
      if(r.bottom<-200||r.top>vh+200)return;
      const ref=el.dataset.origin==='top'?r.top:r.top+r.height/2-vh/2;
      const y=-ref*el.dataset.speed*k;
      el.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
    });
  };
  const req=()=>{if(!queued){queued=true;requestAnimationFrame(run)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  run();
}