(() => {
  const canvas = document.getElementById("canvas");

  if (!canvas) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const homeHero = document.querySelector(".home-template .home-hero");

  if (prefersReducedMotion || coarsePointer) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const noise = createNoise();
  const forceStep = 20;
  const nParticles = 250;

  let width = 0;
  let height = 0;
  let columns = 0;
  let rows = 0;
  let pointerIndex = 0;
  let forces = [];
  let particles = [];

  class V2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    add(vector) {
      this.x += vector.x;
      this.y += vector.y;
    }

    reset(x, y) {
      this.x = x;
      this.y = y;
    }

    lerp(vector, amount) {
      this.x += (vector.x - this.x) * amount;
      this.y += (vector.y - this.y) * amount;
    }
  }

  class Particle {
    constructor() {
      this.position = new V2(-100, -100);
      this.velocity = new V2();
      this.acceleration = new V2();
      this.alpha = 0;
      this.color = "#000000";
      this.points = [
        new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
        new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
        new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
      ];
    }

    update() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.reset(0, 0);
      this.alpha -= 0.008;
      if (this.alpha < 0) {
        this.alpha = 0;
      }
    }

    follow() {
      const x = Math.floor(this.position.x / forceStep);
      const y = Math.floor(this.position.y / forceStep);
      const index = x * rows + y;
      const force = forces[index];

      if (force) {
        this.applyForce(force);
      }
    }

    applyForce(force) {
      this.acceleration.add(force);
    }

    draw() {
      if (this.alpha <= 0) {
        return;
      }

      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.moveTo(this.position.x + this.points[0].x, this.position.y + this.points[0].y);
      ctx.lineTo(this.position.x + this.points[1].x, this.position.y + this.points[1].y);
      ctx.lineTo(this.position.x + this.points[2].x, this.position.y + this.points[2].y);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  const mouse = new V2(window.innerWidth / 2, window.innerHeight / 2);
  const emitter = new V2(window.innerWidth / 2, window.innerHeight / 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    columns = Math.ceil(width / forceStep);
    rows = Math.ceil(height / forceStep);
    canvas.width = width;
    canvas.height = height;
    initForces();
  }

  function initForces() {
    const total = columns * rows;

    for (let i = 0; i < total; i += 1) {
      if (!forces[i]) {
        forces[i] = new V2();
      }
    }

    forces.length = total;
  }

  function updateForces(time) {
    let i = 0;
    let xOff = 0;

    for (let x = 0; x < width; x += forceStep) {
      xOff += 0.1;
      let yOff = 0;

      for (let y = 0; y < height; y += forceStep) {
        yOff += 0.1;
        const angle = noise.perlin3(xOff, yOff, time * 0.00005) * Math.PI * 4;

        if (forces[i]) {
          forces[i].reset(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1);
        }

        i += 1;
      }
    }
  }

  function initParticles() {
    particles = [];

    for (let i = 0; i < nParticles; i += 1) {
      const particle = new Particle();
      particle.velocity.y = 0.1;
      particles.push(particle);
    }
  }

  function drawParticles() {
    for (let i = 0; i < nParticles; i += 1) {
      particles[i].update();
      particles[i].follow();
      particles[i].draw();
    }

    ctx.globalAlpha = 1;
  }

  function launchParticle() {
    const particle = particles[pointerIndex];

    particle.position.reset(emitter.x, emitter.y);
    particle.velocity.reset(-1 + Math.random() * 2, -1 + Math.random() * 2);
    particle.color = `hsl(${Math.floor((emitter.x / width) * 256)}, 40%, ${60 + Math.random() * 20}%)`;
    particle.alpha = 1;

    pointerIndex += 1;
    if (pointerIndex === nParticles) {
      pointerIndex = 0;
    }
  }

  function updateEmitter() {
    emitter.lerp(mouse, 0.2);
  }

  function isPointerOverHomeHero() {
    if (!homeHero) {
      return false;
    }

    const rect = homeHero.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, window.innerHeight);

    return bottom > top && mouse.y >= top && mouse.y <= bottom;
  }

  function animate(time) {
    if (isPointerOverHomeHero()) {
      ctx.clearRect(0, 0, width, height);
      window.requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    updateEmitter();
    launchParticle();
    launchParticle();
    updateForces(time);
    drawParticles();
    window.requestAnimationFrame(animate);
  }

  function pointerMove(event) {
    const point = event.touches ? event.touches[0] : event;
    mouse.x = point.clientX;
    mouse.y = point.clientY;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", pointerMove, { passive: true });
  window.addEventListener("touchmove", pointerMove, { passive: true });

  noise.seed(Math.random());
  resize();
  initParticles();
  window.requestAnimationFrame(animate);

  function createNoise() {
    const permutation = new Uint8Array(512);
    const base = new Uint8Array(256);

    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
      return a + t * (b - a);
    }

    function grad(hash, x, y, z) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;

      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    function seed(value) {
      let seedValue = Math.floor((value % 1) * 65536);

      if (seedValue < 256) {
        seedValue |= seedValue << 8;
      }

      for (let i = 0; i < 256; i += 1) {
        let v;

        if (i & 1) {
          v = i ^ (seedValue & 255);
        } else {
          v = i ^ ((seedValue >> 8) & 255);
        }

        base[i] = v;
        permutation[i] = v;
        permutation[i + 256] = v;
      }
    }

    function perlin3(x, y, z) {
      const floorX = Math.floor(x);
      const floorY = Math.floor(y);
      const floorZ = Math.floor(z);

      const X = floorX & 255;
      const Y = floorY & 255;
      const Z = floorZ & 255;

      const localX = x - floorX;
      const localY = y - floorY;
      const localZ = z - floorZ;

      const u = fade(localX);
      const v = fade(localY);
      const w = fade(localZ);

      const A = permutation[X] + Y;
      const AA = permutation[A] + Z;
      const AB = permutation[A + 1] + Z;
      const B = permutation[X + 1] + Y;
      const BA = permutation[B] + Z;
      const BB = permutation[B + 1] + Z;

      return lerp(
        lerp(
          lerp(
            grad(permutation[AA], localX, localY, localZ),
            grad(permutation[BA], localX - 1, localY, localZ),
            u
          ),
          lerp(
            grad(permutation[AB], localX, localY - 1, localZ),
            grad(permutation[BB], localX - 1, localY - 1, localZ),
            u
          ),
          v
        ),
        lerp(
          lerp(
            grad(permutation[AA + 1], localX, localY, localZ - 1),
            grad(permutation[BA + 1], localX - 1, localY, localZ - 1),
            u
          ),
          lerp(
            grad(permutation[AB + 1], localX, localY - 1, localZ - 1),
            grad(permutation[BB + 1], localX - 1, localY - 1, localZ - 1),
            u
          ),
          v
        ),
        w
      );
    }

    seed(Math.random());

    return {
      seed,
      perlin3,
    };
  }
})();
