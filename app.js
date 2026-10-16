const REELS=[
 {id:'fri',title:'Before you leave',items:[
  ['💧','Deep-water everything Friday night'],['🧺','Group plants in a bright spot'],['🪢','Set up wick watering'],
  ['👯','Ask a friend to sit your plants'],['🛁','Bottom-soak the thirsty ones'],['🏷️','Label care notes for the sitter']]},
 {id:'sat',title:'Saturday',items:[
  ['🌿','Plant nursery crawl'],['🏛️','Botanical garden day'],['🥾','Forest or beach hike'],
  ['🪴','Plant swap or thrift hunt'],['☕','Greenhouse café afternoon'],['🌸','Farmers market and flowers']]},
 {id:'sun',title:'Sunday',items:[
  ['🪴','Repot one root-bound plant'],['✂️','Take cuttings to propagate'],['🧼','Wipe leaves and prune'],
  ['🏺','Build a terrarium'],['🌱','Start seeds on the windowsill'],['📖','Slow day: plant book and tea']]}
];
const reelsEl=document.getElementById('reels'),planEl=document.getElementById('plan'),pull=document.getElementById('pull');
const state=REELS.map(()=>({i:-1,held:false}));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

REELS.forEach((r,n)=>{
  const d=document.createElement('div');d.className='reel';
  d.innerHTML=`<h2>${r.title}</h2><div class="window" id="w${n}"><div class="em">🐚</div><div class="tx">?</div></div>
  <button class="hold" id="h${n}" aria-pressed="false">Hold</button>`;
  reelsEl.appendChild(d);
  d.querySelector('.hold').onclick=e=>{state[n].held=!state[n].held;e.target.setAttribute('aria-pressed',state[n].held);};
});

function show(n,i){const w=document.getElementById('w'+n),[e,t]=REELS[n].items[i];
  w.querySelector('.em').textContent=e;w.querySelector('.tx').textContent=t;}
const rnd=n=>Math.floor(Math.random()*REELS[n].items.length);

function spin(){
  pull.disabled=true;
  const active=state.map((s,n)=>s.held&&s.i>=0?null:n).filter(n=>n!==null);
  if(!active.length){pull.disabled=false;return;}
  let done=0;
  active.forEach((n,k)=>{
    const w=document.getElementById('w'+n);w.classList.add('spin');
    const stopAt=reduce?0:700+k*450;
    const tick=setInterval(()=>show(n,rnd(n)),80);
    setTimeout(()=>{
      clearInterval(tick);
      let i=rnd(n);if(i===state[n].i&&REELS[n].items.length>1)i=(i+1)%REELS[n].items.length;
      state[n].i=i;show(n,i);w.classList.remove('spin');
      if(++done===active.length){pull.disabled=false;renderPlan();}
    },stopAt);
  });
}

function renderPlan(){
  addHistory(state.map(s=>s.i));
  const rows=REELS.map((r,n)=>{const [e,t]=r.items[state[n].i];return {l:r.title,e,t};});
  planEl.innerHTML='<ul>'+rows.map(x=>`<li><span class="em">${x.e}</span><span><b>${x.l}:</b> ${x.t}</span></li>`).join('')+'</ul><button class="copy" id="copy">Copy plan</button>';
  document.getElementById('copy').onclick=async e=>{
    const txt='My plant parent weekend:\n'+rows.map(x=>`${x.l}: ${x.t}`).join('\n');
    try{await navigator.clipboard.writeText(txt);e.target.textContent='Copied';}catch{e.target.textContent='Copy failed';}
    setTimeout(()=>e.target.textContent='Copy plan',1500);
  };
}

pull.onclick=spin;

const b=document.querySelector('.bubbles');
for(let i=0;i<14;i++){const s=document.createElement('i'),z=8+Math.random()*22;
  s.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${10+Math.random()*14}s;animation-delay:${-Math.random()*20}s`;b.appendChild(s);}

/* History (10 most recent) and bookmarks (max 3), kept in this browser's localStorage */
const MAX_HISTORY=10,MAX_SAVED=3;
const valid=e=>Array.isArray(e)&&e.length===REELS.length&&e.every((i,n)=>Number.isInteger(i)&&REELS[n].items[i]);
const store={
  get(k){try{return (JSON.parse(localStorage.getItem(k))||[]).filter(valid)}catch{return []}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
let history=store.get('reef-history'),saved=store.get('reef-saved');
const key=e=>e.join('-');
const isSaved=e=>saved.some(s=>key(s)===key(e));
const text=e=>e.map((i,n)=>REELS[n].items[i].join(' ')).join(' / ');

function addHistory(e){history.unshift(e);history=history.slice(0,MAX_HISTORY);store.set('reef-history',history);renderLists();}

function toggleSave(k){
  const e=k.split('-').map(Number);
  if(isSaved(e)){saved=saved.filter(s=>key(s)!==k);}
  else if(saved.length>=MAX_SAVED){document.getElementById('savedCount').textContent='Full: remove one first';return;}
  else{saved.push(e);}
  store.set('reef-saved',saved);renderLists();
}

function listHTML(arr,empty){
  if(!arr.length)return `<p class="hint">${empty}</p>`;
  return '<ul>'+arr.map(e=>`<li><span>${text(e)}</span><button class="star" data-k="${key(e)}" aria-label="${isSaved(e)?'Remove bookmark':'Bookmark this plan'}" aria-pressed="${isSaved(e)}">${isSaved(e)?'★':'☆'}</button></li>`).join('')+'</ul>';
}

function renderLists(){
  document.getElementById('saved').innerHTML=listHTML(saved,'Tap the star on a spin to keep it here.');
  document.getElementById('history').innerHTML=listHTML(history,'Your last 10 spins show up here.');
  document.getElementById('savedCount').textContent=saved.length+'/'+MAX_SAVED;
}
document.querySelector('.lists').addEventListener('click',ev=>{const b=ev.target.closest('.star');if(b)toggleSave(b.dataset.k);});
renderLists();
