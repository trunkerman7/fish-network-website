// Generated from the unchanged Hairline kernel and the shared Fish figure source.

/* hairline kernel sha256:8e2abcbdf63c7755195ee942c39e9c8ea6a539d1147e986dd1c153559121f075 */
/*
 * HL: everything a figure may call. Read this index; the code under it is the
 * package's src/core, unchanged, and a figure should not need to read it.
 *
 * Every figure is drawn in a 400 × 320 viewBox. World space is x/y on the
 * ground and z up. Plates are filled with the ground colour and painted back
 * to front, so a nearer one covers a farther one: append in that order. At
 * the default camera, Cam(45, 0.5, S), +x runs down to the right and +y down
 * to the left, so the corner with the largest x and y is nearest the viewer:
 * append by ascending x + y, from the far corner (smallest x and y) to it.
 *
 * Camera
 *   Cam(azDeg, k, S)                       a camera: azimuth in degrees, k = sin(elevation) (0.5 is the 2:1 view), S = scale
 *   fit(C, points, cx, cy)                 centres the box of [x, y, z] points on (cx, cy); call it once, before proj
 *                                          it only centres, it never scales: choose S by trying values, with the most extreme pose in points.
 *                                          The six figures use S 1.42 to 2.12; the boxes they fit come out 230 to 310 wide and 180 to 245 tall
 *   proj(C)                                returns P(x, y, z), which gives [sx, sy]
 *   unproj(C, sx, sy, z)                   the world [x, y] under a screen point, on the plane at height z
 *   facing(C)                              returns front(sample): whether a ring sample faces the camera
 * Rounded solids
 *   rrect(u0, v0, u1, v1, r, n)            a rounded rectangle, as a ring of samples {u, v, nu, nv}
 *   circ(R, n)                             a circle, as a ring
 *   rings(x0, y0, x1, y1, r, b)            [ring, inner]: a rounded footprint and its crease ring, inset by b
 *                                          r, the corner radius, is cut to half the shorter side. b, the crease's inset in world units
 *                                          (0.6 to 2.2 in the figures), must stay under half the shorter side or the crease turns inside out
 *   prism(P, front, ring, inner, z0, z1)   {sil, crease}: a solid standing from z0 to z1, as two path strings
 *   ringAt(P, ring, z)                     the ring's points, projected at height z
 *   run(ring, keep)                        the one cyclic run of samples that pass keep
 *   hull(points)                           the convex hull of screen points
 *   extremes(P, ring)                      [left, right, nearest] samples: where dashed drops fall from
 *   fillet(points, radii, n)               rounds every vertex of a closed polygon; returns the new points
 *                                          radii is an array, one radius per vertex, each cut to half its shorter edge; a single number gives NaN.
 *                                          n is the steps round each corner, default 4: each vertex becomes n + 1 points
 *   ghost(P, front, ring, z0, depth)       a reflection's path {d, y0, y1}; reflect() draws it for you
 * Paths and numbers
 *   poly(points)                           a closed path string
 *   open(points)                           an open polyline string
 *   seg(a, b)                              one segment between two screen points [sx, sy], as its own subpath; project world points with P first
 *   clamp(v, a, b)
 *   lerp(a, b, t)
 *   rad(deg)
 *   r2(n)                                  two decimals
 * The continuous clock: one spring per moving number
 *   spring(x, opts)                        at rest on x; write .t to retarget; opts {k, c, m, eps}, default k 100, c 18, m 1
 *   stepS(sp, dt)                          advances by dt seconds; returns whether it is still moving
 * The discrete clock: a 700ms tween on (.32, .72, 0, 1)
 *   tween(v, dur)                          at rest on v; dur defaults to 700 (ms)
 *   tset(tw, to, now, delay)               retargets from where it is, after delay ms: the stagger
 *                                          the same target again does nothing, so calling it on every pointer move is safe
 *   tval(tw, now)                          its value at now
 *   tdone(tw, now)                         whether it has landed
 *   bezier(x1, y1, x2, y2)                 a CSS cubic-bezier, as a function of progress
 *   EASE_LIFT                              the lift curve itself
 *   reducedMotion()                        true when the reader asked for less motion; springs and tweens already land at once
 *   setReducedMotion(on)                   the loop's business, not a figure's
 * Drawing
 *   mk(tag, attrs, parent)                 one svg element: the only way a figure makes a node
 *   solid(parent)                          {g, sil, cr}: a group holding a silhouette path and a crease path
 *   put(solid, paths)                      writes prism()'s {sil, crease} into solid()'s {sil, cr}: sil into sil, crease into cr
 *   flatDot(parent, C, r, cls)             a dot lying on the ground plane; cls is "dot", "dot m" or "dot off"
 *   place(el, point)                       moves a dot or a circle to [sx, sy]
 *   reflect(svg, parent, P, front, ring, z0, depth)   a fading mirror under a solid
 *   fade(svg, y0, y1, a0)                  a vertical fade, as a mask; returns the value for a mask attribute
 * Life
 *   register(stage, tick)                  joins the one frame loop; tick(dt in seconds, now in ms) returns true to ask for another frame; gives {wake, unregister}
 *   pointer(stage, handlers)               {move(point), down(point), leave()}, points in viewBox units; returns its disposer
 *   disposer()                             {add, on, dispose}: collects tear-down, so destroy is bag.dispose
 * The bench's business, not a figure's
 *   css(lightDark)
 *   inject(root)
 *
 * Classes, on path, polygon, ellipse and line. They are the whole palette; a
 * figure sets no colour, width or fill of its own.
 *     (none)   filled with the ground colour, medium stroke
 *     sil      the silhouette's stroke        hi    the bright stroke: the only highlight
 *     lo       the dim stroke                 nf    no fill        fo   fill only, no stroke
 *     dash     a dashed guide
 *     dot      a bright dot                   dot m   a medium dot     dot off   a dim dot
 */
