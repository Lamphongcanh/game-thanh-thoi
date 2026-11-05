import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   FIREFLIES — Đom đóm phát sáng ban đêm
   ═══════════════════════════════════════════════════════════════ */

export function buildFireflies() {
  const group = new THREE.Group();
  group.name = 'fireflies';

  const COUNT = 40;
  const flies = [];

  // texture đốm sáng tròn mềm
  function makeGlowTexture() {
    const S = 64;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,180,1)');
    g.addColorStop(0.4, 'rgba(220,255,100,0.6)');
    g.addColorStop(1, 'rgba(180,255,50,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(cv);
  }

  const glowTex = makeGlowTexture();

  // Tạo các đom đóm dạng sprite phát sáng
  for (let i = 0; i < COUNT; i++) {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffffaa,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.15, 0.15, 1);
    group.add(sprite);

    flies.push({
      sprite,
      baseX: (Math.random() - 0.5) * 16,
      baseZ: (Math.random() - 0.5) * 16,
      baseY: 0.5 + Math.random() * 2.0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
      blinkPhase: Math.random() * Math.PI * 2,
      blinkSpeed: 1.5 + Math.random() * 2.0
    });
  }

  let groupVisible = false;

  function update(dt, elapsed, isDay) {
    // Chỉ hiện ban đêm
    const show = !isDay;
    if (show !== groupVisible) {
      groupVisible = show;
      group.visible = show;
    }

    if (!show) return;

    for (const f of flies) {
      f.phase += f.speed * dt;

      // bay lơ lửng hình tròn nhỏ + lên xuống
      f.sprite.position.x = f.baseX + Math.cos(f.phase * 0.7) * 1.5;
      f.sprite.position.z = f.baseZ + Math.sin(f.phase * 0.5) * 1.5;
      f.sprite.position.y = f.baseY + Math.sin(f.phase * 1.2) * 0.4;

      // nhấp nháy
      const blink = Math.max(0, Math.sin(f.blinkPhase + elapsed * f.blinkSpeed));
      f.sprite.material.opacity = blink * 0.9;

      // đom đóm to nhỏ theo nhịp thở
      const size = 0.12 + blink * 0.08;
      f.sprite.scale.set(size, size, 1);
    }
  }

  return { group, update };
}