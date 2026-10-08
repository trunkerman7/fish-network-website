import { createMotes } from "./vendor/motes/index.js";

function mountFishFooter() {
  const footer = document.querySelector("[data-fish-footer]");
  const canvas = footer?.querySelector("[data-fish-footer-ocean]");
  if (!footer || !canvas || footer.dataset.fishFooterMounted === "true") return;

  footer.dataset.fishFooterMounted = "true";
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  let visible = false;
  let field;

  try {
    field = createMotes(canvas, {
      effect: "flow",
      pointer: pointerQuery.matches && !reduceQuery.matches,
      radius: 190,
      force: 1.15,
      speed: reduceQuery.matches ? 0 : 0.34,
      density: 14,
      charset: " .:-=+*#%@",
      accent: "#5647ff",
      background: "transparent",
      ink: "#35518f",
      contrast: 1.2,
      brightness: -0.1,
      trail: reduceQuery.matches ? 0 : 0.42,
      respectMotionPreference: true,
    });
  } catch (error) {
    console.warn("[Fish footer] ASCII ocean could not start.", error);
    footer.classList.add("fish-site-footer--static");
    return;
  }

  function syncPlayback() {
    if (reduceQuery.matches) {
      field.stop();
      field.set({ pointer: false, speed: 0, trail: 0 });
    } else if (visible && !document.hidden) {
      field.start();
    } else {
      field.stop();
    }
  }

  function syncPreferences() {
    field.set({
      pointer: pointerQuery.matches && !reduceQuery.matches,
      speed: reduceQuery.matches ? 0 : 0.34,
      trail: reduceQuery.matches ? 0 : 0.42,
    });
    syncPlayback();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { rootMargin: "120px 0px" });

  observer.observe(footer);
  document.addEventListener("visibilitychange", syncPlayback);
  reduceQuery.addEventListener("change", syncPreferences);
  pointerQuery.addEventListener("change", syncPreferences);

  window.addEventListener("pagehide", () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncPlayback);
    reduceQuery.removeEventListener("change", syncPreferences);
    pointerQuery.removeEventListener("change", syncPreferences);
    field.destroy();
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountFishFooter, { once: true });
} else {
  mountFishFooter();
}
