import {createVehicleDiagram} from './vehicle-diagrams-v25.js';
const curtain=document.querySelector('[data-school-curtain]');
if(curtain) {
  const leaves=[...curtain.querySelectorAll('.sc-leaf')];
  const buttons=leaves.map(leaf=>leaf.querySelector('button'));
  let instantFrame;
  const choose=(index,instant=false)=>{
    cancelAnimationFrame(instantFrame);
    curtain.classList.toggle('is-instant',instant);
    leaves.forEach((leaf,i)=>{
      leaf.classList.toggle('is-open',i===index);
      buttons[i].setAttribute('aria-expanded',String(i===index));
      const detail=leaf.querySelector('.sc-detail');
      detail.inert=i!==index;detail.setAttribute('aria-hidden',String(i!==index));
    });
    if(instant)instantFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>curtain.classList.remove('is-instant')));
  };
  buttons.forEach((button,i)=>{
    button.addEventListener('click',event=>choose(i,event.detail===0));
    leaves[i].addEventListener('click',event=>{if(!event.target.closest('button')&&!leaves[i].classList.contains('is-open'))choose(i);});
    button.addEventListener('keydown',event=>{
      const index=event.key==='ArrowRight'||event.key==='ArrowDown'?(i+1)%4:event.key==='ArrowLeft'||event.key==='ArrowUp'?(i+3)%4:event.key==='Home'?0:event.key==='End'?3:null;
      if(index===null)return;event.preventDefault();buttons[index].focus();choose(index,true);
    });
  });
  // Fixed inner width keeps the copy from reflowing while the panel curtain moves.
  const observer=new ResizeObserver(()=>curtain.style.setProperty('--sc-content-width',`${Math.max(0,(curtain.clientWidth-12)*3.6/6.6-48)}px`));
  observer.observe(curtain);curtain.classList.add('is-enhanced');choose(0,true);
}
const explorer=document.querySelector('[data-school-explorer]');
if(explorer) {
  const tabs=[...explorer.querySelectorAll('[role=tab]')],panels=[...explorer.querySelectorAll('[role=tabpanel]')];
  const mounts=new Map();
  const choose=index=>{
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
    const host=panels[index].querySelector('[data-school-figure]');
    if(!mounts.has(host))mounts.set(host,createVehicleDiagram(host));
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>choose(i));
    tab.addEventListener('keydown',event=>{
      const index=event.key==='ArrowRight'?(i+1)%4:event.key==='ArrowLeft'?(i+3)%4:event.key==='Home'?0:event.key==='End'?3:null;
      if(index===null)return;event.preventDefault();choose(index);tabs[index].focus();
    });
  });
  explorer.classList.add('is-enhanced');choose(0);
  window.addEventListener('pagehide',event=>{if(!event.persisted)mounts.forEach(figure=>figure.destroy());});
}
