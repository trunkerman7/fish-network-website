function createKoiAsciiField(hero) {
  const canvas = hero.querySelector("[data-fish-koi]");
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const context = canvas.getContext("2d");
  const sampler = document.createElement("canvas");
  const sampleContext = sampler.getContext("2d", { willReadFrequently: true });
  if (!context || !sampleContext) {
    hero.classList.add("fish-koi-fallback");
    return null;
  }

  const source = new Image();
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactQuery = window.matchMedia("(max-width: 40rem)");
  const colors = ["#222f58", "#353c97", "#695bff"];
  const charset = " .,:;~-+=*xX#%&@";
  const background = "#080b13";
  const frameInterval = 67;
  const sourceFrameCount = 83;
  const sourceFrameWidth = 240;
  const sourceFrameHeight = 135;
  const sourceColumns = 10;
  let columns = 0;
  let rows = 0;
  let cellWidth = 6;
  let cellHeight = 10;
  let cssWidth = 0;
  let cssHeight = 0;
  let lastPaint = -Infinity;
  let animationFrame = 0;
  let resizeFrame = 0;
  let running = false;
  let visible = true;
  let loaded = false;
  let destroyed = false;
  let sourceStart = 0;

  function luminance(data, index) {
    return (data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722) / 255;
  }

  function drawSource(now) {
    sampleContext.fillStyle = background;
    sampleContext.fillRect(0, 0, columns, rows);

    const sourceRatio = sourceFrameWidth / sourceFrameHeight;
    const targetRatio = cssWidth / cssHeight;
    const sourceFrame = reduceQuery.matches
      ? 0
      : Math.floor(Math.max(0, now - sourceStart) / frameInterval) % sourceFrameCount;
    const sourceLeft = (sourceFrame % sourceColumns) * sourceFrameWidth;
    const sourceTop = Math.floor(sourceFrame / sourceColumns) * sourceFrameHeight;
    let drawWidth;
    let drawHeight;

    if (compactQuery.matches) {
      if (targetRatio > sourceRatio) {
        drawHeight = cssHeight;
        drawWidth = drawHeight * sourceRatio;
      } else {
        drawWidth = cssWidth;
        drawHeight = drawWidth / sourceRatio;
      }
      const drawLeft = (cssWidth - drawWidth) * 0.5 / cellWidth;
      const drawTop = Math.max(0, (cssHeight - drawHeight) * 0.28) / cellHeight;
      sampleContext.drawImage(
        source,
        sourceLeft,
        sourceTop,
        sourceFrameWidth,
        sourceFrameHeight,
        drawLeft,
        drawTop,
        drawWidth / cellWidth,
        drawHeight / cellHeight,
      );
      return;
    }

    if (targetRatio > sourceRatio) {
      drawWidth = cssWidth;
      drawHeight = drawWidth / sourceRatio;
    } else {
      drawHeight = cssHeight;
      drawWidth = drawHeight * sourceRatio;
    }
    const drawLeft = (cssWidth - drawWidth) * 0.5 / cellWidth;
    const drawTop = (cssHeight - drawHeight) * 0.5 / cellHeight;
    sampleContext.drawImage(
      source,
      sourceLeft,
      sourceTop,
      sourceFrameWidth,
      sourceFrameHeight,
      drawLeft,
      drawTop,
      drawWidth / cellWidth,
      drawHeight / cellHeight,
    );
  }

  function paint(now = performance.now(), force = false) {
    if (!loaded || destroyed || !columns || !rows) return;
    if (!force && now - lastPaint < frameInterval) return;
    lastPaint = now;
    drawSource(now);

    const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
    const luma = new Float32Array(columns * rows);
    for (let index = 0; index < luma.length; index += 1) {
      luma[index] = luminance(pixels, index * 4);
    }

    context.fillStyle = background;
    context.fillRect(0, 0, cssWidth, cssHeight);
    const shift = compactQuery.matches ? 0 : Math.round(columns * 0.17);

    for (let row = 0; row < rows; row += 1) {
      const layers = [Array(columns).fill(" "), Array(columns).fill(" "), Array(columns).fill(" ")];
      const v = row / Math.max(1, rows - 1);

      for (let column = 0; column < columns; column += 1) {
        const destination = column + shift;
        if (destination >= columns) break;

        const cell = row * columns + column;
        const pixel = cell * 4;
        const red = pixels[pixel];
        const green = pixels[pixel + 1];
        const blue = pixels[pixel + 2];
        const lum = luma[cell];
        const left = luma[row * columns + Math.max(0, column - 1)];
        const right = luma[row * columns + Math.min(columns - 1, column + 1)];
        const above = luma[Math.max(0, row - 1) * columns + column];
        const below = luma[Math.min(rows - 1, row + 1) * columns + column];
        const localAverage = (left + right + above + below) * 0.25;
        const detail = Math.abs(lum - localAverage);
        const edge = Math.max(Math.abs(left - right), Math.abs(above - below));
        const chroma = (Math.max(red, green, blue) - Math.min(red, green, blue)) / 255;
        const u = column / Math.max(1, columns - 1);
        const central = ((u - 0.515) / 0.24) ** 2 + ((v - 0.41) / 0.31) ** 2 < 1;
        const orange = red > 155 && red > green * 1.12 && red > blue * 1.38;
        const white = central && Math.min(red, green, blue) > 160 && Math.max(red, green, blue) - Math.min(red, green, blue) < 95;
        const fish = orange ? 1 : white ? 0.78 : 0;
        const raw = 0.018 + 0.13 * lum + 1.18 * detail + 0.52 * edge + 0.1 * chroma + 0.64 * fish;
        const signal = Math.min(1, Math.max(0, raw)) ** 0.93;
        const glyph = charset[Math.min(charset.length - 1, Math.floor(signal * charset.length))];
        const tone = signal < 0.26 ? 0 : signal < 0.5 ? 1 : 2;
        layers[tone][destination] = glyph;
      }

      for (let tone = 0; tone < layers.length; tone += 1) {
        context.fillStyle = colors[tone];
        context.fillText(layers[tone].join(""), 0, row * cellHeight);
      }
    }

    hero.classList.add("fish-koi-ready");
  }

  function measure() {
    if (destroyed) return;
    cssWidth = canvas.clientWidth;
    cssHeight = canvas.clientHeight;
    if (!cssWidth || !cssHeight) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fontSize = compactQuery.matches ? 9 : 10;
    const mono = getComputedStyle(hero).getPropertyValue("--fonts-mono").trim() || "ui-monospace, monospace";
    context.font = `${fontSize}px ${mono}`;
    context.textBaseline = "top";
    cellWidth = Math.max(5, Math.round(context.measureText("M").width));
    cellHeight = fontSize;
    columns = Math.ceil(cssWidth / cellWidth);
    rows = Math.ceil(cssHeight / cellHeight);
    sampler.width = columns;
    sampler.height = rows;
    paint(performance.now(), true);
  }

  function loop(now) {
    if (!running) return;
    paint(now);
    animationFrame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || destroyed || !loaded || reduceQuery.matches) return;
    running = true;
    animationFrame = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function syncPlayback() {
    if (visible && !document.hidden && !reduceQuery.matches) start();
    else {
      stop();
      paint(performance.now(), true);
    }
  }

  function scheduleMeasure() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      measure();
      syncPlayback();
    });
  }

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { rootMargin: "100px" });
  const resize = new ResizeObserver(scheduleMeasure);

  source.decoding = "async";
  source.addEventListener("load", () => {
    loaded = true;
    sourceStart = performance.now();
    measure();
    syncPlayback();
  }, { once: true });
  source.addEventListener("error", () => {
    hero.classList.add("fish-koi-fallback");
  }, { once: true });
  source.src = "/media/fish-koi-frames.webp";
  visibility.observe(hero);
  resize.observe(canvas);
  document.addEventListener("visibilitychange", syncPlayback);
  reduceQuery.addEventListener("change", syncPlayback);
  compactQuery.addEventListener("change", scheduleMeasure);

  return {
    destroy() {
      destroyed = true;
      stop();
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      visibility.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reduceQuery.removeEventListener("change", syncPlayback);
      compactQuery.removeEventListener("change", scheduleMeasure);
      source.src = "";
    },
  };
}


export { createKoiAsciiField };
