window.HELP_IMPROVE_VIDEOJS = false;

function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button ? button.querySelector(".copy-text") : null;

  if (!bibtexElement || !button || !copyText) {
    return;
  }

  const onCopied = () => {
    button.classList.add("copied");
    copyText.textContent = "Copied";

    window.setTimeout(() => {
      button.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 1800);
  };

  const text = bibtexElement.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopy(text, onCopied));
  } else {
    fallbackCopy(text, onCopied);
  }
}

function fallbackCopy(text, callback) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  callback();
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setupScrollButton() {
  const scrollButton = document.querySelector(".scroll-to-top");
  if (!scrollButton) {
    return;
  }

  scrollButton.addEventListener("click", scrollToTop);

  const updateVisibility = () => {
    scrollButton.classList.toggle("visible", window.scrollY > 360);
  };

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
}

function setupBibTeXCopy() {
  const button = document.querySelector(".copy-bibtex-btn");
  if (button) {
    button.addEventListener("click", copyBibTeX);
  }
}

function setupLorenzAnimation() {
  const canvas = document.getElementById("lorenz-canvas");
  const timeReadout = document.getElementById("lorenz-time");
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.006;
  const stepsPerFrame = 1;
  const maxTrail = 1550;
  const reference = [];
  const trail = [];
  let width = 0;
  let height = 0;
  let elapsed = 0;
  let point = { x: 0.12, y: 0.2, z: 20 };
  let frameId = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function derivatives(state) {
    return {
      x: sigma * (state.y - state.x),
      y: state.x * (rho - state.z) - state.y,
      z: state.x * state.y - beta * state.z
    };
  }

  function rk4(state, stepSize) {
    const k1 = derivatives(state);
    const k2 = derivatives({
      x: state.x + k1.x * stepSize * 0.5,
      y: state.y + k1.y * stepSize * 0.5,
      z: state.z + k1.z * stepSize * 0.5
    });
    const k3 = derivatives({
      x: state.x + k2.x * stepSize * 0.5,
      y: state.y + k2.y * stepSize * 0.5,
      z: state.z + k2.z * stepSize * 0.5
    });
    const k4 = derivatives({
      x: state.x + k3.x * stepSize,
      y: state.y + k3.y * stepSize,
      z: state.z + k3.z * stepSize
    });

    return {
      x: state.x + (stepSize / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
      y: state.y + (stepSize / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
      z: state.z + (stepSize / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z)
    };
  }

  function buildReference() {
    reference.length = 0;
    let state = { x: -8.5, y: -7.5, z: 27 };
    for (let i = 0; i < 5200; i += 1) {
      state = rk4(state, dt);
      if (i > 450 && i % 2 === 0) {
        reference.push({ ...state });
      }
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(220, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function project(state) {
    const projectedX = (state.x - state.y) * 0.74;
    const projectedY = (state.x + state.y) * 0.2 - state.z * 0.62;
    const scale = Math.min(width, height) / 62;
    return {
      x: width * 0.5 + projectedX * scale,
      y: height * 0.64 + projectedY * scale
    };
  }

  function strokePath(points, style, lineWidth) {
    if (points.length < 2) {
      return;
    }

    context.beginPath();
    const first = project(points[0]);
    context.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i += 1) {
      const next = project(points[i]);
      context.lineTo(next.x, next.y);
    }
    context.strokeStyle = style;
    context.lineWidth = lineWidth;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  }

  function drawTrail() {
    if (trail.length < 2) {
      return;
    }

    for (let i = 1; i < trail.length; i += 1) {
      const progress = i / trail.length;
      const previous = project(trail[i - 1]);
      const current = project(trail[i]);
      const hue = 168 + progress * 70;
      const alpha = 0.04 + progress * 0.72;

      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(current.x, current.y);
      context.strokeStyle = `hsla(${hue}, 78%, 58%, ${alpha})`;
      context.lineWidth = 1 + progress * 2.2;
      context.stroke();
    }

    const head = project(trail[trail.length - 1]);
    const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 32);
    glow.addColorStop(0, "rgba(245, 158, 11, 0.92)");
    glow.addColorStop(0.42, "rgba(225, 29, 72, 0.42)");
    glow.addColorStop(1, "rgba(225, 29, 72, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(head.x, head.y, 32, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#fff7d6";
    context.beginPath();
    context.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
    context.fill();
  }

  function drawGrid() {
    context.save();
    context.globalAlpha = 0.5;
    context.strokeStyle = "rgba(255, 255, 255, 0.055)";
    context.lineWidth = 1;

    for (let x = -width; x < width * 2; x += 42) {
      context.beginPath();
      context.moveTo(x, height);
      context.lineTo(x + height * 0.7, 0);
      context.stroke();
    }

    for (let y = 24; y < height; y += 42) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y + width * 0.08);
      context.stroke();
    }
    context.restore();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#111113");
    background.addColorStop(0.5, "#171d1c");
    background.addColorStop(1, "#0d1117");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    drawGrid();
    strokePath(reference, "rgba(255, 255, 255, 0.075)", 1.1);
    drawTrail();
  }

  function seedTrail() {
    for (let i = 0; i < 240; i += 1) {
      point = rk4(point, dt);
      trail.push({ ...point });
    }
  }

  function tick() {
    for (let i = 0; i < stepsPerFrame; i += 1) {
      point = rk4(point, dt);
      trail.push({ ...point });
      if (trail.length > maxTrail) {
        trail.shift();
      }
      elapsed += dt;
    }

    if (timeReadout) {
      timeReadout.textContent = `t = ${elapsed.toFixed(2)}`;
    }

    draw();
    frameId = window.requestAnimationFrame(tick);
  }

  buildReference();
  seedTrail();

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  if (reduceMotion) {
    for (let i = 0; i < maxTrail; i += 1) {
      point = rk4(point, dt);
      trail.push({ ...point });
      elapsed += dt;
      if (trail.length > maxTrail) {
        trail.shift();
      }
    }
    if (timeReadout) {
      timeReadout.textContent = `t = ${elapsed.toFixed(2)}`;
    }
    draw();
    return;
  }

  frameId = window.requestAnimationFrame(tick);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    } else if (!document.hidden && !frameId) {
      frameId = window.requestAnimationFrame(tick);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupScrollButton();
  setupBibTeXCopy();
  setupLorenzAnimation();
});
