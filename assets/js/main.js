import {initTheme} from './theme.js';
import {initReveal} from './reveal.js';
import {initParallax} from './parallax.js';
import {initGallery} from './gallery.js';

const $=(s,r=document)=>r.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const load=async u=>{try{return await (await fetch(u)).json()}catch(e){return null}};
const link=(txt,href,cls)=>{const a=el('a',cls,txt);a.href=href;if(/^https?:|\.pdf$/i.test(href)){a.target='_blank';a.rel='noopener noreferrer'}return a};
const chips=(box,list)=>{if(list?.length){const r=el('div','row');list.forEach(t=>r.append(el('span','chip',t)));box.append(r)}};
const dlg=$('#dlg'),body=$('#dlg-body');

async function init(){
  initTheme($('#theme'));
  const [site,projects]=await Promise.all([load('data/site.json'),load('data/projects.json')]);
  if(site)renderSite(site);
  renderProjects((projects||[]).filter(p=>p.visible!==false));
  buildNav();
  decorate();
  $('#year').textContent=new Date().getFullYear();
  $('#dlg-close').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
  initReveal();
  initParallax();
}

function renderSite(s){
  document.querySelectorAll('[data-site]').forEach(n=>{const v=s[n.dataset.site];if(v)n.textContent=v});
  const contacts=[['Email',s.email&&'mailto:'+s.email],['LinkedIn',s.linkedin],['GitHub',s.github]].filter(c=>c[1]);
  const box=$('#contacts');
  contacts.forEach(([t,h])=>box.append(link(t,h,'btn alt')));
  if(s.cv){const a=$('#cv');a.href=s.cv;a.target='_blank';a.rel='noopener noreferrer';a.hidden=false;box.append(link('Lihat CV',s.cv,'btn'))}
  const hasContact=contacts.length>0||!!s.cv;
  $('#kontak').hidden=!hasContact;
  $('#hero-contact').hidden=!hasContact;
  const on=k=>s.sections?.[k]&&s[k]?.length;
  [['achievements','achievements'],['now','now'],['experience','experience'],['stack','stack'],['journey','journey'],['gallery','galeri']].forEach(([k,id])=>{const n=document.getElementById(id);if(n)n.hidden=!on(k)});
  if(on('achievements'))s.achievements.forEach(a=>{
    const d=el('div','card stat');
    const b=el('b',null,a.value);
    if(/^\d+$/.test(String(a.value)))b.dataset.count=a.value;
    d.append(b,el('span',null,a.label));
    $('#stats').append(d);
  });
  ['journey'].forEach(k=>{if(on(k))s[k].forEach(i=>{
    const li=el('li','card');
    li.append(el('h3',null,i.title));
    const meta=[i.org,i.period].filter(Boolean).join(' / ');
    if(meta)li.append(el('p','mono',meta));
    if(i.text)li.append(el('p',null,i.text));
    $('#'+k+'-list').append(li);
  })});
  if(on('stack'))s.stack.forEach(t=>$('#stack-list').append(el('span','chip',t)));
  if(on('gallery'))initGallery({view:$('#gal-view'),track:$('#gal-track'),items:s.gallery,onOpen:zoom});
  if(on('now'))s.now.slice(0,5).forEach(n=>{
    const li=el('li');
    li.append(el('span','mono',n.date||''));
    const b=el('div','nb');
    if(n.tag)b.append(el('span','tag',n.tag));
    b.append(el('p',null,n.text));
    if(n.link)b.append(link('Lihat selengkapnya',n.link,'more'));
    li.append(b);
    $('#now-list').append(li);
  });
  if(on('experience'))s.experience.forEach(i=>{
    const li=el('li','card exp'+(i.photos?.length?' has-ph':''));
    const t=el('div','exp-t');
    t.append(el('h3',null,i.title));
    const meta=[i.org,i.period].filter(Boolean).join(' / ');
    if(meta)t.append(el('p','mono',meta));
    if(i.text)t.append(el('p',null,i.text));
    li.append(t);
    if(i.photos?.length){
      const ph=el('div','exp-p');
      i.photos.forEach(src=>{
        const alt=`Dokumentasi ${i.title}`;
        const b=el('button','ph');
        b.type='button';b.setAttribute('aria-label','Perbesar foto');
        const im=el('img');im.src=src;im.alt=alt;im.loading='lazy';
        b.append(im);
        b.addEventListener('click',()=>zoom(src,alt));
        ph.append(b);
      });
      li.append(ph);
    }
    $('#experience-list').append(li);
  });
}

function renderProjects(list){
  if(!list.length){$('#project').hidden=true;return}
  const cats=[...new Set(list.map(p=>p.category).filter(Boolean))];
  const f=$('#filters');
  if(cats.length>1)['Semua',...cats].forEach((c,i)=>{
    const b=el('button','chip'+(i?'':' on'),c);
    b.type='button';
    b.addEventListener('click',()=>{
      f.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      draw(i?list.filter(p=>p.category===c):list);
    });
    f.append(b);
  });
  draw(list);
}

