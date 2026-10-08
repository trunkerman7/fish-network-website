const fine = matchMedia('(hover: hover) and (pointer: fine)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
// Existing figure geometry and entrance animation are untouched. Link its modules
// to the explanatory headings through their original scene-step identifiers.
const components = document.querySelector('.composition-components');
if (components) {
  const figure = components.querySelector('[data-fish-figure="protocol-flow"]');
  const buttons = [...components.querySelectorAll('[data-fn-component]')];
  let selected = null;
  function show(index, instant = false) {
    if (!figure) return;
    figure.classList.toggle('fn-linked', index !== null);
    figure.classList.toggle('fn-instant', instant || reduce.matches);
    const step = [1, 2, 4][index];
    figure.querySelectorAll('.fish-site-figure__module').forEach(node => node.classList.toggle('fn-highlight', Number(node.style.getPropertyValue('--figure-step')) === step));
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === selected)));
  }
  buttons.forEach((button,index) => {
    button.addEventListener('pointerenter', () => { if(fine.matches)show(index); });
    button.addEventListener('pointerleave', () => show(selected));
    button.addEventListener('focus', () => show(index,true));
    button.addEventListener('blur', () => show(selected,true));
    button.addEventListener('click', event => { selected = selected === index ? null : index; show(selected,event.detail === 0); });
    button.addEventListener('keydown', event => { if(event.key === 'Escape') { selected=null; show(null,true); } });
  });
}
