(() => {
  const ctaSelector = ".fish-cta";
  const labelSelector = "[data-fish-cta-label]";
  const scrambleCharacters = "!<>-_\\/[]{}=+*^?#_";
  const boundCtas = new WeakSet();

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const findLabel = (cta) =>
    cta.querySelector(labelSelector) ||
    Array.from(cta.children).find(
      (child) => child.tagName === "SPAN" && child.getAttribute("aria-hidden") !== "true",
    );

  const bindCta = (cta) => {
    if (!(cta instanceof HTMLElement) || boundCtas.has(cta)) return;
    const label = findLabel(cta);
    if (!label) return;
    if (!label.hasAttribute("data-fish-cta-label")) {
      label.setAttribute("data-fish-cta-label", "");
    }

    const originalCharacters = Array.from(label.textContent || "");
    const state = {
      characters: originalCharacters,
      length: originalCharacters.length,
      rafId: null,
    };

    cta.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse" || state.rafId) return;

      let step = 0;
      let previousTime = 0;
      const frame = (time) => {
        if (!previousTime) previousTime = time;
        if (time - previousTime >= 18) {
          previousTime = time;
          let text = "";
          let restored = 0;

          for (let index = 0; index < state.length; index += 1) {
            const scrambleEnd = index + 4;
            if (step < index) text += state.characters[index];
            else if (step < scrambleEnd) {
              text += scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
            } else {
              text += state.characters[index];
              restored += 1;
            }
          }

          label.textContent = text;
          if (restored === state.length) {
            state.rafId = null;
            return;
          }
          step += 1;
        }
        state.rafId = window.requestAnimationFrame(frame);
      };

      state.rafId = window.requestAnimationFrame(frame);
    });

    boundCtas.add(cta);
  };

  const bindWithin = (root) => {
    if (root.matches?.(ctaSelector)) bindCta(root);
    root.querySelectorAll?.(ctaSelector).forEach(bindCta);
  };

  bindWithin(document);
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) bindWithin(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
