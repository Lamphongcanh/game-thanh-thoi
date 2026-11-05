import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   WALLS — Bờ tường gạch cổ Đường Lâm + Hàng rào tre đan
   ─────────────────────────────────────────────────────────────
   • Tường hậu (Bắc) + Tả (Tây) + Hữu (Đông): gạch thất đỏ cam
     xây mộc, mạch vôi trắng, ngói mũi hài trên đỉnh, rêu phong,
     cỏ dại chân tường.
   • Mặt tiền (Nam): đế đá + tre đan — nhìn xuyên qua thấy rặng
     cau của house.js phía sau.
   ═══════════════════════════════════════════════════════════════ */

export function buildWalls() {
  const group = new THREE.Group();
  group.name = 'village-walls';

  /* ── Materials dùng chung ── */
  const brickMat   = makeBrickMaterial();
  const tileMat    = makeTileMaterial();
  const stoneMat   = new THREE.MeshStandardMaterial({
    color: 0x6b625a, roughness: 0.95, flatShading: true
  });
  const bambooMat  = new THREE.MeshStandardMaterial({
    color: 0xc9ad63, roughness: 0.78, flatShading: true
  });
  const bambooDark = new THREE.MeshStandardMaterial({
    color: 0x8a7048, roughness: 0.85, flatShading: true
  });
  const weedMat    = new THREE.MeshStandardMaterial({
    color: 0x4a7a2a, roughness: 0.9, side: THREE.DoubleSide, flatShading: true
  });
  const mossMat    = new THREE.MeshStandardMaterial({
    color: 0x3a6a2a, roughness: 0.95, flatShading: true
  });

  /* ── 3 bờ tường gạch ── */
  const north = buildBrickWall(24, 2.8, 0.5, brickMat, tileMat, weedMat);
  north.position.set(1, 0, -11.5);
  group.add(north);

  const west = buildBrickWall(22, 2.5, 0.45, brickMat, tileMat, weedMat);
  west.position.set(-11, 0, -1);
  west.rotation.y = Math.PI / 2;
  group.add(west);

  const east = buildBrickWall(22, 2.5, 0.45, brickMat, tileMat, weedMat);
  east.position.set(13, 0, -1);
  east.rotation.y = Math.PI / 2;
  group.add(east);

  /* ── Hàng rào tre đan phía Nam ── */
  const south = buildBambooFence(24, stoneMat, bambooMat, bambooDark);
  south.position.set(1, 0, 8.8);
  group.add(south);

  /* ── 4 trụ góc (gạch + ngói) ── */
  for (const c of [
    { x: -11, z: -11.5 },
    { x:  13, z: -11.5 },
    { x: -11, z:   8.8 },
    { x:  13, z:   8.8 },
  ]) {
    const p = buildCornerPillar(2.8, 0.6, brickMat, tileMat);
    p.position.set(c.x, 0, c.z);
    group.add(p);
  }

  /* ── Mảng rêu phong chân tường (góc tường gạch) ── */
  const mossSpots = [
    { x: -10.7, z: -10.5 }, { x: -10.7, z: -3.0 }, { x: -10.7, z: 5.0 },
    { x:  12.7, z: -10.5 }, { x:  12.7, z: 3.0 },  { x:  12.7, z: 7.5 },
    { x: -8.0,  z: -11.2 }, { x:  3.0,  z: -11.2 }, { x: 9.0, z: -11.2 },
  ];
  for (const s of mossSpots) {
    for (let i = 0; i < 3; i++) {
      const blob = new THREE.Mesh(
        new THREE.SphereGeometry(0.20 + Math.random() * 0.15, 6, 4),
        mossMat
      );
      blob.position.set(
        s.x + (Math.random() - 0.5) * 0.8,
        0.06 + Math.random() * 0.05,
        s.z + (Math.random() - 0.5) * 0.8
      );
      blob.scale.set(1, 0.35, 1);
      blob.rotation.y = Math.random() * Math.PI;
      blob.receiveShadow = true;
      group.add(blob);
    }
  }

  return { group, interactives: [] };
}

/* ═══════════════════════════════════════════════════════════════
   TEXTURE — Gạch thất đỏ cam + mạch vôi trắng phong trần
   ═══════════════════════════════════════════════════════════════ */
