import { createKoiAsciiField } from './fish-koi-preserved.js';

const fields=[...document.querySelectorAll('[data-ascii-subhero]')].map(createKoiAsciiField);
window.addEventListener('pagehide',event=>{
  if(!event.persisted)fields.forEach(field=>field?.destroy());
});
