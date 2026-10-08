(() => {
  const root = document.documentElement;
  let frame = 0;

  const sync = () => {
    frame = 0;
    root.toggleAttribute("data-fish-nav-scrolled", window.scrollY > 0);
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("pageshow", sync);
})();
