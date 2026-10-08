import {createKoiAsciiField} from './fish-koi-preserved.js';
import {createOperatingMechanism} from './operating-mechanism-v24.js';
const hero=document.querySelector('[data-fish-hero]');
const koi=hero?createKoiAsciiField(hero):null;
const system=document.querySelector('[data-hx-system]');
const mechanism=system?createOperatingMechanism(system.querySelector('.hx-diagram')):null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const desktop=matchMedia('(min-width:1000px) and (min-height:700px)');
const clamp=v=>Math.max(0,Math.min(1,v));
let frame=0,visible=true,instantFigure=false;
if(system) {
  const copies=[...system.querySelectorAll('[data-hx-copy]')],chapters=[...system.querySelectorAll('[data-hx-chapter]')],rail=system.querySelector('.hx-rail i');
  const render=()=>{
    frame=0;if(!system.classList.contains('is-scroll')||!visible)return;
    const progress=clamp(-system.getBoundingClientRect().top/(system.offsetHeight-innerHeight));
    const position=Math.min(3,progress*3.6),base=Math.floor(position),blend=clamp((position-base-.72)/.28);
    const weights=copies.map((_,i)=>i===base?1-blend:i===base+1?blend:0);
    copies.forEach((el,i)=>{const w=weights[i];el.style.opacity=w;el.style.transform=`translate3d(0,${i<=base?-18*(1-w):18*(1-w)}px,0)`;el.inert=w<.5;el.setAttribute('aria-hidden',String(w<.5));});
    mechanism.set(weights,position,{instant:instantFigure});instantFigure=false;
    rail.style.transform=`scaleY(${progress})`;
    chapters.forEach((el,i)=>{if(weights[i+1]>=.5)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    system.dataset.stage=String(weights.indexOf(Math.max(...weights)));
  };
  const schedule=()=>{if(!frame&&visible)frame=requestAnimationFrame(render);};
  const configure=()=>{
    const enabled=desktop.matches&&!reduce.matches;system.classList.toggle('is-scroll',enabled);
    if(!enabled){copies.forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform');el.inert=false;el.removeAttribute('aria-hidden');});mechanism.set([1,0,0,0],0,{instant:true,staticView:true});rail.style.transform='scaleY(1)';}
    else {visible=true;schedule();}
  };
  chapters.forEach(button=>button.addEventListener('click',event=>{instantFigure=event.detail===0;const p=Number(button.dataset.hxChapter)/3.6;window.scrollTo({top:scrollY+system.getBoundingClientRect().top+(system.offsetHeight-innerHeight)*p,behavior:'instant'});schedule();}));
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();},{rootMargin:'100px'}).observe(system);
  new ResizeObserver(schedule).observe(system);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduce.addEventListener('change',configure);desktop.addEventListener('change',configure);configure();
}
const brief=document.querySelector('[data-hx-brief]');
if(brief) {
 const tabs=[...brief.querySelectorAll('[role=tab]')],panels=[...brief.querySelectorAll('[role=tabpanel]')];let animation;
 const choose=(index,animate=false)=>{animation?.cancel();tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});if(animate&&!reduce.matches)animation=panels[index].animate([{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(0.23,1,0.32,1)'});};
 tabs.forEach((tab,i)=>{tab.addEventListener('click',e=>choose(i,e.detail!==0));tab.addEventListener('keydown',e=>{const index=e.key==='ArrowRight'?(i+1)%4:e.key==='ArrowLeft'?(i+3)%4:e.key==='Home'?0:e.key==='End'?3:null;if(index===null)return;e.preventDefault();choose(index);tabs[index].focus();});});brief.classList.add('is-enhanced');choose(0);
}
window.addEventListener('pagehide',event=>{if(!event.persisted){koi?.destroy();mechanism?.destroy();cancelAnimationFrame(frame);}});
