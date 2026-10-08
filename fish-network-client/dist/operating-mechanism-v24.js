// Same critically damped-feeling spring constants as Hairline's shared engine
// (k=100, c=18, m=1). Geometry transforms only; no SVG paths rebuilt per frame.
export function createOperatingMechanism(svg) {
 const fine=matchMedia('(hover:hover) and (pointer:fine)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const stages=[...svg.querySelectorAll('[data-hx-sheet]')],labels=[...svg.querySelectorAll('[data-hx-label]')];
 const parts=stages.flatMap(stage=>[...stage.querySelectorAll('[data-hx-part]')].map(el=>({el,stage:Number(stage.dataset.hxSheet),kind:el.dataset.kind,u:Number(el.dataset.u),v:Number(el.dataset.v),x:0,velocity:0,target:0})));
 let weights=[1,0,0,0],position=0,hovered=null,frame=0,last=0,visible=true,destroyed=false;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function targets(){parts.forEach(p=>{
  const strength=weights[p.stage+1]||0;
  const focus=hovered?.stage===p.stage?hovered.u:clamp(position-(p.stage+1)+.45);
  const distance=p.kind==='module'?Math.hypot(p.u-focus,p.v-.5):Math.abs(p.u-focus);
  const influence=Math.max(0,1-distance/(p.kind==='module'?.85:.5));
  p.target=strength*(p.kind==='module'?4+22*influence:p.kind==='folio'?4+23*influence:3+23*influence);
  p.el.classList.toggle('is-inspected',hovered===p);
 });}
 function draw(){
  parts.forEach(p=>{
   const x=p.kind==='ledger'?-p.x*.9:p.kind==='folio'?p.x*.2:0;
   const y=p.kind==='ledger'?p.x*.43:-p.x;
   p.el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
  });
 }
 function tick(now){
  frame=0;if(destroyed||!visible)return;
  const dt=Math.min(.032,last?(now-last)/1000:1/60);last=now;let moving=false;
  for(const p of parts){const count=Math.ceil(dt*240),h=dt/count;for(let j=0;j<count;j++){p.velocity+=(-100*(p.x-p.target)-18*p.velocity)*h;p.x+=p.velocity*h;}
   if(Math.abs(p.x-p.target)<.01&&Math.abs(p.velocity)<.1){p.x=p.target;p.velocity=0;}else moving=true;
  }draw();if(moving)frame=requestAnimationFrame(tick);else last=0;
 }
 function wake(){if(!frame&&visible&&!destroyed)frame=requestAnimationFrame(tick);}
 function set(next,nextPosition,{instant=false,staticView=false}={}){
  weights=next;position=nextPosition;
  const spread=staticView?0:1-weights[0];
  stages.forEach(stage=>{
   const i=Number(stage.dataset.hxSheet),w=weights[i+1]||0;
   const y=(i-1)*16*spread-w*8;
   stage.style.transform=`translateY(${y}px)`;
   stage.style.opacity=staticView?1:.6+.4*Math.max(w,weights[0]*.6);
   stage.querySelector('.hx-sheet-light').style.opacity=.2+.8*w;
   stage.querySelector('.hx-rim').style.opacity=.22+.78*w;
   const label=labels.find(el=>Number(el.dataset.hxLabel)===i);label.style.transform=`translateY(${y}px)`;label.style.opacity=staticView?1:w;
  });targets();
  if(instant||reduce.matches||staticView){cancelAnimationFrame(frame);frame=0;last=0;parts.forEach(p=>{p.x=p.target;p.velocity=0;});draw();}else wake();
 }
 const pointer=event=>{if(!fine.matches||reduce.matches)return;const el=event.target.closest('[data-hx-part]');const next=parts.find(p=>p.el===el&&weights[p.stage+1]>.5)||null;if(next===hovered)return;hovered=next;targets();wake();};
 const leave=()=>{hovered=null;targets();wake();};
 svg.addEventListener('pointermove',pointer);svg.addEventListener('pointerleave',leave);
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}});observer.observe(svg);
 return {set,destroy(){destroyed=true;cancelAnimationFrame(frame);observer.disconnect();svg.removeEventListener('pointermove',pointer);svg.removeEventListener('pointerleave',leave);}};
}
