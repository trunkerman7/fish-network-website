import { createMotes } from "/vendor/motes/index.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

function mountNavigation() {
  const investorToggle = document.querySelector("[data-investor-toggle]");
  const investorMenu = document.querySelector("[data-investor-menu]");
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileClose = document.querySelector("[data-mobile-close]");
  const mobileInvestorToggle = document.querySelector("[data-mobile-investor-toggle]");
  const mobileInvestorMenu = document.querySelector("[data-mobile-investor-menu]");

  const closeInvestors = () => {
    investorToggle?.setAttribute("aria-expanded", "false");
    if (investorMenu) investorMenu.hidden = true;
  };

  investorToggle?.addEventListener("click", () => {
    const open = investorToggle.getAttribute("aria-expanded") !== "true";
    investorToggle.setAttribute("aria-expanded", String(open));
    if (investorMenu) investorMenu.hidden = !open;
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".fish-site-header__investors")) closeInvestors();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeInvestors();
    if (mobileMenu?.open) mobileMenu.close();
  });

  mobileToggle?.addEventListener("click", () => {
    if (!mobileMenu?.open) {
      mobileMenu?.showModal();
      mobileToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-menu-open");
    }
  });

  mobileClose?.addEventListener("click", () => mobileMenu?.close());

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) mobileMenu.close();
  });

  mobileMenu?.addEventListener("close", () => {
    mobileToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-menu-open");
    mobileInvestorToggle?.setAttribute("aria-expanded", "false");
    if (mobileInvestorMenu) mobileInvestorMenu.hidden = true;
  });

  mobileInvestorToggle?.addEventListener("click", () => {
    const open = mobileInvestorToggle.getAttribute("aria-expanded") !== "true";
    mobileInvestorToggle.setAttribute("aria-expanded", String(open));
    if (mobileInvestorMenu) mobileInvestorMenu.hidden = !open;
  });
}

function mountFaq() {
  const toggles = [...document.querySelectorAll("[data-faq-toggle]")];
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggles.forEach((item) => {
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        const open = item === toggle && nextOpen;
        item.setAttribute("aria-expanded", String(open));
        if (panel) panel.hidden = !open;
      });
    });
  });
}

function mountForm() {
  const form = document.querySelector("[data-organizer-form]");
  const description = form?.querySelector("[data-description]");
  const count = form?.querySelector("[data-character-count]");
  const status = form?.querySelector("[data-form-status]");
  if (!form) return;

  description?.addEventListener("input", () => {
    if (count) count.textContent = `${description.value.length} / 600`;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (status) status.textContent = "Preview complete. No information was sent.";
  });
}

function mountHeroField() {
  const canvas = document.querySelector("[data-subpage-field], [data-school-field]");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  let field;
  try {
    field = createMotes(canvas, {
      effect: "flow",
      pointer: finePointer.matches && !reduceMotion.matches,
      radius: 190,
      force: 0.72,
      speed: reduceMotion.matches ? 0 : 0.22,
      density: 13,
      charset: " .:=-+*#%@",
      accent: "#705cff",
      ink: "#50669f",
      background: "transparent",
      contrast: 1.18,
      brightness: -0.08,
      trail: reduceMotion.matches ? 0 : 0.2,
      respectMotionPreference: true,
    });
  } catch (error) {
    console.warn("[Fish Network] Opening field could not start.", error);
    return;
  }

  let visible = true;
  const sync = () => {
    field.set({
      pointer: finePointer.matches && !reduceMotion.matches,
      speed: reduceMotion.matches ? 0 : 0.22,
      trail: reduceMotion.matches ? 0 : 0.2,
    });
    if (visible && !document.hidden && !reduceMotion.matches) field.start();
    else field.stop();
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { rootMargin: "100px 0px" });

  observer.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  reduceMotion.addEventListener("change", sync);
  finePointer.addEventListener("change", sync);
  sync();

  window.addEventListener("pagehide", () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reduceMotion.removeEventListener("change", sync);
    finePointer.removeEventListener("change", sync);
    field.destroy();
  }, { once: true });
}

function mount() {
  mountNavigation();
  mountFaq();
  mountForm();
  mountHeroField();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
else mount();
