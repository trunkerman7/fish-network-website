// Reuse the homepage's interruptible, damped spring; only transforms change.
export function createVehicleDiagram(host) {
 const fine=matchMedia('(hover:hover) and (pointer:fine)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const svg=host.querySelector('svg'),parts=[...host.querySelectorAll('[data-vehicle-part]')].map(el=>({el,x:0,v:0,target:0}));
 let frame=0,last=0,visible=false;
 const draw=()=>parts.forEach(p=>p.el.style.transform=`translate3d(0,${-p.x}px,0)`);
 function tick(now){frame=0;if(!visible)return;const dt=Math.min(.032,last?(now-last)/1000:1/60);last=now;let moving=false;
  for(const p of parts){const count=Math.ceil(dt*240),h=dt/count;for(let i=0;i<count;i++){p.v+=(-100*(p.x-p.target)-18*p.v)*h;p.x+=p.v*h;}if(Math.abs(p.x-p.target)<.01&&Math.abs(p.v)<.1){p.x=p.target;p.v=0;}else moving=true;}
  draw();if(moving)frame=requestAnimationFrame(tick);else last=0;
 }
 const wake=()=>{if(visible&&!frame)frame=requestAnimationFrame(tick);};
 function reset(){parts.forEach(p=>{p.target=0;p.el.classList.remove('is-inspected');});if(reduce.matches){cancelAnimationFrame(frame);frame=0;parts.forEach(p=>{p.x=0;p.v=0;});draw();}else wake();}
 const move=event=>{if(!fine.matches||reduce.matches)return;const hit=event.target.closest('[data-vehicle-part]');parts.forEach(p=>{p.target=p.el===hit?12:0;p.el.classList.toggle('is-inspected',p.el===hit);});wake();};
 svg.addEventListener('pointermove',move);svg.addEventListener('pointerleave',reset);reduce.addEventListener('change',reset);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;reset();}});observer.observe(host);
 return {destroy(){cancelAnimationFrame(frame);observer.disconnect();svg.removeEventListener('pointermove',move);svg.removeEventListener('pointerleave',reset);reduce.removeEventListener('change',reset);}};
}