function draw(list){
  const g=$('#project-list');
  g.replaceChildren();
  list.forEach(p=>{
    const c=el('article','card project in');
    const fig=el('div','shot');
    if(p.image){
      const im=el('img');
      im.src=p.image;im.alt=p.imageAlt||`Tampilan ${p.title}`;im.loading='lazy';
      fig.append(im);
    }else{
      fig.classList.add('empty');
      fig.append(el('span',null,p.title.charAt(0)));
    }
    c.append(fig);
    const info=el('div','info');
    if(p.label)info.append(el('span','tag'+(p.status==='soon'?' soon':''),p.label));
    info.append(el('h3',null,p.title),el('p',null,p.summary||''));
    chips(info,p.stack);
    const b=el('button','btn sm','Lihat detail');
    b.type='button';
    b.addEventListener('click',()=>openDetail(p));
    info.append(b);
    c.append(info);
    g.append(c);
  });
}

function zoom(src,alt){
  body.replaceChildren();
  const im=el('img','zoom');im.src=src;im.alt=alt;
  body.append(im);
  dlg.showModal();
}

function openDetail(p){
  body.replaceChildren();
  const h=el('h2',null,p.title);h.id='dlg-title';
  body.append(h,el('p',null,p.summary||''));
  if(p.gallery?.length){
    const gl=el('div','gallery');
    p.gallery.forEach(s=>{const im=el('img');im.src=s;im.alt=`Tampilan ${p.title}`;im.loading='lazy';gl.append(im)});
    body.append(gl);
  }
  chips(body,p.stack);
  const row=el('div','row');
  [['Demo',p.links?.demo],['Repo',p.links?.repo]].forEach(([t,u])=>{if(u)row.append(link(t,u,'btn alt'))});
  if(p.game){const g=el('button','btn','Mulai game');g.type='button';g.addEventListener('click',startQuiz);row.append(g)}
  body.append(row);
  dlg.showModal();
}

async function startQuiz(){
  const qs=await load('data/quiz.json');
  if(!qs?.length){body.replaceChildren(el('p',null,'Game belum tersedia.'));return}
  let i=0,score=0;
  const show=()=>{
    body.replaceChildren();
    if(i>=qs.length){
      const r=el('button','btn','Main lagi');
      r.type='button';
      r.addEventListener('click',()=>{i=0;score=0;show()});
      body.append(el('h2',null,'Selesai'),el('p',null,`Skor kamu ${score} dari ${qs.length}.`),r);
      r.focus();
      return;
    }
    const q=qs[i];
    const fb=el('p','fb');
    fb.setAttribute('aria-live','polite');
    body.append(el('p','mono',`Soal ${i+1} dari ${qs.length}`),el('h2',null,q.q));
    q.options.forEach((o,k)=>{
      const b=el('button','opt',o);
      b.type='button';
      b.addEventListener('click',()=>{
        body.querySelectorAll('.opt').forEach(x=>{x.disabled=true});
        const ok=k===q.answer;
        if(ok)score++;
        b.classList.add(ok?'ok':'no');
        fb.textContent=ok?'Benar!':'Kurang tepat. Jawabannya: '+q.options[q.answer];
        const n=el('button','btn',i+1<qs.length?'Lanjut':'Lihat skor');
        n.type='button';
        n.addEventListener('click',()=>{i++;show()});
        body.append(n);
        n.focus();
      });
      body.append(b);
    });
    body.append(fb);
  };
  show();
}

function decorate(){
  const ghost={tentang:'Tentang',achievements:'Hasil',project:'Project',now:'Progres',experience:'Kerja',stack:'Stack',journey:'Jejak',galeri:'Galeri',kontak:''};
  const deco={project:'ring o3',now:'disc o1',experience:'ring o3',galeri:'ring o4',achievements:'disc o2',stack:'disc o1',journey:'ring o3'};
  document.querySelectorAll('section[data-nav]').forEach(s=>{
    const add=(cls,speed,txt)=>{
      const n=el('span','lyr '+cls,txt);
      n.dataset.speed=speed;n.setAttribute('aria-hidden','true');
      s.prepend(n);
    };
    if(deco[s.id]&&!s.querySelector('.ring,.disc'))add(deco[s.id],-.2);
    if(ghost[s.id]&&!s.querySelector('.ghost'))add('ghost sg',.3,ghost[s.id]);
    if(!s.querySelector('.dots'))add('dots',.45);
  });
}

function buildNav(){
  const ul=$('#links');
  ul.replaceChildren();
  document.querySelectorAll('section[data-nav]:not([hidden])').forEach(s=>{
    const li=el('li');li.append(link(s.dataset.nav,'#'+s.id));ul.append(li);
  });
  if(buildNav.done)return;
  buildNav.done=true;
  $('#menu').addEventListener('click',e=>{
    const o=$('header').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded',String(o));
  });
  ul.addEventListener('click',()=>$('header').classList.remove('open'));
}

init();