/* ============================================================
   Signature Hero — Fullscreen Aurora Shader (FE-AA3)
   Adapted for sohailqureshi1000/Portfolio — sits behind the
   existing <section class="hero" id="home"> content.
   Author: Sohail Qureshi

   Mental model:
     - u_resolution: canvas size in pixels (matches the hero
       SECTION, not the whole page, since this hero isn't fixed).
     - u_time: drives every animated thing.
     - u_mouse: cursor position relative to the hero section,
       smoothed in JS so the flow field "leans" instead of snapping.
   ============================================================ */

(function () {
  const heroSection = document.querySelector(".hero#home");
  if (!heroSection) return; // safety: don't run if markup changes

  const canvas = document.getElementById("shader-hero-canvas");
  if (!canvas) return;

  // --- Accessibility: prefers-reduced-motion --------------------------
  // If the user asked the OS for reduced motion, skip WebGL entirely.
  // The existing .hero-blob elements already stop animating under
  // reduced motion (see style.css's accessibility media query), so
  // hiding the canvas leaves a static soft-teal-glow background —
  // no separate fallback markup needed.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    canvas.hidden = true;
    return;
  }

  // --- WebGL context ----------------------------------------------------
  const gl =
    canvas.getContext("webgl", { antialias: true, alpha: true }) ||
    canvas.getContext("experimental-webgl");

  if (!gl) {
    canvas.hidden = true;
    return;
  }

  const VERTEX_SRC = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SRC = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (uv - 0.5);
      p.x *= u_resolution.x / u_resolution.y;

      vec2 mouse = (u_mouse / u_resolution.xy - 0.5);
      mouse.x *= u_resolution.x / u_resolution.y;

      float distToMouse = length(p - mouse);
      float pull = smoothstep(0.9, 0.0, distToMouse) * 0.3;
      vec2 warped = p + (mouse - p) * pull;

      float t = u_time * 0.06;
      float n1 = fbm(warped * 2.0 + vec2(t, -t * 1.3));
      float n2 = fbm(warped * 2.8 - vec2(-t * 0.7, t));
      float bands = fbm(vec2(n1 * 2.0, n2 * 2.0) + t * 0.5);

      // Palette pulled directly from style.css custom properties:
      // deep = --bg (#060607), teal = muted --accent, bright = --accent (#2DD4BF)
      vec3 deep   = vec3(0.0235, 0.0235, 0.0275);
      vec3 teal   = vec3(0.10, 0.47, 0.43);
      vec3 bright = vec3(0.1765, 0.8314, 0.7490);

      vec3 color = mix(deep, teal, smoothstep(0.15, 0.65, bands));
      color = mix(color, bright, smoothstep(0.55, 0.95, bands) * 0.55);
      color += bright * smoothstep(0.45, 0.0, distToMouse) * 0.15;

      float vignette = smoothstep(1.1, 0.3, length(p));
      color *= mix(0.5, 1.0, vignette);

      float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.03;
      color += grain;

      // Alpha fades toward the edges so it blends into the page
      // background instead of showing a hard rectangle.
      float alpha = mix(0.85, 1.0, vignette);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SRC);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    canvas.hidden = true;
    return;
  }

  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const u_resolution = gl.getUniformLocation(program, "u_resolution");
  const u_time = gl.getUniformLocation(program, "u_time");
  const u_mouse = gl.getUniformLocation(program, "u_mouse");

  // --- Responsible sizing -----------------------------------------------
  // Sized to the HERO SECTION, not the whole window — this hero scrolls
  // away with the page, it isn't a fixed fullscreen background.
  const MAX_DPR = 2;
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const rect = heroSection.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }
  resize();
  window.addEventListener("resize", resize);

  // --- Mouse tracking, relative to the hero section, smoothed -----------
  let targetMouse = [canvas.width / 2, canvas.height / 2];
  let currentMouse = [...targetMouse];

  function setMouseFromEvent(clientX, clientY) {
    const rect = heroSection.getBoundingClientRect();
    const x = (clientX - rect.left) * dpr;
    const y = (rect.height - (clientY - rect.top)) * dpr; // flip Y for gl_FragCoord
    targetMouse = [x, y];
  }

  heroSection.addEventListener(
    "mousemove",
    (e) => setMouseFromEvent(e.clientX, e.clientY),
    { passive: true }
  );
  heroSection.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        setMouseFromEvent(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  // --- Render loop, with tab-visibility pause ----------------------------
  let startTime = performance.now();
  let pausedAt = 0;
  let rafId = null;
  let isRunning = false;

  function frame(now) {
    if (!isRunning) return;

    const elapsed = (now - startTime) / 1000;

    currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.06;
    currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.06;

    gl.uniform2f(u_resolution, canvas.width, canvas.height);
    gl.uniform1f(u_time, elapsed);
    gl.uniform2f(u_mouse, currentMouse[0], currentMouse[1]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    startTime = performance.now() - pausedAt;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    isRunning = false;
    pausedAt = performance.now() - startTime;
    if (rafId) cancelAnimationFrame(rafId);
  }

  // Ships responsibly: fully stop the render loop on a hidden tab.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();