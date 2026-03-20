/**
 * Bubble Background - Perlin noise based particle animation
 * Ported from YYsuni/2025-blog-public reference
 */

// ========== Perlin Noise Implementation ==========
class PerlinNoise {
  private perm: number[];

  constructor() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = [...p, ...p]; // Double for overflow
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : -x;
    const v = h === 0 || h === 3 ? y : -y;
    return u + v;
  }

  noise2d(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    return this.lerp(
      this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u),
      this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u),
      v
    );
  }
}

// ========== Bubble Particle ==========
interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

// ========== Background Colors ==========
const BUBBLE_COLORS = [
  '#35bfab',  // brand teal
  '#1fc9e7',  // secondary cyan
  '#f59e0b',  // amber
  '#8b5cf6',  // violet
  '#ec4899',  // pink
  '#10b981',  // emerald
];

// ========== Main Animation ==========
export function initBubbles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const perlin = new PerlinNoise();
  let width = 0;
  let height = 0;
  let bubbles: Bubble[] = [];
  let animationId: number;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 6; // 6 FPS target for performance

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Reinitialize bubbles if needed
    if (bubbles.length === 0) {
      initParticles();
    }
  }

  function initParticles() {
    bubbles = BUBBLE_COLORS.map((color, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: Math.min(width, height) * 0.15 + Math.random() * 40,
      color,
      noiseOffsetX: i * 100,
      noiseOffsetY: i * 100 + 50,
    }));
  }

  function update(time: number) {
    const noiseScale = 0.001;
    const noiseStrength = 1.2;
    const damping = 0.96;
    const separationDist = Math.min(width, height) * 0.25;
    const separationForce = 0.3;

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];

      // Perlin noise flow field force
      const angle = perlin.noise2d(
        b.x * noiseScale + b.noiseOffsetX,
        b.y * noiseScale + b.noiseOffsetY + time * 0.0001
      ) * Math.PI * 2;
      b.vx += Math.cos(angle) * noiseStrength;
      b.vy += Math.sin(angle) * noiseStrength;

      // Separation force - keep bubbles apart
      for (let j = 0; j < bubbles.length; j++) {
        if (i === j) continue;
        const other = bubbles[j];
        const dx = b.x - other.x;
        const dy = b.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < separationDist && dist > 0) {
          const force = (separationDist - dist) / separationDist * separationForce;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }
      }

      // Coverage bias - keep bubbles spread across canvas
      const centerX = width / 2;
      const centerY = height / 2;
      const dxCenter = b.x - centerX;
      const dyCenter = b.y - centerY;
      const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
      const maxDist = Math.min(width, height) * 0.4;

      if (distCenter > maxDist) {
        const pullForce = (distCenter - maxDist) * 0.002;
        b.vx -= (dxCenter / distCenter) * pullForce;
        b.vy -= (dyCenter / distCenter) * pullForce;
      }

      // Apply velocity with damping
      b.vx *= damping;
      b.vy *= damping;
      b.x += b.vx;
      b.y += b.vy;

      // Wrap around edges with padding
      const pad = b.radius;
      if (b.x < -pad) b.x = width + pad;
      if (b.x > width + pad) b.x = -pad;
      if (b.y < -pad) b.y = height + pad;
      if (b.y > height + pad) b.y = -pad;
    }
  }

  function draw() {
    ctx!.clearRect(0, 0, width, height);

    for (const b of bubbles) {
      ctx!.beginPath();
      ctx!.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx!.fillStyle = b.color + '60'; // 38% opacity
      ctx!.fill();
    }
  }

  function animate(timestamp: number) {
    animationId = requestAnimationFrame(animate);

    const elapsed = timestamp - lastFrame;
    if (elapsed < FPS_INTERVAL) return;
    lastFrame = timestamp - (elapsed % FPS_INTERVAL);

    update(timestamp);
    draw();
  }

  // Setup
  resize();

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(document.documentElement);

  // Also handle window resize as fallback
  window.addEventListener('resize', resize);

  animationId = requestAnimationFrame(animate);

  // Cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    window.removeEventListener('resize', resize);
  };
}
