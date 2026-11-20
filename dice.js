const SIZES=[4,6,8,10,12,20],n=Number,esc=s=>String(s).replace(/[&<>"']/g,c=>"&#"+c.charCodeAt(0)+";");
const sz=s=>SIZES.includes(n(s))?n(s):12,R=s=>1+Math.floor(Math.random()*s);
const IMG={"4": "dice/d4.png", "6": "dice/d6.png", "8": "dice/d8.png", "10": "dice/d10.png", "12": "dice/d12.png", "20": "dice/d20.png"},PIMG={"4": "dice/p4.png", "6": "dice/p6.png", "8": "dice/p8.png", "10": "dice/p10.png", "12": "dice/p12.png", "20": "dice/p20.png"},POS={"4": [46.6, 56.7], "6": [49.5, 48.7], "8": [48.5, 48.4], "10": [48.5, 49.6], "12": [49.8, 49.7], "20": [48.5, 49.0]},FS={4:.5,6:.58,8:.58,10:.48,12:.5,20:.46};
const ICO={"advantage": "icons/advantage.png", "disadvantage": "icons/disadvantage.png", "reload": "icons/reload.png", "powerful": "icons/powerful.png", "public": "icons/public.png", "private": "icons/private.png", "previous": "icons/previous.png", "favorite": "icons/favorite.png"},ico=k=>{const u=`url(${ICO[k]})`;return `<i class="ic" style="-webkit-mask-image:${u};mask-image:${u}"></i>`};
const KIND={h:["Hope","#ffe46e"],f:["Fear","#9a63ff"],a:["+ Adv","#b9ffb0"],d:["− Dis","#ff9e8a"],w:["Dice","#fff"],o:["Reload","#ff8f5a"]};
const fitK=(s,v)=>s>=10&&String(v).length==1?1.25:1;
const SIGN={"+":'<svg viewBox="0 0 10 10" style="width:.8em;height:.8em"><path d="M4 0h2v4h4v2H6v4H4V6H0V4h4z" fill="currentColor"/></svg>',"−":'<svg viewBox="0 0 10 10" style="width:.8em;height:.8em"><rect y="4" width="10" height="2" fill="currentColor"/></svg>'};
function dieHTML(k,s,txt,w){const[x,y]=POS[s],u=`url(${IMG[s]})`;
 return `<div class="dw" style="--w:${w}px;--col:${KIND[k][1]}"><i class="ol" style="-webkit-mask-image:${u};mask-image:${u}"></i><b class="num" data-s="${s}" style="left:${x}%;top:${y}%;--fs:${FS[s]};--k:${SIGN[txt]?1:fitK(s,txt)}">${SIGN[txt]||txt}</b></div>`}
const pdie=(k,s,w)=>`<div class="dw" style="--w:${w}px;--col:${KIND[k][1]}"><i class="ol" style="-webkit-mask-image:url(${PIMG[s]});mask-image:url(${PIMG[s]})"></i></div>`;
function info(p){const hs=sz(p.hs),fs=sz(p.fs),h=n(p.h),f=n(p.f),md=n(p.mod)||0;
 const A=(p.a||[]).map(e=>({s:sz(e.s),v:n(e.v)})),D=(p.d||[]).map(e=>({s:sz(e.s),v:n(e.v)})),sum=x=>x.reduce((t,e)=>t+e.v,0),sp=(k,v)=>`<span style="color:${KIND[k][1]}">${v}</span>`;
 return{hs,fs,h,f,A,D,total:h+f+md+sum(A)-sum(D),c:h==f?"#4ade80":h>f?KIND.h[1]:KIND.f[1],lab:h==f?"Critical Success!":"With "+(h>f?"Hope":"Fear"),
 bd:sp("h",h)+" + "+sp("f",f)+(md?` ${md>0?"+":"−"} ${Math.abs(md)}`:"")+A.map(e=>" + "+sp("a",e.v)).join("")+D.map(e=>" − "+sp("d",e.v)).join("")}}
const resHTML=I=>`<div class="res pop"><strong>${I.total}</strong><span>${I.lab}</span></div><div class="bd">${I.bd}</div>`;
const dcount=p=>{if(p.mode=="dice"){const I=infoD(p);return I.best.length+(I.worst?I.worst.length:0)+(I.rl!=null?1:0)}return 2+(p.a||[]).length+(p.d||[]).length},settleAt=(i,k)=>800+(k>6?90:200)*i,revealAt=k=>settleAt(k-1,k)+250;
function cardH(p,fin){const I=info(p),v=(s,x)=>fin?x:R(s),g=(k,s,x,w)=>`<div class="g">${dieHTML(k,s,v(s,x),w)}<em style="color:${KIND[k][1]}">${KIND[k][0]}</em></div>`;
 return `<div class="rc" style="--c:${fin?I.c:"#000"}"><button class="cx" title="Close">×</button><small>${p.secret?"🔒 Secret · ":""}${esc(p.name)}</small><div class="dr">${g("h",I.hs,I.h,84)}${g("f",I.fs,I.f,84)}${I.A.map(e=>g("a",e.s,e.v,58)).join("")}${I.D.map(e=>g("d",e.s,e.v,58)).join("")}</div>`+(fin?resHTML(I):`<div class="res wait"><span>Rolling…</span></div>`)+`</div>`}
const card=(p,fin)=>p.mode=="dice"?cardD(p,fin):cardH(p,fin);
const poolLbl=a=>SIZES.filter(s=>a.includes(s)).map(s=>{const c=a.filter(x=>x==s).length;return(c>1?c:"")+"d"+s}).join("+");
function infoD(p){const pool=(p.pool||[]).slice(0,24).map(x=>sz(x)),md=n(p.mod)||0;
 const rolls=(p.rolls||[]).slice(0,2).map(r=>pool.map((s,i)=>Math.min(s,Math.max(1,Math.floor(n((r||[])[i]))||1)))),tot=r=>r.reduce((a,b)=>a+b,0)+md;
 const bi=rolls.length>1&&tot(rolls[1])>tot(rolls[0])?1:0,best=rolls[bi]||[],worst=rolls.length>1?rolls[1-bi]:null;
 const rl=p.reload==null?null:Math.min(6,Math.max(1,Math.floor(n(p.reload))||1));
 return{pool,md,best,worst,bt:tot(best),wt:worst?tot(worst):null,rl,reloaded:rl===1,power:!!worst,c:rl===1?KIND.o[1]:"#a283e0",bd:best.join(" + ")+(md?` ${md>0?"+":"−"} ${Math.abs(md)}`:"")}}
const resHTMLD=I=>`<div class="res pop"><strong>${I.bt}</strong>${I.power?"<span>Best of 2</span>":""}${I.reloaded?`<span style="color:${KIND.o[1]}">Reloaded!</span>`:""}</div><div class="bd">${I.bd}</div>`;
function cardD(p,fin){const I=infoD(p),v=(s,x)=>fin?x:R(s),N=I.pool.length,w=N<=3?72:N<=6?58:46,ws=N<=6?34:28;
 const dd=(arr,w)=>arr.map((x,i)=>dieHTML("w",I.pool[i],v(I.pool[i],x),w)).join("");
 return `<div class="rc" style="--c:${fin?I.c:"#000"}"><button class="cx" title="Close">×</button><small>${p.secret?"🔒 Secret · ":""}${esc(p.name)} · ${poolLbl(I.pool)}</small><div class="dr">${dd(I.best,w)}${I.rl!=null?`<div class="g">${dieHTML("o",6,v(6,I.rl),44)}<em style="color:${KIND.o[1]}">Reload</em></div>`:""}</div>`+
 (fin?resHTMLD(I):`<div class="res wait"><span>Rolling…</span></div>`)+(I.worst?`<div class="wr"><em>Worse</em>${dd(I.worst,ws)}<span class="wt"></span></div>`:"")+`</div>`}
function reveal(p){if(p.mode=="dice"){const I=infoD(p);return{vals:[...I.best,...(I.rl!=null?[I.rl]:[]),...(I.worst||[])],c:I.c,html:resHTMLD(I),fn:c=>{const w=c.querySelector(".wt");if(w&&I.wt!=null)w.textContent="= "+I.wt}}}
 const I=info(p);return{vals:[I.h,I.f,...I.A.map(e=>e.v),...I.D.map(e=>e.v)],c:I.c,html:resHTML(I)}}
function play(el,p){(el._to||[]).forEach(clearTimeout);clearInterval(el._t);el._to=[];el.innerHTML=card(p,0);
 const X=reveal(p),N=[...el.querySelectorAll(".num")],done=N.map(()=>0);
 const put=(t,v)=>{t.textContent=v;t.style.setProperty("--k",fitK(n(t.dataset.s),v))};
 el._t=setInterval(()=>N.forEach((t,i)=>done[i]||put(t,R(n(t.dataset.s)))),70);
 N.forEach((t,i)=>el._to.push(setTimeout(()=>{done[i]=1;put(t,X.vals[i])},settleAt(i,N.length))));
 el._to.push(setTimeout(()=>{clearInterval(el._t);const c=el.firstChild;c.style.setProperty("--c",X.c);c.querySelector(".res").outerHTML=X.html;X.fn&&X.fn(c)},revealAt(N.length)))}
let _mem=[];const logGet=()=>{try{return JSON.parse(localStorage.getItem("dh-log")||"[]")}catch(e){return _mem}};
const logSet=L=>{_mem=L;try{localStorage.setItem("dh-log",JSON.stringify(L))}catch(e){}},logAdd=p=>logSet([p,...logGet()].slice(0,30));
const logItemH=p=>{const I=info(p);return `<div class="li" style="--c:${I.c}"><strong>${I.total}</strong><div><span class="who">${p.secret?"🔒 ":""}${esc(p.name)}</span> <span class="lab">${I.lab}</span><div class="bd">${I.bd}</div></div></div>`};
const logItem=p=>{if(p.mode!="dice")return logItemH(p);const I=infoD(p);return `<div class="li" style="--c:${I.c}"><strong>${I.bt}</strong><div><span class="who">${p.secret?"🔒 ":""}${esc(p.name)}</span> <span class="lab">${poolLbl(I.pool)}${I.power?" · Powerful":""}${I.reloaded?" · Reloaded":""}</span><div class="bd">${I.bd}${I.power?` <span style="opacity:.6">(worse ${I.wt})</span>`:""}</div></div></div>`};
document.head.insertAdjacentHTML("beforeend",`<style>@font-face{font-family:"Germania One";src:url(fonts/GermaniaOne-Regular.ttf)}</style><style>:root{--bg:#232a4d;--ff:"Germania One",Impact,"Arial Narrow",system-ui,sans-serif}
.rc{background:var(--bg);border:2px solid var(--c);border-radius:14px;padding:12px;color:#fff;font-family:var(--ff);position:relative;width:316px;box-shadow:0 4px 18px #000a;transition:border-color .3s}
.rc small{opacity:.7}.dr{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:flex-end;justify-content:center;margin:8px 0}
.g{display:flex;flex-direction:column;align-items:center}.g em{font-size:11px;font-style:normal;letter-spacing:.08em;text-transform:uppercase;margin-top:2px}
.dw{position:relative;width:var(--w)}.ol{display:block;width:100%;aspect-ratio:1;background:var(--col);-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}
.num{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;white-space:nowrap;font:400 calc(var(--w)*var(--fs)*var(--k))/1 var(--ff);color:var(--col)}
.res{display:flex;align-items:baseline;justify-content:center;gap:10px;min-height:44px}.res strong{font-size:40px;line-height:1}.res span{color:var(--c);font-size:18px}.res.wait span{color:#9fb0c4}.bd{font-size:14px;text-align:center}
.cx{position:absolute;top:8px;right:8px;width:24px;height:24px;border:0;border-radius:50%;background:#38458d;color:#fff;cursor:pointer;font:700 16px/1 system-ui,sans-serif;padding:0}.cx:hover{background:#7a64e8}
.wr{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;opacity:.85}.wr em{font-style:normal;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9aa5d8}.wt{font-size:16px;color:#9aa5d8}
.ic{display:block;background:currentColor;pointer-events:none;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}
.pop{animation:pop .3s ease-out}@keyframes pop{from{transform:scale(.6);opacity:0}}</style>`);

document.addEventListener("click",e=>{if(e.target.closest(".cx")&&window.closeResult)window.closeResult()});