function makeBrickMaterial() {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  // nền mạch vôi trắng ngà
  ctx.fillStyle = '#cec3a8';
  ctx.fillRect(0, 0, S, S);

  // gạch so le
  const rows = 9, cols = 6;
  const bh = S / rows, bw = S / cols;

  for (let r = 0; r < rows; r++) {
    const off = (r % 2) ? bw * 0.5 : 0;
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + off;
      const y = r * bh;
      const gap = 4 + Math.random() * 4;   // mạch vôi dày mỏng bất quy tắc

      // màu gạch thất: đỏ cam sẫm → nâu đất
      const hue = 8 + Math.random() * 22;
      const sat = 42 + Math.random() * 22;
      const lig = 24 + Math.random() * 20;
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lig}%)`;
      ctx.fillRect(x + gap, y + gap, bw - gap * 2, bh - gap * 2);

      // highlight nắng
      ctx.fillStyle = 'rgba(255,215,170,0.10)';
      ctx.fillRect(x + gap, y + gap, bw - gap * 2, (bh - gap * 2) * 0.3);

      // vết xước / sứt
      if (Math.random() < 0.5) {
        ctx.fillStyle = `rgba(20,8,0,${0.15 + Math.random() * 0.25})`;
        ctx.beginPath();
        ctx.arc(
          x + gap + Math.random() * (bw - gap * 2),
          y + gap + Math.random() * (bh - gap * 2),
          2 + Math.random() * 5,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // rêu phong loang lổ
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(70,100,45,${0.10 + Math.random() * 0.28})`;
    ctx.beginPath();
    ctx.arc(Math.random() * S, Math.random() * S, 4 + Math.random() * 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // vệt ố thời gian
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(70,45,20,${0.08 + Math.random() * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * S, Math.random() * S,
      12 + Math.random() * 25, 6 + Math.random() * 14,
      Math.random() * Math.PI, 0, Math.PI * 2
    );
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;

  return new THREE.MeshStandardMaterial({
    map: t, bumpMap: t, bumpScale: 0.04,
    roughness: 0.96, metalness: 0
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEXTURE — Ngói mũi hài đỏ + rêu đỉnh mái
   ═══════════════════════════════════════════════════════════════ */
function makeTileMaterial() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#5a1f10';
  ctx.fillRect(0, 0, S, S);

  const cols = 10;
  const cw = S / cols;
  for (let c = 0; c < cols; c++) {
    const x = c * cw + cw / 2;
    const g = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0);
    g.addColorStop(0.0, '#3a0f05');
    g.addColorStop(0.35, '#8a3526');
    g.addColorStop(0.55, '#a84a36');
    g.addColorStop(0.78, '#7a2818');
    g.addColorStop(1.0, '#3a0f05');
    ctx.fillStyle = g;
    ctx.fillRect(x - cw / 2, 0, cw, S);
  }

  // rêu đỉnh mái
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(70,100,40,${0.20 + Math.random() * 0.45})`;
    ctx.beginPath();
    ctx.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 11, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;

  return new THREE.MeshStandardMaterial({
    map: t, roughness: 0.86, metalness: 0.02
  });
}

/* ═══════════════════════════════════════════════════════════════
   BUILD — Tường gạch cổ xây mộc
   ═══════════════════════════════════════════════════════════════ */
function buildBrickWall(length, height, thickness, brickMat, tileMat, weedMat) {
  const g = new THREE.Group();

  // thân tường
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(length, height, thickness),
    brickMat
  );
  wall.position.y = height / 2;
  wall.castShadow = true;
  wall.receiveShadow = true;
  g.add(wall);

  // ngói mũi hài hai mái trên đỉnh
  const capW = thickness + 0.35;
  const capH = 0.22;
  const capAng = Math.atan2(capH, capW / 2);
  const slopeLen = Math.hypot(capW / 2, capH);

  for (const side of [-1, 1]) {
    const slope = new THREE.Mesh(
      new THREE.BoxGeometry(length + 0.15, 0.05, slopeLen),
      tileMat
    );
    slope.rotation.x = side * capAng;
    slope.position.set(0, height + capH / 2, side * (capW / 4));
    slope.castShadow = true;
    slope.receiveShadow = true;
    g.add(slope);
  }

  // nóc mái
  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, length + 0.2, 8),
    tileMat
  );
  ridge.rotation.z = Math.PI / 2;
  ridge.position.y = height + capH;
  ridge.castShadow = true;
  g.add(ridge);

  // cỏ dại 2 bên chân tường
  const weedCount = Math.floor(length * 0.6);
  for (const zSide of [-1, 1]) {
    for (let i = 0; i < weedCount; i++) {
      const x = -length / 2 + (i / weedCount) * length + (Math.random() - 0.5) * 0.4;
      const leaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.22 + Math.random() * 0.18),
        weedMat
      );
      leaf.position.set(
        x,
        0.13,
        zSide * (thickness / 2 + 0.05 + Math.random() * 0.08)
      );
      leaf.rotation.set(
        (Math.random() - 0.5) * 0.4,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.5
      );
      g.add(leaf);
    }
  }

  return g;
}

/* ═══════════════════════════════════════════════════════════════
   BUILD — Hàng rào tre đan trên đế đá
   ═══════════════════════════════════════════════════════════════ */
function buildBambooFence(length, stoneMat, bambooMat, bambooDark) {
  const g = new THREE.Group();

  /* đế đá liền mạch */
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.35, 0.42),
    stoneMat
  );
  base.position.y = 0.175;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  /* sỏi đá lởm chởm trên đế */
  const stoneCount = Math.floor(length / 1.0);
  for (let i = 0; i < stoneCount; i++) {
    const x = -length / 2 + 0.3 + i * (length / stoneCount);
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.08, 0),
      stoneMat
    );
    stone.position.set(x, 0.38, (Math.random() - 0.5) * 0.15);
    stone.scale.set(1, 0.7, 1);
    stone.rotation.set(
      Math.random() * 0.3,
      Math.random() * Math.PI * 2,
      Math.random() * 0.3
    );
    stone.castShadow = true;
    stone.receiveShadow = true;
    g.add(stone);
  }

  /* trụ tre mập — cứ 1.6m một cột */
  const postSpacing = 1.6;
  const postCount = Math.floor(length / postSpacing) + 1;
  for (let i = 0; i < postCount; i++) {
    const x = -length / 2 + i * (length / (postCount - 1));
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, 1.15, 6),
      bambooMat
    );
    post.position.set(x, 0.9, 0);
    post.castShadow = true;
    g.add(post);
  }

  /* 3 thanh ngang tre chẻ */
  for (const y of [0.65, 0.95, 1.25]) {
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, length, 6),
      bambooDark
    );
    rail.rotation.z = Math.PI / 2;
    rail.position.y = y;
    rail.castShadow = true;
    g.add(rail);
  }

  /* nan tre đan dọc — thưa để nhìn xuyên qua thấy cau */
  const stripSpacing = 0.28;
  const stripCount = Math.floor(length / stripSpacing);
  for (let i = 0; i < stripCount; i++) {
    const x = -length / 2 + 0.14 + i * stripSpacing;
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.62, 0.008),
      i % 2 === 0 ? bambooMat : bambooDark
    );
    strip.position.set(x, 0.95, (i % 2 === 0) ? 0.015 : -0.015);
    strip.castShadow = true;
    g.add(strip);
  }

  /* thanh nóc tre */
  const topRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, length + 0.1, 8),
    bambooMat
  );
  topRail.rotation.z = Math.PI / 2;
  topRail.position.y = 1.42;
  topRail.castShadow = true;
  g.add(topRail);

  return g;
}

/* ═══════════════════════════════════════════════════════════════
   BUILD — Trụ góc gạch + ngói
   ═══════════════════════════════════════════════════════════════ */
function buildCornerPillar(height, width, brickMat, tileMat) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, width),
    brickMat
  );
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // chóp ngói 4 mái
  const capW = width + 0.4;
  const capH = 0.28;
  const half = capW / 2;
  const ang = Math.atan2(capH, half);
  const slopeLen = Math.hypot(half, capH);

  for (let i = 0; i < 4; i++) {
    const slope = new THREE.Mesh(
      new THREE.BoxGeometry(slopeLen, 0.05, capW * 0.6),
      tileMat
    );
    slope.rotation.y = i * Math.PI / 2;
    slope.rotation.z = (i % 2 === 0 ? 1 : -1) * ang;
    slope.position.set(
      (i === 0 ? -1 : i === 2 ? 1 : 0) * half / 2,
      height + capH / 2,
      (i === 1 ? -1 : i === 3 ? 1 : 0) * half / 2
    );
    slope.castShadow = true;
    g.add(slope);
  }

  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 6),
    tileMat
  );
  tip.position.y = height + capH;
  tip.castShadow = true;
  g.add(tip);

  return g;
}