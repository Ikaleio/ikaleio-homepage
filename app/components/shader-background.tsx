import { useEffect, useRef } from "react";
import { vertexShader, fragmentShader } from "~/lib/shader";

// Module-level ref for the spotlight setter (only one shader background exists)
let spotlightSetter: ((x: number, y: number) => void) | null = null;

export function useShaderSpotlight() {
  return {
    setSpotlight: (x: number, y: number) => spotlightSetter?.(x, y),
    clearSpotlight: () => spotlightSetter?.(-1, -1),
  };
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
      stencil: false,
    });
    if (!gl) return;

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    // Full-screen quad (triangle strip)
    const buffer = gl.createBuffer();
    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // Uniforms
    const u = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      time: gl.getUniformLocation(program, "u_time"),
      darkMode: gl.getUniformLocation(program, "u_darkMode"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      spotlight: gl.getUniformLocation(program, "u_spotlight"),
    };

    // State
    const startTime = performance.now();
    let frameId = 0;
    let lastFrameAt = 0;
    let isVisible = true;
    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    let scrollVal = 0;
    let spotX = -1;
    let spotY = -1;

    // Register spotlight setter
    spotlightSetter = (x: number, y: number) => {
      spotX = x;
      spotY = y;
    };

    function updateTheme() {
      gl!.uniform1f(
        u.darkMode,
        document.documentElement.classList.contains("dark") ? 1.0 : 0.0
      );
    }

    function resize() {
      const width = Math.max(1, canvas!.clientWidth);
      const height = Math.max(1, canvas!.clientHeight);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
      gl!.viewport(0, 0, width, height);
      gl!.uniform2f(u.resolution, width, height);
    }

    function draw(now: number) {
      resize();
      // Smooth cursor lerp
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      gl!.uniform2f(u.mouse, currentX, currentY);
      gl!.uniform1f(u.time, (now - startTime) / 1000);
      gl!.uniform1f(u.scroll, scrollVal);
      gl!.uniform2f(u.spotlight, spotX, spotY);
      updateTheme();
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let reduceMotion = reduceMotionQuery.matches;

    function schedule() {
      if (frameId || reduceMotion || !isVisible || document.hidden) return;
      frameId = requestAnimationFrame(tick);
    }

    function tick(now: number) {
      frameId = 0;
      const fps = coarseQuery.matches ? 24 : 40;
      if (now - lastFrameAt >= 1000 / fps) {
        draw(now);
        lastFrameAt = now;
      }
      schedule();
    }

    function onPointerMove(e: PointerEvent) {
      targetX = e.clientX / window.innerWidth;
      targetY = 1.0 - e.clientY / window.innerHeight;
    }

    function onPointerLeave() {
      targetX = 0.5;
      targetY = 0.5;
    }

    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollVal = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }

    function onVisibilityChange() {
      if (!document.hidden) draw(performance.now());
      schedule();
    }

    function onMotionChange(e: MediaQueryListEvent) {
      reduceMotion = e.matches;
      if (reduceMotion && frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      draw(performance.now());
      schedule();
    }

    // Observers
    const resizeObserver = new ResizeObserver(() => draw(performance.now()));
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
      if (!isVisible && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      if (isVisible) draw(performance.now());
      schedule();
    });
    const themeObserver = new MutationObserver(() => {
      updateTheme();
      draw(performance.now());
    });

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    reduceMotionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    updateTheme();
    draw(startTime);
    schedule();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      reduceMotionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      spotlightSetter = null;
      gl!.deleteBuffer(buffer);
      gl!.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
