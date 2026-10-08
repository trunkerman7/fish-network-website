import {createMotes} from './vendor/motes-0.3.0/index.fish.js';
const section=document.querySelector('[data-school-curtain]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const variants=[
 {effect:'flow',ink:'#8883c2',accent:'#c7b6ff',speed:.65,density:8},
 {effect:'waves',ink:'#589c9e',accent:'#91e6cc',speed:.5,density:8},
 {effect:'contour',ink:'#6c8dbc',accent:'#a6c9ff',speed:.6,density:7},
 {effect:'aurora',ink:'#b09266',accent:'#f2ca8c',speed:.55,density:8}
];
const fields=section?[...section.querySelectorAll('[data-school-flow]')].map((host,i)=>({host,canvas:host.querySelector('canvas'),config:variants[i],instance:null,visible:false,failed:false})):[];
function sync(field) {
 const active=field.visible&&field.host.closest('.sc-leaf').classList.contains('is-open')&&!document.hidden;
 if(active&&!field.instance&&!field.failed) {
  try{field.instance=createMotes(field.canvas,{...field.config,background:'#0b1020',contrast:1,brightness:.1,trail:.2,pointer:fine.matches&&!reduced.matches,respectMotionPreference:true});field.instance.set({});requestAnimationFrame(()=>field.host.classList.add('is-live'));}
  catch{field.failed=true;field.host.dataset.flowState='fallback';return;}
 }
 if(!field.instance)return;
 if(active&&!reduced.matches){field.instance.start();field.host.dataset.flowState='running';}
 else {field.instance.stop();field.host.dataset.flowState=active?'paused':'offscreen';if(active)field.instance.set({pointer:false});}
}
fields.forEach(field=>{
 new ResizeObserver(()=>{if(field.instance&&reduced.matches)field.instance.set({});}).observe(field.host);
 field.canvas.addEventListener('webglcontextlost',()=>{field.instance?.stop();field.failed=true;field.host.classList.remove('is-live');field.host.dataset.flowState='fallback';});
});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{const field=fields.find(f=>f.host===entry.target);field.visible=entry.isIntersecting;sync(field);});},{threshold:.01});
fields.forEach(f=>observer.observe(f.host));
if(section)new MutationObserver(()=>fields.forEach(sync)).observe(section,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>fields.forEach(sync));
const preferences=()=>fields.forEach(f=>{f.instance?.set({pointer:fine.matches&&!reduced.matches});sync(f);});
reduced.addEventListener('change',preferences);fine.addEventListener('change',preferences);
window.addEventListener('pagehide',event=>{if(!event.persisted)fields.forEach(f=>f.instance?.destroy());});
