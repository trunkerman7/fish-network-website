const map=document.querySelector('[data-protocol-map]');
if(map) {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const buttons=[...map.querySelectorAll('[data-protocol-select]')];
  const objects=[...map.querySelectorAll('[data-protocol-object]')];
  const lines=[...map.querySelectorAll('[data-protocol-line]')];
  const connections=[...map.querySelectorAll('[data-protocol-connection]')];
  const callouts=[...map.querySelectorAll('[data-protocol-callout]')];
  const center=map.querySelector('[data-protocol-module="records"]');
  const lighting=[...map.querySelectorAll('.pa-fuse,.pa-edges,.pa-fill,.pa-connection-burn')];
  let selected=null,active=null,generation=0;
  const animations=new Set();
  const pace=1.3;
  // Convert the incoming connector endpoint into the outline's own coordinate
  // system, including the center plate's scale and responsive SVG transforms.
  function ignitionFrames(outline,line,pointIndex) {
    const point=line.points.getItem(pointIndex);
    const local=new DOMPoint(point.x,point.y)
      .matrixTransform(line.getScreenCTM())
      .matrixTransform(outline.getScreenCTM().inverse());
    const box=outline.getBBox(),x=local.x-box.x,y=local.y-box.y;
    const radius=Math.max(...[[0,0],[box.width,0],[0,box.height],[box.width,box.height]].map(([cx,cy])=>Math.hypot(cx-x,cy-y)))+2;
    const clip=r=>`circle(${r}px at ${x}px ${y}px) fill-box`;
    return [{opacity:1,clipPath:clip(0)},{opacity:1,clipPath:clip(radius)}];
  }
  function reset() {
    generation++;
    animations.forEach(animation=>animation.cancel());animations.clear();
    lighting.forEach(el=>el.classList.remove('is-lit'));
    delete map.dataset.stage;
  }
  async function illuminate(index,run) {
    const reveal=async(el,stage,duration,fill=false,ignition=null)=>{
      if(run!==generation)return false;
      map.dataset.stage=stage;
      const frames=ignition|| (fill?[{opacity:0},{opacity:1}]:[
        {opacity:1,clipPath:getComputedStyle(el).clipPath},
        {opacity:1,clipPath:'inset(0px)'}
      ]);
      const animation=el.animate(frames,{duration:duration*pace,easing:fill?'ease':'linear',fill:'forwards'});
      animations.add(animation);
      try {await animation.finished;} catch {return false;}
      if(run!==generation)return false;
      el.classList.add('is-lit');animation.cancel();animations.delete(animation);
      return true;
    };
    // Each awaited stage completes before the next can begin. Hidden mobile
    // callout lines are skipped, so touch interaction has no invisible delay.
    if(getComputedStyle(lines[index]).display!=='none'&&!(await reveal(lines[index].querySelector('.pa-fuse'),'label',400)))return;
    const componentOutline=objects[index].querySelector('.pa-edges');
    if(!(await reveal(componentOutline,'component-lines',400,false,ignitionFrames(componentOutline,lines[index].querySelector('.pa-leader'),0))))return;
    if(!(await reveal(objects[index].querySelector('.pa-fill'),'component-fill',250,true)))return;
    if(!(await reveal(connections[index].querySelector('.pa-connection-burn'),'connection',400)))return;
    const centerOutline=center.querySelector('.pa-edges'),branch=connections[index].querySelector('.pa-connection-base');
    if(!(await reveal(centerOutline,'center-lines',400,false,ignitionFrames(centerOutline,branch,branch.points.numberOfItems-1))))return;
    if(!(await reveal(center.querySelector('.pa-fill'),'center-fill',600,true)))return;
    map.dataset.stage='complete';
  }
  function show(index,instant=false) {
    instant=instant||reduce.matches;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
    if(active===index&&!instant)return;
    reset();active=index;
    map.toggleAttribute('data-instant',instant);
    if(index===null)map.removeAttribute('data-active');else map.dataset.active=String(index);
    objects.forEach((el,i)=>el.classList.toggle('is-ignited',i===index));
    center.classList.toggle('is-ignited',index!==null);
    lines.forEach((el,i)=>el.classList.toggle('is-ignited',i===index));
    connections.forEach((el,i)=>el.classList.toggle('is-ignited',i===index));
    if(index===null)return;
    if(instant) {
      [lines[index],objects[index],connections[index],center].forEach(el=>el.querySelectorAll('.pa-fuse,.pa-edges,.pa-fill,.pa-connection-burn').forEach(part=>part.classList.add('is-lit')));
      map.dataset.stage='complete';
    } else illuminate(index,generation);
  }
  // Progressive enhancement: content stays visible if JavaScript is unavailable.
  map.classList.add('is-enhanced');
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)) {map.classList.add('is-visible');observer.disconnect();}
  },{threshold:.18});
  observer.observe(map);
  [...callouts,...objects].forEach((target,position)=>{
    const index=position%buttons.length;
    target.addEventListener('pointerenter',()=>{if(fine.matches)show(index);});
    target.addEventListener('pointerleave',()=>show(selected));
  });
  [...buttons,...objects].forEach((button,position)=>{
    const index=position%buttons.length;
    button.addEventListener('focus',()=>{map.classList.add('is-visible');show(index,button.matches(':focus-visible'));});
    button.addEventListener('blur',()=>show(selected));
    button.addEventListener('click',event=>{selected=selected===index?null:index;show(selected,event.detail===0);});
    button.addEventListener('keydown',event=>{if(event.key==='Escape'){selected=null;show(null,true);}});
  });
  reduce.addEventListener('change',()=>show(active,true));
  window.addEventListener('pagehide',event=>{if(!event.persisted){observer.disconnect();reset();}});
}

const review=document.querySelector('[data-reputation-review]');
if(review) {
  const tabs=[...review.querySelectorAll('[role="tab"]')];
  const panels=[...review.querySelectorAll('[role="tabpanel"]')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,animation;
  const choose=(index,instant=false)=>{
    animation?.cancel();
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    panels.forEach((panel,i)=>panel.hidden=i!==index);
    if(index!==current&&!instant&&!reduce.matches) {
      animation=panels[index].animate([{opacity:.35},{opacity:1}],{duration:160,easing:'ease'});
    }
    current=index;
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',event=>choose(i,event.detail===0));
    tab.addEventListener('keydown',event=>{
      const index=event.key==='ArrowDown'?(i+1)%tabs.length:event.key==='ArrowUp'?(i+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
      if(index===null)return;event.preventDefault();choose(index,true);tabs[index].focus();
    });
  });
  review.classList.add('is-enhanced');choose(0,true);
}
