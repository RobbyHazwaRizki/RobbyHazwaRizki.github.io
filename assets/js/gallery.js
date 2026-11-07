// Galeri foto: 2 baris, geser otomatis tanpa henti, bisa digeser, ditahan untuk menjeda.
export function initGallery({view,track,items,onOpen}){
  if(!items?.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTO=reduce?0:36;                       // kecepatan geser otomatis (px per detik)
  const list=items.length%2?[...items,items[0]]:items; // jumlah genap supaya 2 baris terisi penuh
  let loop=0,offset=0,vel=0,paused=false,dragging=false,pressed=false,visible=true;
  let moved=0,sx=0,lx=0,lt=0,pid=null,vs=[],last=0;

  const make=(it,clone)=>{
    const b=document.createElement('button');
    b.type='button';b.className='gal-cell';
    const im=document.createElement('img');
    im.src=it.src;im.alt=clone?'':(it.alt||'Foto Robby');im.draggable=false;im.decoding='async';
    b.append(im);
    if(clone){b.tabIndex=-1;b.setAttribute('aria-hidden','true')}
    b.addEventListener('click',()=>onOpen&&onOpen(it.src,it.alt||'Foto Robby'));
    return b;
  };
  const apply=()=>{track.style.transform=`translate3d(${-offset}px,0,0)`};
  const norm=()=>{if(loop>0)offset=((offset%loop)+loop)%loop};
  const build=()=>{
    track.replaceChildren();
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    list.forEach(it=>track.append(make(it,false)));
    const setW=track.scrollWidth+gap;           // lebar satu set foto, termasuk jarak akhir
    const copies=Math.max(2,Math.ceil(view.clientWidth/setW)+1);
    for(let k=1;k<copies;k++)list.forEach(it=>track.append(make(it,true)));
    loop=setW;
  };

  const tick=t=>{
    requestAnimationFrame(tick);
    const dt=Math.min((t-last)/1000,.05);last=t;
    if(dragging||!visible||!loop)return;
    if(vel){offset+=vel*dt;vel*=Math.exp(-dt*3.5);if(Math.abs(vel)<1)vel=0}
    if(!paused)offset+=AUTO*dt;
    norm();apply();
  };

  view.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    pressed=true;paused=true;vel=0;moved=0;vs=[];
    sx=lx=e.clientX;lt=e.timeStamp;pid=e.pointerId;
  });
  view.addEventListener('pointermove',e=>{
    if(!pressed||e.pointerId!==pid)return;
    const dx=e.clientX-lx;
    moved=Math.max(moved,Math.abs(e.clientX-sx));
    if(!dragging&&moved>5){dragging=true;view.setPointerCapture(pid);view.classList.add('drag')}
    if(dragging){
      offset-=dx;norm();apply();
      vs.push(-dx/Math.max(e.timeStamp-lt,1)*1000);
      if(vs.length>5)vs.shift();
    }
    lx=e.clientX;lt=e.timeStamp;
  });
  const end=()=>{
    if(!pressed)return;
    pressed=false;
    if(dragging){
      dragging=false;view.classList.remove('drag');
      const v=vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:0;
      vel=Math.max(-2500,Math.min(2500,v));
    }
    paused=false;
    setTimeout(()=>{moved=0},0);
  };
  view.addEventListener('pointerup',end);
  view.addEventListener('pointercancel',end);
  view.addEventListener('lostpointercapture',end);
  // geseran yang berakhir tidak boleh dianggap klik pada foto
  view.addEventListener('click',e=>{if(moved>5){e.stopPropagation();e.preventDefault()}},true);
  // trackpad / mouse: geser horizontal
  view.addEventListener('wheel',e=>{
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();offset+=e.deltaX;norm();apply()}
  },{passive:false});
  // keyboard: berhenti dan arahkan ke foto yang difokus
  view.addEventListener('focusin',e=>{
    if(!e.target.matches?.(':focus-visible'))return;
    paused=true;
    const c=e.target;
    offset=c.offsetLeft-(view.clientWidth-c.offsetWidth)/2;norm();apply();view.scrollLeft=0;
  });
  view.addEventListener('focusout',()=>{paused=false});

  new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(view);
  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{build();norm();apply()},150)});

  build();apply();
  requestAnimationFrame(tick);
}