var HL = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/hairline/src/core/kernel.ts
  var kernel_exports = {};
  __export(kernel_exports, {
    Cam: () => Cam,
    EASE_LIFT: () => EASE_LIFT,
    bezier: () => bezier,
    circ: () => circ,
    clamp: () => clamp,
    css: () => css,
    disposer: () => disposer,
    extremes: () => extremes,
    facing: () => facing,
    fade: () => fade,
    fillet: () => fillet,
    fit: () => fit,
    flatDot: () => flatDot,
    ghost: () => ghost,
    hull: () => hull,
    inject: () => inject,
    lerp: () => lerp,
    mk: () => mk,
    open: () => open,
    place: () => place,
    pointer: () => pointer,
    poly: () => poly,
    prism: () => prism,
    proj: () => proj,
    put: () => put,
    r2: () => r2,
    rad: () => rad,
    reducedMotion: () => reducedMotion,
    reflect: () => reflect,
    register: () => register,
    ringAt: () => ringAt,
    rings: () => rings,
    rrect: () => rrect,
    run: () => run,
    seg: () => seg,
    setReducedMotion: () => setReducedMotion,
    solid: () => solid,
    spring: () => spring,
    stepS: () => stepS,
    tdone: () => tdone,
    tset: () => tset,
    tval: () => tval,
    tween: () => tween,
    unproj: () => unproj
  });

  // packages/hairline/src/core/iso.ts
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var lerp = (a, b, t) => a + (b - a) * t;
  var rad = (d) => d * Math.PI / 180;
  var r2 = (n) => Math.round(n * 100) / 100;
  var poly = (pts) => "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L") + "Z";
  var seg = (a, b) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
  var open = (pts) => pts.length < 2 ? "" : "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L");
  var Cam = (azDeg, k, S) => ({ az: rad(azDeg), k, S, ox: 0, oy: 0 });
  function proj(C) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    return (x, y, z) => {
      const X = x * c - y * s, Y = x * s + y * c;
      return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
    };
  }
  function unproj(C, sx, sy, z) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    const X = (sx - C.ox) / C.S, Y = ((sy - C.oy) / C.S + z * zf) / C.k;
    return [X * c + Y * s, -X * s + Y * c];
  }
  function fit(C, pts, cx, cy) {
    C.ox = 0;
    C.oy = 0;
    const P = proj(C);
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const p of pts) {
      const q = P(p[0], p[1], p[2]);
      a = Math.min(a, q[0]);
      b = Math.max(b, q[0]);
      c = Math.min(c, q[1]);
      d = Math.max(d, q[1]);
    }
    C.ox = cx - (a + b) / 2;
    C.oy = cy - (c + d) / 2;
  }
  function rrect(u0, v0, u1, v1, r, n = 4) {
    r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
    const out = [];
    for (const [cu, cv, a0] of [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180], [u1 - r, v0 + r, 270]])
      for (let k = 0; k <= n; k++) {
        const a = rad(a0 + 90 * k / n), ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cu + r * ca, v: cv + r * sa, nu: ca, nv: sa });
      }
    return out;
  }
  function circ(R, n = 96) {
    const out = [];
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      out.push({ u: R * ca, v: R * sa, nu: ca, nv: sa });
    }
    return out;
  }
  function hull(input) {
    const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) {
      while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
      up.push(p);
    }
    lo.pop();
    up.pop();
    return lo.concat(up);
  }
  var ringAt = (P, ring, z) => ring.map((q) => P(q.u, q.v, z));
  var facing = (C) => {
    const s = Math.sin(C.az), c = Math.cos(C.az);
    return (q) => q.nu * s + q.nv * c >= -1e-6;
  };
  function run(ring, keep) {
    const n = ring.length;
    let s = -1;
    for (let i = 0; i < n; i++) if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
      s = i;
      break;
    }
    if (s < 0) return keep(ring[0]) ? ring.slice() : [];
    const out = [];
    for (let k = 0; k < n && keep(ring[(s + k) % n]); k++) out.push(ring[(s + k) % n]);
    return out;
  }
  function prism(P, front, ring, inner, z0, z1) {
    return {
      sil: poly(hull(ringAt(P, ring, z1).concat(ringAt(P, ring, z0)))),
      crease: inner ? open(ringAt(P, run(inner, front), z1)) : ""
    };
  }
  var rings = (x0, y0, x1, y1, r, b) => [
    rrect(x0, y0, x1, y1, r),
    rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b))
  ];
  function extremes(P, ring) {
    const pr = ring.map((q) => P(q.u, q.v, 0));
    let a = 0, b = 0, c = 0;
    pr.forEach((p, k) => {
      if (p[0] < pr[a][0]) a = k;
      if (p[0] > pr[b][0]) b = k;
      if (p[1] > pr[c][1]) c = k;
    });
    return [ring[a], ring[b], ring[c]];
  }
  function fillet(pts, rs, n = 4) {
    const m = pts.length, out = [];
    for (let i = 0; i < m; i++) {
      const a = pts[(i + m - 1) % m], p = pts[i], b = pts[(i + 1) % m];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const t = Math.min(rs[i], la / 2, lb / 2);
      const p1 = [p[0] + (a[0] - p[0]) / la * t, p[1] + (a[1] - p[1]) / la * t];
      const p2 = [p[0] + (b[0] - p[0]) / lb * t, p[1] + (b[1] - p[1]) / lb * t];
      for (let k = 0; k <= n; k++) {
        const s = k / n, w = 1 - s;
        out.push([w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0], w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1]]);
      }
    }
    return out;
  }
  function ghost(P, front, ring, z0, depth) {
    const f = run(ring, front), lowP = ringAt(P, f, z0 - depth);
    return {
      d: open(lowP) + [f[0], f[f.length - 1]].map((q) => seg(P(q.u, q.v, z0), P(q.u, q.v, z0 - depth))).join(""),
      y0: Math.min(...ringAt(P, f, z0).map((p) => p[1])),
      y1: Math.max(...lowP.map((p) => p[1])) + 2
    };
  }

  // packages/hairline/src/core/motion.ts
  var reduced = false;
  var setReducedMotion = (on) => {
    reduced = on;
  };
  var reducedMotion = () => reduced;
  function spring(x, o = {}) {
    return { x, v: 0, t: x, k: o.k ?? 100, c: o.c ?? 18, m: o.m ?? 1, eps: o.eps ?? 0.01 };
  }
  function stepS(sp, dt) {
    if (reduced) {
      sp.x = sp.t;
      sp.v = 0;
      return false;
    }
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = (-sp.k * (sp.x - sp.t) - sp.c * sp.v) / sp.m;
      sp.v += a * h;
      sp.x += sp.v * h;
    }
    if (Math.abs(sp.x - sp.t) < sp.eps && Math.abs(sp.v) < sp.eps * 10) {
      sp.x = sp.t;
      sp.v = 0;
      return false;
    }
    return true;
  }
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u;
    const Y = (u) => ((ay * u + by) * u + cy) * u;
    const dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let u = t;
      for (let i = 0; i < 8; i++) {
        const e = X(u) - t;
        if (Math.abs(e) < 1e-5) break;
        const d = dX(u);
        if (Math.abs(d) < 1e-6) break;
        u -= e / d;
      }
      if (!(u >= 0 && u <= 1) || Math.abs(X(u) - t) > 1e-4) {
        let lo = 0, hi = 1;
        u = t;
        for (let i = 0; i < 24; i++) {
          if (X(u) < t) lo = u;
          else hi = u;
          u = (lo + hi) / 2;
        }
      }
      return Y(u);
    };
  }
  var EASE_LIFT = bezier(0.32, 0.72, 0, 1);
  var tween = (v, dur = 700) => ({ from: v, to: v, t0: -1e9, dur });
  var tval = (tw, now) => {
    const p = clamp((now - tw.t0) / tw.dur, 0, 1);
    return tw.from + (tw.to - tw.from) * (reduced ? 1 : EASE_LIFT(p));
  };
  var tset = (tw, to, now, delay) => {
    if (tw.to === to) return;
    tw.from = tval(tw, now);
    tw.to = to;
    tw.t0 = now + delay;
  };
  var tdone = (tw, now) => reduced || now >= tw.t0 + tw.dur;

  // packages/hairline/src/core/stage.ts
  var NS = "http://www.w3.org/2000/svg";
  function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  function solid(parent) {
    const g = mk("g", {}, parent);
    return { g, sil: mk("path", { class: "sil" }, g), cr: mk("path", { class: "nf lo" }, g) };
  }
  var put = (el, s) => {
    el.sil.setAttribute("d", s.sil);
    el.cr.setAttribute("d", s.crease);
  };
  var flatDot = (parent, C, r, cls) => mk("ellipse", { rx: r2(r * C.S), ry: r2(r * C.S * C.k), class: cls }, parent);
  var place = (el, q) => {
    el.setAttribute("cx", String(r2(q[0])));
    el.setAttribute("cy", String(r2(q[1])));
  };
  var fid = 0;
  function fade(svg, y0, y1, a0 = 0.7) {
    const id = "hl-fd" + ++fid, defs = mk("defs", {}, svg);
    const lg = mk("linearGradient", { id: id + "g", gradientUnits: "userSpaceOnUse", x1: 0, y1: r2(y0), x2: 0, y2: r2(y1) }, defs);
    mk("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": a0 }, lg);
    mk("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }, lg);
    const m = mk("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 400, height: 320 }, defs);
    mk("rect", { x: 0, y: 0, width: 400, height: 320, fill: `url(#${id}g)` }, m);
    return `url(#${id})`;
  }
  function reflect(svg, parent, P, front, ring, z0, depth) {
    const r = ghost(P, front, ring, z0, depth);
    const gh = mk("g", { class: "ghost", mask: fade(svg, r.y0, r.y1) }, parent);
    mk("path", { d: r.d }, gh);
  }
  var boards = [];
  var byStage = /* @__PURE__ */ new Map();
  var raf = 0;
  var last = 0;
  var io = null;
  var rm = null;
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1e3));
    last = now;
    let any = false;
    for (const b of boards.slice()) if (b.vis && b.awake) {
      b.awake = !!b.tick(dt, now);
      any = any || b.awake;
    }
    raf = any ? requestAnimationFrame(frame) : 0;
  }
  function wake(b) {
    b.awake = true;
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  var onMotion = () => {
    setReducedMotion(!!rm?.matches);
    boards.forEach(wake);
  };
  function start() {
    if (io) return;
    io = new IntersectionObserver((es) => {
      for (const e of es) {
        const b = byStage.get(e.target);
        if (!b) continue;
        b.vis = e.isIntersecting;
        if (b.vis) wake(b);
      }
    }, { rootMargin: "80px" });
    rm = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(rm.matches);
    rm.addEventListener("change", onMotion);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    rm?.removeEventListener("change", onMotion);
    rm = null;
  }
  function register(stage, tick) {
    start();
    const b = { stage, tick, vis: false, awake: true };
    boards.push(b);
    byStage.set(stage, b);
    io.observe(stage);
    tick(0, performance.now());
    let gone = false;
    return {
      wake: () => {
        if (!gone) wake(b);
      },
      unregister: () => {
        if (gone) return;
        gone = true;
        boards = boards.filter((x) => x !== b);
        if (byStage.get(stage) === b) {
          byStage.delete(stage);
          io?.unobserve(stage);
        }
        if (!boards.length) stop();
      }
    };
  }
  function pointer(stage, on) {
    let tm = 0;
    const pt = (e) => {
      const r = stage.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 400, (e.clientY - r.top) / r.height * 320];
    };
    const move = (e) => {
      clearTimeout(tm);
      on.move(pt(e), e);
    };
    const down = (e) => {
      clearTimeout(tm);
      if (e.pointerType !== "mouse") stage.releasePointerCapture?.(e.pointerId);
      if (on.down) on.down(pt(e), e);
      else on.move(pt(e), e);
    };
    const leave = (e) => {
      clearTimeout(tm);
      tm = window.setTimeout(() => on.leave(e), e.pointerType === "mouse" ? 0 : 1400);
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(tm);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerleave", leave);
    };
  }
  function disposer() {
    let fns = [];
    return {
      add: (fn) => {
        fns.push(fn);
      },
      on: (target, type, fn, opts) => {
        const h = fn;
        target.addEventListener(type, h, opts);
        fns.push(() => target.removeEventListener(type, h, opts));
      },
      dispose: () => {
        const run2 = fns;
        fns = [];
        for (let i = run2.length - 1; i >= 0; i--) run2[i]();
      }
    };
  }

  // packages/hairline/src/core/styles.ts
  var LIGHT = { plate: "#ffffff", hi: "#232327", edge: "#a4a4ac", mid: "#c3c3c9", lo: "#e0e0e4" };
  var DARK = { plate: "#08090a", hi: "#d0d6e0", edge: "#5b5d64", mid: "#3e3e44", lo: "#29292d" };
  var KEYS = ["plate", "hi", "edge", "mid", "lo"];
  var vars = (p) => KEYS.map((k) => `--hl-${k}:var(--hairline-${k},${p[k]});`).join("");
  var EASE = "cubic-bezier(0.5,0,0.1,1)";
  var SVG = ":where([data-hairline]>svg)";
  function css(lightDark) {
    const both = Object.fromEntries(KEYS.map((k) => [k, `light-dark(${LIGHT[k]},${DARK[k]})`]));
    return [
      // the box, and the palette: light unless something below says otherwise
      `:where([data-hairline]){display:block;position:relative;aspect-ratio:5/4;touch-action:pan-y;user-select:none;-webkit-user-select:none;--hl-sw:var(--hairline-stroke,0.9);${vars(LIGHT)}}`,
      // the page's color-scheme
      lightDark ? `:where([data-hairline]){${vars(both)}}` : "",
      // an ancestor that says dark
      `:where(.dark,[data-theme="dark"]) :where([data-hairline]){${vars(DARK)}}`,
      // the figure's own theme option
      `:where([data-hairline][data-hairline-theme="light"]){${vars(LIGHT)}}`,
      `:where([data-hairline][data-hairline-theme="dark"]){${vars(DARK)}}`,
      `:where([data-hairline]:focus-visible){outline:1.5px solid var(--hl-hi);outline-offset:2px}`,
      `${SVG}{position:absolute;inset:0;width:100%;height:100%;display:block}`,
      // Riffle's live region: read, not seen
      `:where([data-hairline]>[data-hairline-live]){position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
      // the drawing: plates are filled with the plate colour and painted back to front
      `${SVG} :where(path,polygon,ellipse,line){fill:var(--hl-plate);stroke:var(--hl-mid);stroke-width:var(--hl-sw);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;transition:stroke 260ms ${EASE}}`,
      `${SVG} :where(.nf){fill:none}`,
      `${SVG} :where(.fo){stroke:none}`,
      `${SVG} :where(.sil){stroke:var(--hl-edge)}`,
      `${SVG} :where(.hi){stroke:var(--hl-hi)}`,
      `${SVG} :where(.lo){stroke:var(--hl-lo)}`,
      `${SVG} :where(.dash){stroke-dasharray:1 3}`,
      `${SVG} :where(.dot){stroke:none;fill:var(--hl-hi);transition:fill 260ms ${EASE}}`,
      `${SVG} :where(.dot.m){fill:var(--hl-edge)}`,
      `${SVG} :where(.dot.off){fill:var(--hl-lo)}`,
      `${SVG} :where(.ghost path){fill:none;stroke:var(--hl-mid)}`
    ].join("");
  }
  var done = /* @__PURE__ */ new WeakSet();
  function inject(root) {
    if (done.has(root)) return;
    done.add(root);
    const doc = root.nodeType === 9 ? root : root.ownerDocument;
    const win = doc.defaultView;
    const text = css(!!win?.CSS?.supports?.("color", "light-dark(#000,#fff)"));
    if (win && "adoptedStyleSheets" in root) {
      try {
        const sheet = new win.CSSStyleSheet();
        sheet.replaceSync(text);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        return;
      } catch {
      }
    }
    const style = doc.createElement("style");
    style.setAttribute("data-hairline-style", "");
    style.textContent = text;
    (root.nodeType === 9 ? doc.head ?? doc.documentElement : root).appendChild(style);
  }
  return __toCommonJS(kernel_exports);
})();
/* /hairline kernel */

/*
 * Shared Hairline figures for Fish Network's explanatory subpage visuals.
 * The vendored kernel is concatenated ahead of this file by the deterministic
 * builder. Figures are intentionally static after their single entrance: the
 * geometry explains the product and does not compete with the page copy.
 */

const FISH_FIGURE_MOUNTS = new WeakMap();

const figureCopy = {
  neofund: {
    label: "A Neofund operating chassis connecting mandate, governance, vehicle, capital, and operating record.",
  },
  company: {
    label: "Fish School deployments create connected operating records that develop into network context.",
  },
  participant: {
    label: "A Fish School's mandate, decision rights, and participation terms flow into human review before participation.",
  },
  provider: {
    label: "A vault strategy passes through provider review and School evaluation before any potential participation.",
  },
  school: {
    label: "A Fish School connects mandate and governance with participation, capital, ownership, reporting, providers, and operating history.",
  },
  protocol: {
    label: "Fish Protocol keeps capital, ownership, participation, and reputation distinct while connecting them through one shared record rail.",
  },
  "protocol-flow": {
    label: "Fish Schools and Fish Pools create recorded activity that contributes to Fish Points and reputation context.",
  },
};

function scene(element, kind, bounds, scale = 1.55) {
  const { Cam, facing, fit, mk, proj } = HL;
  HL.inject(element.ownerDocument);
  element.replaceChildren();
  element.setAttribute("data-hairline", `fish-${kind}`);
  element.setAttribute("data-hairline-theme", "dark");
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", element.dataset.figureLabel || figureCopy[kind]?.label || "Fish Network system diagram");

  const svg = mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, element);
  const camera = Cam(45, 0.5, scale);
  fit(camera, bounds, 200, 155);
  const project = proj(camera);
  const front = facing(camera);
  const root = mk("g", { class: "fish-site-figure__scene" }, svg);
  return { svg, root, P: project, front, mk };
}

function step(group, index, className = "fish-site-figure__module") {
  group.classList.add(className);
  group.style.setProperty("--figure-step", String(index));
  return group;
}

function box(parent, P, front, { x, y, w, d, z0 = 0, z1 = 8, radius = 4, stepIndex = 0, highlight = false, className = "" }) {
  const { rings, prism, put, solid } = HL;
  const [outer, inner] = rings(x - w / 2, y - d / 2, x + w / 2, y + d / 2, radius, 1.25);
  const body = solid(parent);
  step(body.g, stepIndex);
  if (className) body.g.classList.add(className);
  if (highlight) body.sil.classList.add("hi");
  put(body, prism(P, front, outer, inner, z0, z1));
  return { body, outer, inner, top: z1 };
}

function disc(parent, P, front, { x, y, r, z0 = 0, z1 = 8, stepIndex = 0, highlight = false, className = "" }) {
  const { circ, prism, put, solid } = HL;
  const outer = circ(r, 32).map((point) => ({ ...point, u: point.u + x, v: point.v + y }));
  const inner = circ(Math.max(1, r - 1.5), 32).map((point) => ({ ...point, u: point.u + x, v: point.v + y }));
  const body = solid(parent);
  step(body.g, stepIndex);
  if (className) body.g.classList.add(className);
  if (highlight) body.sil.classList.add("hi");
  put(body, prism(P, front, outer, inner, z0, z1));
  return { body, outer, inner, top: z1 };
}

function path(parent, points, P, className = "fish-site-figure__line", stepIndex = 0) {
  const { mk, open } = HL;
  const node = mk("path", {
    d: open(points.map(([x, y, z = 0]) => P(x, y, z))),
    class: `nf ${className}`,
  }, parent);
  step(node, stepIndex, "fish-site-figure__route");
  return node;
}

function ring(parent, footprint, P, z, className = "fish-site-figure__detail") {
  const { mk, open, ringAt } = HL;
  return mk("path", { d: open(ringAt(P, footprint, z)), class: `nf ${className}` }, parent);
}

function dot(parent, point, P, className = "dot", radius = 1.7) {
  const { mk, place } = HL;
  const node = mk("circle", { r: radius, class: className }, parent);
  place(node, P(...point));
  return node;
}

function label(parent, point, P, text, { dx = 0, dy = 0, className = "", anchor = "middle" } = {}) {
  const { mk, r2 } = HL;
  const projected = P(...point);
  const node = mk("text", {
    x: r2(projected[0] + dx),
    y: r2(projected[1] + dy),
    class: `fish-site-figure__label${className ? ` ${className}` : ""}`,
    "text-anchor": anchor,
  }, parent);
  node.textContent = text;
  return node;
}

function arrow(parent, from, via, to, P, stepIndex = 0) {
  const route = path(parent, [from, via, to], P, "fish-site-figure__connector", stepIndex);
  const end = P(...to);
  const before = P(...via);
  const angle = Math.atan2(end[1] - before[1], end[0] - before[0]);
  const length = 5;
  const left = [end[0] - Math.cos(angle - 0.55) * length, end[1] - Math.sin(angle - 0.55) * length];
  const right = [end[0] - Math.cos(angle + 0.55) * length, end[1] - Math.sin(angle + 0.55) * length];
  const { mk, open } = HL;
  const head = mk("path", { d: open([left, end, right]), class: "nf fish-site-figure__arrow" }, parent);
  step(head, stepIndex, "fish-site-figure__route");
  return route;
}

function mountNeofund(element) {
  const { root, P, front, mk } = scene(element, "neofund", [[-112, -62, -8], [112, 62, 34]], 1.46);
  const base = box(root, P, front, { x: 0, y: 0, w: 206, d: 74, z0: -8, z1: -1, radius: 9, stepIndex: 0, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");
  path(root, [[-88, 0, 1], [88, 0, 1]], P, "fish-site-figure__spine", 0);

  const modules = [
    { key: "MANDATE", x: -80, kind: "disc" },
    { key: "GOVERNANCE", x: -40, kind: "box" },
    { key: "VEHICLE", x: 0, kind: "box" },
    { key: "CAPITAL", x: 40, kind: "disc" },
    { key: "RECORD", x: 80, kind: "box" },
  ];

  modules.forEach((item, index) => {
    const group = mk("g", { "data-module": item.key.toLowerCase() }, root);
    step(group, index + 1);
    const plate = item.kind === "disc"
      ? disc(group, P, front, { x: item.x, y: 0, r: 15, z0: 1, z1: 9 + index % 2 * 2, stepIndex: index + 1, highlight: index === 2 })
      : box(group, P, front, { x: item.x, y: 0, w: 29, d: 31, z0: 1, z1: 9 + index % 2 * 2, radius: 4, stepIndex: index + 1, highlight: index === 2 });
    plate.body.g.classList.remove("fish-site-figure__module");
    ring(group, plate.inner, P, plate.top, "fish-site-figure__detail");

    if (index === 0) {
      path(group, [[item.x - 7, 0, plate.top + .2], [item.x + 7, 0, plate.top + .2]], P);
      path(group, [[item.x, -7, plate.top + .2], [item.x, 7, plate.top + .2]], P);
      dot(group, [item.x, 0, plate.top + .3], P, "dot", 2.1);
    } else if (index === 1) {
      path(group, [[item.x - 8, -6, plate.top + .2], [item.x, 0, plate.top + .2], [item.x + 8, -6, plate.top + .2]], P);
      [-8, 0, 8].forEach((offset) => dot(group, [item.x + offset, offset === 0 ? 5 : -6, plate.top + .3], P, offset === 0 ? "dot" : "dot m"));
    } else if (index === 2) {
      const { rrect } = HL;
      const inner = rrect(item.x - 8, -8, item.x + 8, 8, 2, 5);
      ring(group, inner, P, plate.top + .3, "fish-site-figure__detail hi");
    } else if (index === 3) {
      const { circ } = HL;
      const well = circ(7, 24).map((point) => ({ ...point, u: point.u + item.x }));
      ring(group, well, P, plate.top + .3);
      [[-4, 2], [2, -3], [5, 4]].forEach(([dx, dy]) => dot(group, [item.x + dx, dy, plate.top + .4], P, "dot m", 1.25));
    } else {
      path(group, [[item.x - 10, -7, plate.top + .2], [item.x + 10, -7, plate.top + .2]], P);
      [-8, -4, 0, 4, 8].forEach((offset, dotIndex) => dot(group, [item.x + offset, 5, plate.top + .3], P, dotIndex === 4 ? "dot" : "dot m", 1.15));
    }
    label(group, [item.x, 29, 0], P, item.key, { dy: 19, className: index === 2 ? "is-primary" : "" });
  });
  label(root, [0, -37, -1], P, "ONE CONNECTED OPERATING CHASSIS", { dy: -10, className: "fish-site-figure__caption-label" });
}

function mountCompany(element) {
  const { root, P, front, mk } = scene(element, "company", [[-118, -70, -8], [118, 70, 38]], 1.45);
  const base = box(root, P, front, { x: 0, y: 0, w: 210, d: 86, z0: -7, z1: -1, radius: 10, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");

  const deployment = box(root, P, front, { x: -73, y: 2, w: 42, d: 42, z0: 0, z1: 8, radius: 5, stepIndex: 1 });
  ring(root, deployment.inner, P, deployment.top);
  [[-83, -5], [-73, 2], [-63, 9]].forEach((point, index) => dot(root, [point[0], point[1], 8.5], P, index === 2 ? "dot" : "dot m"));

  const workflow = box(root, P, front, { x: -20, y: 2, w: 44, d: 46, z0: 0, z1: 12, radius: 5, stepIndex: 2, highlight: true });
  [-11, 0, 11].forEach((offset, index) => {
    path(root, [[-36, offset, 12.3], [-4, offset, 12.3]], P, index === 1 ? "fish-site-figure__detail hi" : "fish-site-figure__detail");
  });

  const records = box(root, P, front, { x: 34, y: 2, w: 44, d: 52, z0: 0, z1: 8, radius: 5, stepIndex: 3 });
  [-12, -6, 0, 6, 12].forEach((offset, index) => dot(root, [34 + offset, 2 + (index % 2 ? 5 : -5), 8.4], P, index === 4 ? "dot" : "dot m", 1.3));
  path(root, [[14, -13, 8.2], [54, -13, 8.2]], P, "fish-site-figure__detail");

  const network = disc(root, P, front, { x: 82, y: 2, r: 21, z0: 0, z1: 11, stepIndex: 4 });
  const nodes = [[82, 2], [73, -8], [92, -7], [72, 12], [94, 11]];
  nodes.slice(1).forEach((point) => path(root, [[82, 2, 11.2], [point[0], point[1], 11.2]], P, "fish-site-figure__detail", 4));
  nodes.forEach((point, index) => dot(root, [point[0], point[1], 11.4], P, index === 0 ? "dot" : "dot m", index === 0 ? 2 : 1.25));

  arrow(root, [-52, 2, 5], [-45, 2, 5], [-42, 2, 5], P, 2);
  arrow(root, [2, 2, 7], [7, 2, 7], [10, 2, 7], P, 3);
  arrow(root, [56, 2, 6], [59, 2, 6], [62, 2, 6], P, 4);
  [
    [-73, 31, "DEPLOYMENTS"],
    [-20, 31, "CONNECTED WORKFLOWS"],
    [34, 31, "OPERATING RECORDS"],
    [82, 31, "NETWORK CONTEXT"],
  ].forEach(([x, y, text], index) => label(root, [x, y, 0], P, text, { dy: 22, className: index === 1 ? "is-primary" : "" }));
  label(root, [0, -43, -1], P, "WORKFLOW GRAVITY → RECORD DENSITY → NETWORK VALUE", { dy: -10, className: "fish-site-figure__caption-label" });
}

function mountParticipant(element) {
  const { root, P, front } = scene(element, "participant", [[-112, -72, -8], [112, 72, 36]], 1.48);
  const base = box(root, P, front, { x: 0, y: 0, w: 204, d: 92, z0: -7, z1: -1, radius: 10, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");

  const inputs = [
    { x: -72, y: -20, label: "MANDATE" },
    { x: -72, y: 1, label: "DECISION RIGHTS" },
    { x: -72, y: 22, label: "PARTICIPATION TERMS" },
  ];
  inputs.forEach((item, index) => {
    const plate = box(root, P, front, { x: item.x, y: item.y, w: 41, d: 15, z0: 0, z1: 6, radius: 3, stepIndex: index + 1 });
    path(root, [[item.x - 13, item.y, 6.3], [item.x + 13, item.y, 6.3]], P, "fish-site-figure__detail", index + 1);
    label(root, [item.x, item.y, 6.4], P, item.label, { dy: -8 });
  });

  const school = box(root, P, front, { x: -5, y: 1, w: 58, d: 58, z0: 0, z1: 13, radius: 6, stepIndex: 4, highlight: true });
  ring(root, school.inner, P, school.top, "fish-site-figure__detail hi");
  const { rrect } = HL;
  ring(root, rrect(-20, -14, 10, 16, 4, 5), P, school.top + .3, "fish-site-figure__detail");
  [-12, -4, 4].forEach((offset, index) => dot(root, [18, offset, school.top + .4], P, index === 1 ? "dot" : "dot m", 1.3));
  label(root, [-5, 34, 0], P, "FISH SCHOOL DOCUMENTS", { dy: 22, className: "is-primary" });

  const gate = box(root, P, front, { x: 49, y: 1, w: 12, d: 68, z0: 0, z1: 17, radius: 2, stepIndex: 5 });
  path(root, [[49, -23, 17.3], [49, 25, 17.3]], P, "fish-site-figure__detail hi", 5);
  label(root, [49, 37, 0], P, "ELIGIBILITY + DILIGENCE", { dy: 22 });

  const review = disc(root, P, front, { x: 84, y: 1, r: 20, z0: 0, z1: 9, stepIndex: 6 });
  const { circ } = HL;
  const reviewRing = circ(10, 28).map((point) => ({ ...point, u: point.u + 84, v: point.v + 1 }));
  ring(root, reviewRing, P, review.top + .3);
  dot(root, [84, 1, review.top + .4], P, "dot", 2.2);
  label(root, [84, 31, 0], P, "HUMAN ASSESSMENT", { dy: 22 });

  inputs.forEach((item, index) => arrow(root, [-50, item.y, 4], [-43, item.y, 4], [-36, item.y * .35 + 1, 6], P, index + 2));
  arrow(root, [25, 1, 8], [37, 1, 8], [42, 1, 8], P, 5);
  arrow(root, [56, 1, 8], [61, 1, 8], [64, 1, 8], P, 6);
}

function mountProvider(element) {
  const { root, P, front } = scene(element, "provider", [[-118, -70, -8], [118, 70, 38]], 1.45);
  const base = box(root, P, front, { x: 0, y: 0, w: 214, d: 88, z0: -7, z1: -1, radius: 10, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");

  const strategy = disc(root, P, front, { x: -79, y: 0, r: 19, z0: 0, z1: 10, stepIndex: 1 });
  const { circ } = HL;
  const inner = circ(10, 24).map((point) => ({ ...point, u: point.u - 79 }));
  ring(root, inner, P, strategy.top + .3);
  dot(root, [-79, 0, strategy.top + .5], P, "dot", 2.2);

  const review = box(root, P, front, { x: -27, y: 0, w: 43, d: 58, z0: 0, z1: 12, radius: 5, stepIndex: 2, highlight: true });
  [-15, 0, 15].forEach((offset, index) => {
    path(root, [[-41, offset, 12.3], [-18, offset, 12.3]], P, "fish-site-figure__detail", 2);
    dot(root, [-13, offset, 12.5], P, index === 2 ? "dot" : "dot m", 1.3);
  });

  const school = box(root, P, front, { x: 31, y: 0, w: 45, d: 52, z0: 0, z1: 9, radius: 5, stepIndex: 3 });
  ring(root, school.inner, P, school.top);
  [-9, 0, 9].forEach((offset, index) => dot(root, [31 + offset, index === 1 ? 0 : 8, 9.4], P, index === 1 ? "dot" : "dot m", 1.3));

  const participation = box(root, P, front, { x: 82, y: 0, w: 31, d: 66, z0: 0, z1: 7, radius: 4, stepIndex: 4 });
  [-20, -10, 0, 10, 20].forEach((offset, index) => dot(root, [82, offset, 7.4], P, index === 4 ? "dot" : "dot m", 1.2));
  path(root, [[82, -23, 7.2], [82, 23, 7.2]], P, "fish-site-figure__detail", 4);

  arrow(root, [-58, 0, 6], [-53, 0, 6], [-49, 0, 6], P, 2);
  arrow(root, [-5, 0, 7], [2, 0, 7], [7, 0, 7], P, 3);
  arrow(root, [54, 0, 6], [60, 0, 6], [64, 0, 6], P, 4);
  [
    [-79, 31, "STRATEGY"],
    [-27, 31, "PROVIDER REVIEW"],
    [31, 31, "SCHOOL EVALUATION"],
    [82, 36, "POTENTIAL PARTICIPATION"],
  ].forEach(([x, y, text], index) => label(root, [x, y, 0], P, text, { dy: 22, className: index === 1 ? "is-primary" : "" }));
  label(root, [0, -43, -1], P, "EACH GATE IS DISTINCT · NO STEP GUARANTEES THE NEXT", { dy: -11, className: "fish-site-figure__caption-label" });
}

function mountSchool(element) {
  const { root, P, front } = scene(element, "school", [[-125, -88, -8], [125, 88, 42]], 1.26);
  const base = box(root, P, front, { x: 0, y: 0, w: 220, d: 132, z0: -7, z1: -1, radius: 12, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");

  const core = disc(root, P, front, { x: 0, y: 0, r: 27, z0: 0, z1: 15, stepIndex: 1, highlight: true });
  const { circ } = HL;
  const inner = circ(14, 28);
  ring(root, inner, P, core.top + .3, "fish-site-figure__detail hi");
  dot(root, [0, 0, core.top + .5], P, "dot", 2.2);
  label(root, [0, 0, core.top + .6], P, "SCHOOL", { dy: 3, className: "is-primary" });

  const satellites = [
    { x: -78, y: -35, label: "MANDATE", type: "disc" },
    { x: 0, y: -52, label: "GOVERNANCE", type: "box" },
    { x: 78, y: -35, label: "PARTICIPATION", type: "disc" },
    { x: -84, y: 34, label: "CAPITAL", type: "disc" },
    { x: -29, y: 52, label: "OWNERSHIP", type: "box" },
    { x: 31, y: 52, label: "REPORTING", type: "box" },
    { x: 84, y: 34, label: "PROVIDERS", type: "disc" },
  ];
  const satelliteLabels = [];
  satellites.forEach((item, index) => {
    const module = item.type === "disc"
      ? disc(root, P, front, { x: item.x, y: item.y, r: 14, z0: 0, z1: 7 + index % 2 * 2, stepIndex: index + 2 })
      : box(root, P, front, { x: item.x, y: item.y, w: 31, d: 25, z0: 0, z1: 7 + index % 2 * 2, radius: 4, stepIndex: index + 2 });
    ring(root, module.inner, P, module.top);
    dot(root, [item.x, item.y, module.top + .4], P, index === 1 ? "dot" : "dot m", 1.4);
    const entryX = item.x * .38;
    const entryY = item.y * .38;
    path(root, [[entryX, entryY, 7], [item.x * .72, item.y * .72, 5], [item.x, item.y, module.top * .65]], P, "fish-site-figure__connector", index + 2);
    const dy = item.y < 0 ? -11 : 19;
    satelliteLabels.push([item.x, item.y, module.top + .5, item.label, dy]);
  });

  const history = box(root, P, front, { x: 0, y: 76, w: 112, d: 13, z0: 0, z1: 5, radius: 3, stepIndex: 9 });
  [-42, -28, -14, 0, 14, 28, 42].forEach((offset, index) => dot(root, [offset, 76, 5.4], P, index === 6 ? "dot" : "dot m", 1.15));
  path(root, [[-48, 76, 5.2], [48, 76, 5.2]], P, "fish-site-figure__detail", 9);
  path(root, [[0, 27, 4], [0, 55, 4], [0, 69, 4]], P, "fish-site-figure__connector", 9);
  label(root, [0, 86, 0], P, "OPERATING HISTORY", { dy: 20, className: "fish-site-figure__caption-label" });
  satelliteLabels.forEach(([x, y, z, text, dy]) => label(root, [x, y, z], P, text, { dy }));
}

function mountProtocol(element) {
  const { root, P, front } = scene(element, "protocol", [[-122, -82, -10], [122, 82, 42]], 1.32);
  const { circ } = HL;
  const base = box(root, P, front, { x: 0, y: 0, w: 214, d: 122, z0: -8, z1: -2, radius: 11, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");
  const rail = box(root, P, front, { x: 0, y: 0, w: 38, d: 102, z0: -1, z1: 5, radius: 6, stepIndex: 1, highlight: true });
  rail.body.g.classList.add("fish-site-figure__rail");
  path(root, [[0, -44, 5.3], [0, 44, 5.3]], P, "fish-site-figure__spine hi", 1);
  [-36, -12, 12, 36].forEach((offset) => dot(root, [0, offset, 5.5], P, "dot", 1.5));

  const modules = [
    { x: -70, y: -31, label: "CAPITAL", kind: "well" },
    { x: 70, y: -31, label: "OWNERSHIP", kind: "register" },
    { x: -70, y: 31, label: "PARTICIPATION", kind: "network" },
    { x: 70, y: 31, label: "REPUTATION", kind: "signals" },
  ];
  modules.forEach((item, index) => {
    const module = item.kind === "well" || item.kind === "network"
      ? disc(root, P, front, { x: item.x, y: item.y, r: 22, z0: 0, z1: 9 + index, stepIndex: index + 2 })
      : box(root, P, front, { x: item.x, y: item.y, w: 43, d: 43, z0: 0, z1: 9 + index, radius: 5, stepIndex: index + 2 });
    ring(root, module.inner, P, module.top);
    if (item.kind === "well") {
      const well = circ(10, 24).map((point) => ({ ...point, u: point.u + item.x, v: point.v + item.y }));
      ring(root, well, P, module.top + .3);
      [[-5, 2], [3, -4], [6, 5]].forEach(([dx, dy]) => dot(root, [item.x + dx, item.y + dy, module.top + .4], P, "dot m", 1.2));
    } else if (item.kind === "register") {
      [-11, -4, 3, 10].forEach((offset, dotIndex) => dot(root, [item.x + offset, item.y, module.top + .4], P, dotIndex === 3 ? "dot" : "dot m", 1.25));
      path(root, [[item.x - 13, item.y - 8, module.top + .3], [item.x + 13, item.y - 8, module.top + .3]], P);
    } else if (item.kind === "network") {
      [[0, 0], [-9, -5], [8, -7], [-7, 9], [10, 8]].forEach(([dx, dy], dotIndex) => {
        if (dotIndex) path(root, [[item.x, item.y, module.top + .2], [item.x + dx, item.y + dy, module.top + .2]], P, "fish-site-figure__detail", index + 2);
        dot(root, [item.x + dx, item.y + dy, module.top + .4], P, dotIndex === 0 ? "dot" : "dot m", dotIndex === 0 ? 1.8 : 1.1);
      });
    } else {
      [-12, -6, 0, 6, 12].forEach((offset, dotIndex) => dot(root, [item.x + offset, item.y + offset * .35, module.top + .4], P, dotIndex === 4 ? "dot" : "dot m", 1.15));
      path(root, [[item.x - 12, item.y - 5, module.top + .2], [item.x + 12, item.y + 5, module.top + .2]], P, "fish-site-figure__detail", index + 2);
    }
    path(root, [[Math.sign(item.x) * 20, item.y, 5], [Math.sign(item.x) * 38, item.y, 5], [Math.sign(item.x) * 49, item.y, module.top * .55]], P, "fish-site-figure__connector", index + 2);
    label(root, [item.x, item.y + (item.y < 0 ? -23 : 24), 0], P, item.label, { dy: item.y < 0 ? -9 : 20 });
  });
  label(root, [0, 0, 13], P, "PROTOCOL", { dy: 4, className: "is-primary" });
}

function mountProtocolFlow(element) {
  const { root, P, front } = scene(element, "protocol-flow", [[-120, -68, -8], [120, 68, 34]], 1.45);
  const base = box(root, P, front, { x: 0, y: 0, w: 214, d: 84, z0: -7, z1: -1, radius: 10, className: "fish-site-figure__base" });
  base.body.g.classList.remove("fish-site-figure__module");
  base.body.g.classList.add("fish-site-figure__foundation");

  const school = disc(root, P, front, { x: -77, y: -10, r: 18, z0: 0, z1: 10, stepIndex: 1, highlight: true });
  ring(root, school.inner, P, school.top, "fish-site-figure__detail hi");
  dot(root, [-77, -10, 10.4], P, "dot", 2);
  const poolA = disc(root, P, front, { x: -73, y: 23, r: 11, z0: 0, z1: 6, stepIndex: 2 });
  const poolB = disc(root, P, front, { x: -45, y: 23, r: 11, z0: 0, z1: 6, stepIndex: 2 });
  ring(root, poolA.inner, P, poolA.top);
  ring(root, poolB.inner, P, poolB.top);

  const ledger = box(root, P, front, { x: -2, y: 0, w: 54, d: 58, z0: 0, z1: 9, radius: 5, stepIndex: 3 });
  [-16, -8, 0, 8, 16].forEach((offset, index) => {
    path(root, [[-19, offset, 9.2], [11, offset, 9.2]], P, "fish-site-figure__detail", 3);
    dot(root, [18, offset, 9.4], P, index === 4 ? "dot" : "dot m", 1.15);
  });

  const points = box(root, P, front, { x: 67, y: 0, w: 51, d: 58, z0: 0, z1: 12, radius: 6, stepIndex: 4, highlight: true });
  [-14, -7, 0, 7, 14].forEach((offset, index) => dot(root, [67 + offset, index % 2 ? 7 : -7, 12.4], P, index === 4 ? "dot" : "dot m", 1.25));
  path(root, [[49, -17, 12.2], [84, 17, 12.2]], P, "fish-site-figure__detail hi", 4);

  path(root, [[-77, 8, 5], [-65, 15, 4], [-58, 18, 4]], P, "fish-site-figure__connector", 2);
  arrow(root, [-34, 0, 6], [-30, 0, 6], [-28, 0, 6], P, 3);
  arrow(root, [26, 0, 7], [34, 0, 7], [39, 0, 7], P, 4);
  [
    [-77, -35, "FISH SCHOOL"],
    [-59, 37, "FISH POOLS"],
    [-2, 33, "RECORDED ACTIVITY"],
    [67, 33, "FISH POINTS"],
  ].forEach(([x, y, text], index) => label(root, [x, y, 0], P, text, { dy: index < 1 ? -8 : 21, className: index === 3 ? "is-primary" : "" }));
  label(root, [68, -31, 0], P, "REPUTATION CONTEXT", { dy: -9, className: "fish-site-figure__caption-label" });
}

const figureMounts = {
  neofund: mountNeofund,
  company: mountCompany,
  participant: mountParticipant,
  provider: mountProvider,
  school: mountSchool,
  protocol: mountProtocol,
  "protocol-flow": mountProtocolFlow,
};

function mountFishSiteFigure(element) {
  const kind = element.dataset.fishFigure;
  const mount = figureMounts[kind];
  if (!mount) return;
  FISH_FIGURE_MOUNTS.get(element)?.();
  mount(element);
  const settle = requestAnimationFrame(() => element.classList.add("is-ready"));
  const destroy = () => {
    cancelAnimationFrame(settle);
    element.replaceChildren();
    element.classList.remove("is-ready");
    element.removeAttribute("data-hairline");
    element.removeAttribute("data-hairline-theme");
    element.removeAttribute("role");
    FISH_FIGURE_MOUNTS.delete(element);
  };
  FISH_FIGURE_MOUNTS.set(element, destroy);
}

function mountFishSiteFigures(root = document) {
  root.querySelectorAll("[data-fish-figure]").forEach(mountFishSiteFigure);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountFishSiteFigures(), { once: true });
} else {
  mountFishSiteFigures();
}

export { mountFishSiteFigure, mountFishSiteFigures };

