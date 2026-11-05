/* =====================================================================
 *  js/interior.js  —  Nội thất nhà chính + nhà bếp
 *  HỢP NHẤT:
 *   • GIỮ: tủ thờ, lư hương, sập gụ ×2, tủ chè, bếp củi cũ, hoành phi,
 *          cửa chính, khói nhang, chuông, crackle
 *   • THÊM: bàn dài + 6 ghế (thay trường kỷ cũ, giữ bộ trà),
 *           điều hòa, vách ngăn 2 buồng, rèm hoa hòe, 2 giường gỗ,
 *           2 cuộn chiếu tre, nội thất bếp nhà ngang
 *  Group offset (0, 0, -5) như file cũ — main.js không cần sửa tọa độ.
 * ===================================================================== */

import * as THREE from 'three';

/* ---------------------------------------------------------------------
 * 0. TIỆN ÍCH CANVAS
 * ------------------------------------------------------------------- */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d') };
}

function makeTexture(canvas, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function drawFlower(ctx, cx, cy, r, petal, leaf) {
  ctx.fillStyle = leaf;
  for (let i = 0; i < 2; i++) {
    const a = i * Math.PI + Math.PI / 4;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * 1.1, r * 0.6, r * 0.26, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.42, r * 0.3, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
}

function makeCurtainCanvas() {
  const { c, ctx } = makeCanvas(256, 256);
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, '#f4e9d3'); g.addColorStop(1, '#e5d3b3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = col * 64 + 32 + (row % 2 ? 32 : 0);
      const cy = row * 64 + 32;
      drawFlower(ctx, cx, cy, 20, '#bb2f28', '#1f6b3c');
    }
  }
  ctx.strokeStyle = '#8e2b22'; ctx.lineWidth = 7;
  ctx.strokeRect(3.5, 3.5, 249, 249);
  return c;
}

function makeMatCanvas() {
  const { c, ctx } = makeCanvas(64, 128);
  ctx.fillStyle = '#c9a86a'; ctx.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 128; i += 4) {
    ctx.fillStyle = (i / 4) % 2 === 0 ? '#b8955a' : '#dcc08a';
    ctx.fillRect(0, i, 64, 3);
  }
  ctx.strokeStyle = 'rgba(120,90,50,0.35)'; ctx.lineWidth = 1;
  for (let i = 0; i < 64; i += 8) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
  }
  return c;
}

function makeFabricCanvas(base, accent) {
  const { c, ctx } = makeCanvas(128, 128);
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = accent; ctx.lineWidth = 1.4;
  for (let i = -128; i < 128; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke();
  }
  return c;
}

function makeSoftCircleCanvas() {
  const { c, ctx } = makeCanvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0.0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.38)');
  g.addColorStop(1.0, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return c;
}

/* ---------------------------------------------------------------------
 * 1. HÀM CHÍNH
 * ------------------------------------------------------------------- */
export function buildInterior() {
  const group = new THREE.Group();
  group.name = 'Interior';
  group.position.set(0, 0, -5);   // ← GIỮ NGUYÊN offset cũ

  const interactives = [];
  const colliders = [];

  /* ============ TEXTURE & MATERIAL ============ */
  const cvCurtain = makeCurtainCanvas();
  const cvMat = makeMatCanvas();
  const cvFabric1 = makeFabricCanvas('#d9d2c4', '#9c8f78');
  const cvFabric2 = makeFabricCanvas('#cfd8d2', '#8b9b92');

  function makeWoodCanvasLocal(base) {
    const { c, ctx } = makeCanvas(256, 256);
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 110; i++) {
      const y = Math.random() * 256;
      ctx.strokeStyle = `rgba(${(base[0] * 0.5) | 0},${(base[1] * 0.45) | 0},${(base[2] * 0.45) | 0},${0.08 + Math.random() * 0.22})`;
      ctx.lineWidth = 0.5 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(64, y + (Math.random() - 0.5) * 14, 192, y + (Math.random() - 0.5) * 14, 256, y + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }
    return c;
  }

  /* --- Vật liệu CŨ --- */
  const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 });
  const woodDarkMat  = new THREE.MeshStandardMaterial({ color: 0x2e1808, roughness: 0.85 });
  const woodRedMat   = new THREE.MeshStandardMaterial({ color: 0x4a1f10, roughness: 0.75 });
  const wallMat      = new THREE.MeshStandardMaterial({ color: 0xcbb890, roughness: 0.95 });
  const goldMat      = new THREE.MeshStandardMaterial({ color: 0xd4a84a, roughness: 0.35, metalness: 0.85 });
  const bronzeMat    = new THREE.MeshStandardMaterial({ color: 0x6a5020, roughness: 0.45, metalness: 0.75 });
  const ceramicMat   = new THREE.MeshStandardMaterial({ color: 0xeae4d6, roughness: 0.4 });
  const ceramicBlue  = new THREE.MeshStandardMaterial({ color: 0xf2f0e6, roughness: 0.4 });
  const rattanMat    = new THREE.MeshStandardMaterial({ color: 0xc9ad63, roughness: 0.85 });
  const strawMat     = new THREE.MeshStandardMaterial({ color: 0xc9b378, roughness: 0.95 });
  const clayMatOld   = new THREE.MeshStandardMaterial({ color: 0x8a4a30, roughness: 0.92 });
  const ironMatOld   = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.6 });
  const stoneMatOld  = new THREE.MeshStandardMaterial({ color: 0x5a5250, roughness: 0.95 });
  const fruitMat     = new THREE.MeshStandardMaterial({ color: 0xf0d040, roughness: 0.7 });

  /* --- Vật liệu MỚI --- */
  const matWood     = new THREE.MeshStandardMaterial({ map: makeTexture(makeWoodCanvasLocal([136, 90, 54]), 1, 1), roughness: 0.78 });
  const matWoodDark = new THREE.MeshStandardMaterial({ map: makeTexture(makeWoodCanvasLocal([86, 54, 30]), 1, 1), roughness: 0.85 });
  const matCurtain  = new THREE.MeshStandardMaterial({ map: makeTexture(cvCurtain, 1, 1), side: THREE.DoubleSide, roughness: 0.95 });
  const matMat      = new THREE.MeshStandardMaterial({ map: makeTexture(cvMat, 1, 1), roughness: 0.95 });
  const matMattress = new THREE.MeshStandardMaterial({ map: makeTexture(cvFabric1, 2, 2), roughness: 0.95 });
  const matPillow   = new THREE.MeshStandardMaterial({ map: makeTexture(cvFabric2, 1, 1), roughness: 0.95 });
  const matWhite    = new THREE.MeshStandardMaterial({ color: 0xf4f6f7, roughness: 0.45, metalness: 0.05 });
  const matSteel    = new THREE.MeshStandardMaterial({ color: 0x5a5f63, roughness: 0.35, metalness: 0.8 });
  const matClay     = new THREE.MeshStandardMaterial({ color: 0xa5643c, roughness: 0.9 });
  const matBasket   = new THREE.MeshStandardMaterial({ color: 0xb58c4e, roughness: 0.95 });
  const matGarlic   = new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.85 });
  const matIron     = new THREE.MeshStandardMaterial({ color: 0x3f4448, roughness: 0.55, metalness: 0.7 });

  function addMesh(m, cast = true) {
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    return m;
  }

  /* =====================================================================
   * A. SÀN + TƯỜNG + TRẦN + ĐÈN (GIỮ NGUYÊN)
   * =================================================================== */
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 12), woodFloorMat);
  floor.position.set(0, 0.05, 0);
  floor.receiveShadow = true;
  group.add(floor);

  for (let i = -9.8; i < 10; i += 0.35) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.005, 11.8), woodDarkMat);
    plank.position.set(i, 0.105, 0);
    group.add(plank);
  }

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 4.5, 0.2), wallMat);
  backWall.position.set(0, 2.25, -6);
  backWall.receiveShadow = true;
  group.add(backWall);

  for (const sx of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 12), wallMat);
    sw.position.set(sx * 10, 2.25, 0);
    sw.receiveShadow = true;
    group.add(sw);
  }

  for (const sx of [-1, 1]) {
    const fw = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.5, 0.2), wallMat);
    fw.position.set(sx * 6.25, 2.25, 6);
    group.add(fw);
  }

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 12), woodDarkMat);
  ceiling.position.set(0, 4.45, 0);
  group.add(ceiling);

  const warmLight1 = new THREE.PointLight(0xffaa66, 0.7, 15);
  warmLight1.position.set(0, 3.5, -3);
  group.add(warmLight1);
  const warmLight2 = new THREE.PointLight(0xffaa66, 0.5, 15);
  warmLight2.position.set(0, 3.5, 3);
  group.add(warmLight2);
  group.add(new THREE.AmbientLight(0xffe6c0, 0.4));

  /* =====================================================================
   * B. CỬA CHÍNH (GIỮ NGUYÊN)
   * =================================================================== */
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0, 0, 6.05);
  const doorW = 2.5, doorH = 3.6;
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * doorW / 2, 0, 0);
    doorGroup.add(pivot);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(doorW / 2 * 0.95, doorH, 0.08), woodDarkMat);
    panel.position.set(-side * doorW / 4, doorH / 2, 0);
    panel.castShadow = true;
    pivot.add(panel);
    pivot.rotation.y = side * Math.PI * 0.55;
  }
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.2, 0.15, 0.15), woodRedMat);
  doorFrame.position.set(0, doorH + 0.07, 0);
  doorGroup.add(doorFrame);
  doorGroup.userData.action = 'exit-house';
  group.add(doorGroup);
  interactives.push(doorGroup);

  /* =====================================================================
   * C. TỦ THỜ + LƯ HƯƠNG + NẾN + MÂM NGŨ QUẢ (GIỮ NGUYÊN)
   * =================================================================== */
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -5.5);
  group.add(altarGroup);

  const altarBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.7), woodRedMat);
  altarBase.position.y = 0.25; altarBase.castShadow = true;
  altarGroup.add(altarBase);

  const altarTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.65), woodRedMat);
  altarTop.position.y = 1.0; altarTop.castShadow = true;
  altarGroup.add(altarTop);

  for (let i = -4; i <= 4; i++) {
    const carve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.05), woodDarkMat);
    carve.position.set(i * 0.22, 1.0, 0.33); altarGroup.add(carve);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), goldMat);
    knob.position.set(i * 0.22, 1.0, 0.37); altarGroup.add(knob);
  }
  const altarSurface = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.65), woodDarkMat);
  altarSurface.position.y = 1.52; altarGroup.add(altarSurface);

  /* 🔥 LƯ HƯƠNG — GIỮ NGUYÊN */
  const incenseBurner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.15, 12), bronzeMat);
  incenseBurner.position.set(0, 1.62, -0.05);
  incenseBurner.castShadow = true;
  incenseBurner.userData.action = 'incense';
  altarGroup.add(incenseBurner);
  interactives.push(incenseBurner);

  for (let i = 0; i < 3; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 4),
      new THREE.MeshStandardMaterial({ color: 0x8a2a1a }));
    stick.position.set((i - 1) * 0.05, 1.85, -0.05); altarGroup.add(stick);
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 2 }));
    ember.position.set((i - 1) * 0.05, 2.03, -0.05); altarGroup.add(ember);
  }

  for (const sx of [-1, 1]) {
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.15, 8), bronzeMat);
    holder.position.set(sx * 0.7, 1.62, -0.05); altarGroup.add(holder);
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0xd82020, emissive: 0xff2200, emissiveIntensity: 0.4 }));
    candle.position.set(sx * 0.7, 1.82, -0.05); altarGroup.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffaa22, emissive: 0xffaa00, emissiveIntensity: 3 }));
    flame.scale.y = 1.6; flame.position.set(sx * 0.7, 1.97, -0.05);
    altarGroup.add(flame);
  }

  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.03, 12), woodDarkMat);
  tray.position.set(0, 1.58, 0.15); altarGroup.add(tray);
  for (let i = 0; i < 5; i++) {
    const banana = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.08, 3, 6), fruitMat);
    const angle = (i / 5) * Math.PI * 2;
    banana.position.set(Math.cos(angle) * 0.1, 1.63 + Math.random() * 0.03, 0.15 + Math.sin(angle) * 0.1);
    banana.rotation.z = (Math.random() - 0.5) * 0.5; altarGroup.add(banana);
  }
  const pomelo = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), fruitMat);
  pomelo.position.set(0.35, 1.65, 0.12); altarGroup.add(pomelo);

  /* =====================================================================
   * D. BÀN DÀI + 6 GHẾ (THAY THẾ trường kỷ cũ 2 ghế)
   *    + Bộ trà cũ ĐẶT LÊN bàn mới
   *    Vị trí: local z = -2.3 (≈ world -7.3, đúng prompt "Z quanh -7.5")
   * =================================================================== */
  const TABLE_NEW = { w: 1.0, h: 0.75, d: 3.0, cx: 0, cz: -2.3 };

  (function buildLongTable() {
    const top = new THREE.Mesh(new THREE.BoxGeometry(TABLE_NEW.w, 0.1, TABLE_NEW.d), matWood);
    top.position.set(TABLE_NEW.cx, TABLE_NEW.h, TABLE_NEW.cz);
    top.castShadow = true; top.receiveShadow = true;
    group.add(top);
    interactives.push(top);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(TABLE_NEW.w - 0.12, 0.16, TABLE_NEW.d - 0.14), matWoodDark);
    apron.position.set(TABLE_NEW.cx, TABLE_NEW.h - 0.14, TABLE_NEW.cz);
    group.add(apron);

    for (const z of [-TABLE_NEW.d / 2 + 0.14, TABLE_NEW.d / 2 - 0.14]) {
      for (const x of [-TABLE_NEW.w / 2 + 0.1, TABLE_NEW.w / 2 - 0.1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, TABLE_NEW.h, 0.1), matWoodDark);
        leg.position.set(TABLE_NEW.cx + x, TABLE_NEW.h / 2, TABLE_NEW.cz + z);
        leg.castShadow = true;
        group.add(leg);
      }
    }
    colliders.push([
      TABLE_NEW.cx - TABLE_NEW.w / 2 - 0.1, TABLE_NEW.cx + TABLE_NEW.w / 2 + 0.1,
      TABLE_NEW.cz - TABLE_NEW.d / 2 - 0.1, TABLE_NEW.cz + TABLE_NEW.d / 2 + 0.1,
    ]);
  })();

  /* --- Bộ trà CŨ đặt lên bàn mới (mặt bàn tại y = 0.8) --- */
  const teaTray = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.025, 16), ceramicBlue);
  teaTray.position.set(TABLE_NEW.cx, 0.815, TABLE_NEW.cz);
  group.add(teaTray);

  const teaBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.22, 12, 1, true), rattanMat);
  teaBasket.position.set(TABLE_NEW.cx - 0.1, 0.915, TABLE_NEW.cz);
  teaBasket.material.side = THREE.DoubleSide;
  group.add(teaBasket);

  const teaPotSmall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), ceramicMat);
  teaPotSmall.position.set(TABLE_NEW.cx - 0.1, 0.935, TABLE_NEW.cz);
  teaPotSmall.scale.y = 1.1;
  group.add(teaPotSmall);

  for (let i = 0; i < 2; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 12), ceramicBlue);
    c.position.set(TABLE_NEW.cx + 0.08 + i * 0.1, 0.845, TABLE_NEW.cz + 0.08);
    group.add(c);
  }

  /* --- 6 GHẾ (mỗi bên 3, quay vào bàn) --- */
  function buildChair(px, pz, seatRot) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);
    g.rotation.y = seatRot;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), matWood);
    seat.position.y = 0.46;
    seat.castShadow = true; seat.receiveShadow = true;
    g.add(seat);

    for (const sx of [-0.2, 0.2]) for (const sz of [-0.19, 0.19]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), matWoodDark);
      leg.position.set(sx, 0.23, sz);
      leg.castShadow = true;
      g.add(leg);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.07), matWoodDark);
    back.position.set(0, 0.78, -0.22);
    back.castShadow = true;
    g.add(back);

    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 0.03), matWood);
      slat.position.set(0, 0.6 + i * 0.18, -0.19);
      g.add(slat);
    }
    for (const sx of [-0.25, 0.25]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.44), matWoodDark);
      arm.position.set(sx, 0.62, 0);
      g.add(arm);
    }
    group.add(g);
    colliders.push([px - 0.32, px + 0.32, pz - 0.32, pz + 0.32]);
    return g;
  }

  const CHAIR_ROWS = [-1.3, -2.3, -3.3];  // world -6.3, -7.3, -8.3
  const CHAIR_X = 1.06;
  for (const side of [-1, 1]) {
    const px = side * CHAIR_X;
    const seatRot = -side * (Math.PI / 2);
    for (const cz of CHAIR_ROWS) {
      const chair = buildChair(px, cz, seatRot);
      const ud = {
        action: 'sit-indoor',
        seatPos: new THREE.Vector3(px, 0.52, cz),
        seatRot: seatRot,
      };
      chair.traverse((o) => { if (o.isMesh) { o.userData = ud; interactives.push(o); } });
    }
  }

  /* =====================================================================
   * E. HOÀNH PHI + CÂU ĐỐI (GIỮ NGUYÊN)
   * =================================================================== */
  for (const sx of [-1, 1]) {
    const pillarX = sx * 3.5;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.2, 10), woodRedMat);
    pillar.position.set(pillarX, 2.1, -5.8); pillar.castShadow = true;
    group.add(pillar);
    const scroll = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.05), woodRedMat);
    scroll.position.set(pillarX, 2.4, -5.65); group.add(scroll);
    for (let i = 0; i < 6; i++) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.03), goldMat);
      ch.position.set(pillarX, 3.4 - i * 0.4, -5.6);
      group.add(ch);
    }
  }
  const hoanhPhi = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.55, 0.08), woodRedMat);
  hoanhPhi.position.set(0, 3.6, -5.75); hoanhPhi.castShadow = true;
  group.add(hoanhPhi);
  for (let i = 0; i < 4; i++) {
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.03), goldMat);
    ch.position.set(-1.2 + i * 0.8, 3.6, -5.7);
    group.add(ch);
  }

  /* =====================================================================
   * F. SẬP GỤ ×2 (GIỮ NGUYÊN vị trí)
   * =================================================================== */
  const leftChai = new THREE.Group();
  leftChai.position.set(-6.5, 0, -1);
  group.add(leftChai);

  const sap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.5), woodRedMat);
  sap.position.y = 0.2;
  sap.castShadow = true; sap.receiveShadow = true;
  leftChai.add(sap);

  const chieu = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 1.2), strawMat);
  chieu.position.y = 0.42; chieu.receiveShadow = true;
  leftChai.add(chieu);

  for (let i = 0; i < 2; i++) {
    const pillow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12), rattanMat);
    pillow.rotation.z = Math.PI / 2;
    pillow.position.set(-0.6 + i * 1.2, 0.55, -0.4);
    pillow.castShadow = true;
    leftChai.add(pillow);
  }

  const curtainOld = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  curtainOld.position.set(1.4, 1.6, 0);
  curtainOld.rotation.y = Math.PI / 2;
  leftChai.add(curtainOld);

  sap.userData.action = 'lie-bed';
  interactives.push(sap);

  const rightChai = new THREE.Group();
  rightChai.position.set(6.5, 0, -1);
  group.add(rightChai);
  const sap2 = sap.clone();
  sap2.position.set(0, 0, 0);
  rightChai.add(sap2);
  const chieu2 = chieu.clone();
  chieu2.position.set(0, 0.42, 0);
  rightChai.add(chieu2);

  /* =====================================================================
   * G. TỦ CHÈ + CHÉN (GIỮ NGUYÊN)
   * =================================================================== */
  const cheCabinet = new THREE.Group();
  cheCabinet.position.set(-8.5, 0, 3);
  group.add(cheCabinet);
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 1.0), woodRedMat);
  cabBody.position.y = 0.9; cabBody.castShadow = true;
  cheCabinet.add(cabBody);
  for (let i = 0; i < 2; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.9), woodDarkMat);
    shelf.position.set(0.03, 0.5 + i * 0.6, 0);
    cheCabinet.add(shelf);
    for (let j = 0; j < 3; j++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.06, 10), ceramicBlue);
      cup.position.set(0.03, 0.55 + i * 0.6, -0.25 + j * 0.22);
      cheCabinet.add(cup);
    }
  }

  /* =====================================================================
   * H. BẾP CŨ trong nhà chính (GIỮ NGUYÊN vị trí local 6, 0, 4)
   * =================================================================== */
  const kitchenOld = new THREE.Group();
  kitchenOld.position.set(6, 0, 4);
  group.add(kitchenOld);

  const stoveBaseOld = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.2), clayMatOld);
  stoveBaseOld.position.y = 0.35; stoveBaseOld.castShadow = true;
  kitchenOld.add(stoveBaseOld);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), stoneMatOld);
    stone.position.set(Math.cos(a) * 0.25, 0.85, Math.sin(a) * 0.25);
    stone.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    stone.castShadow = true;
    kitchenOld.add(stone);
  }

  const potOld = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65), ironMatOld);
  potOld.rotation.x = Math.PI; potOld.position.set(0, 1.15, 0);
  potOld.castShadow = true; kitchenOld.add(potOld);

  const potLidOld = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 14), ironMatOld);
  potLidOld.position.set(0, 1.28, 0); kitchenOld.add(potLidOld);

  const fireMatOld = new THREE.MeshStandardMaterial({ color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 0 });
  const fireOld = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), fireMatOld);
  fireOld.position.set(0, 0.75, 0);
  fireOld.userData.action = 'cook';
  kitchenOld.add(fireOld);
  interactives.push(fireOld);

  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), woodDarkMat);
    log.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    log.position.set((Math.random() - 0.5) * 0.3, 0.72, (Math.random() - 0.5) * 0.3);
    kitchenOld.add(log);
  }

  /* Khói bếp cũ */
  const steamGeoOld = new THREE.BufferGeometry();
  const STEAM_N_OLD = 40;
  const steamPosOld = new Float32Array(STEAM_N_OLD * 3);
  steamGeoOld.setAttribute('position', new THREE.BufferAttribute(steamPosOld, 3));
  const steamMatOld = new THREE.PointsMaterial({
    color: 0xcccccc, size: 0.15, transparent: true, opacity: 0.55, depthWrite: false
  });
  const steamPtsOld = new THREE.Points(steamGeoOld, steamMatOld);
  steamPtsOld.position.set(0, 1.3, 0);
  kitchenOld.add(steamPtsOld);

  const steamPartsOld = [];
  for (let i = 0; i < STEAM_N_OLD; i++) {
    steamPartsOld.push({
      x: (Math.random() - 0.5) * 0.15, y: Math.random() * 1.5, z: (Math.random() - 0.5) * 0.15,
      vy: 0.15 + Math.random() * 0.15, life: Math.random() * 2.5 + 1.5, age: Math.random() * 2
    });
  }

  /* =====================================================================
   * I. KHÓI NHANG (GIỮ NGUYÊN)
   * =================================================================== */
  let incenseSmokeActive = false;
  const incenseSmokeGeo = new THREE.BufferGeometry();
  const INCENSE_N = 30;
  const incensePos = new Float32Array(INCENSE_N * 3);
  incenseSmokeGeo.setAttribute('position', new THREE.BufferAttribute(incensePos, 3));
  const incenseSmokeMat = new THREE.PointsMaterial({
    color: 0xdddddd, size: 0.08, transparent: true, opacity: 0, depthWrite: false
  });
  const incenseSmoke = new THREE.Points(incenseSmokeGeo, incenseSmokeMat);
  incenseSmoke.position.set(0, 2.05, -5.55);
  group.add(incenseSmoke);

  const incenseParts = [];
  for (let i = 0; i < INCENSE_N; i++) {
    incenseParts.push({
      x: (Math.random() - 0.5) * 0.05, y: Math.random() * 2.5, z: (Math.random() - 0.5) * 0.05,
      vy: 0.12 + Math.random() * 0.08, life: 3 + Math.random() * 2, age: Math.random() * 3
    });
  }

  /* =====================================================================
   * J. AUDIO CŨ (chuông + crackle)
   * =================================================================== */
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playBell() {
    if (window.GAME_MUTED) return;
    const ctx = getAudio(), now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 1.5);
  }

  function playCrackle() {
    if (window.GAME_MUTED) return;
    const ctx = getAudio(), now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 1.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 1800; filt.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start(now);
  }

  function lightIncense() {
    incenseSmokeActive = true;
    playBell();
  }

  function igniteFire() {
    fireMatOld.emissiveIntensity = 2.5;
    playCrackle();
  }

  /* =====================================================================
   * K. VÁCH NGĂN 2 BUỒNG (MỚI)
   *    world z -9.9..-6.2 → local -4.9..-1.2
   * =================================================================== */
  for (const s of [-1, 1]) {
    const px = s * 1.8;
    const solidLen = 3.7;
    const part = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, solidLen), matWood);
    part.position.set(px, 1.6, (-4.9 + -1.2) / 2);
    part.castShadow = true; part.receiveShadow = true;
    group.add(part);
    colliders.push([px - 0.08, px + 0.08, -4.9, -1.2]);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 1.5), matWood);
    lintel.position.set(px, 2.8, (-1.2 + 0.3) / 2);
    group.add(lintel);
  }

  /* =====================================================================
   * L. RÈM HOA HÒE VÉN ĐƯỢC (MỚI)
   *    pivot tại local (±1.8, 2.35, 0.3)
   * =================================================================== */
  const curtains = {};
  function buildCurtain(roomId, px) {
    const cw = 1.5, ch = 2.3;
    const geo = new THREE.PlaneGeometry(cw, ch, 24, 1);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i);
      pa.setZ(i, Math.sin(x * 18) * 0.035);
    }
    geo.computeVertexNormals();

    const pivot = new THREE.Group();
    pivot.position.set(px, 2.35, 0.3);
    pivot.rotation.y = Math.PI / 2;

    const mesh = new THREE.Mesh(geo, matCurtain);
    mesh.position.set(cw / 2, -ch / 2, 0);
    mesh.castShadow = true;
    mesh.userData = { action: 'toggle-curtain', roomId, isOpen: false };
    pivot.add(mesh);
    group.add(pivot);
    interactives.push(mesh);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, cw + 0.3, 8), matWoodDark);
    rod.position.set(px, 2.38, -0.45);
    rod.rotateX(Math.PI / 2);
    group.add(rod);

    curtains[roomId] = { pivot, mesh, k: 0, target: 0, cw };
  }
  buildCurtain('left', -1.8);
  buildCurtain('right', 1.8);

  /* =====================================================================
   * M. ĐIỀU HÒA (MỚI) tại local (1.63, 2.45, -2.2)
   * =================================================================== */
  const acGroup = new THREE.Group();
  acGroup.name = 'AirConditioner';
  acGroup.position.set(1.63, 2.45, -2.2);
  group.add(acGroup);

  const acBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.92), matWhite);
  acBody.castShadow = true;
  acGroup.add(acBody);

  const acFace = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.24, 0.86),
    new THREE.MeshStandardMaterial({ color: 0xe9eef0, roughness: 0.35 })
  );
  acFace.position.set(-0.12, 0, 0);
  acGroup.add(acFace);

  const louverPivot = new THREE.Group();
  louverPivot.position.set(-0.13, 2.33, -2.2);
  group.add(louverPivot);

  const louver = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.11, 0.84), matWhite);
  louver.position.set(0, -0.055, 0);
  louverPivot.add(louver);

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x1a2b22, emissive: new THREE.Color(0x2effa0), emissiveIntensity: 0, roughness: 0.4,
  });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.045, 0.045), ledMat);
  led.position.set(-0.13, -0.09, 0.34);
  acGroup.add(led);

  const acUD = { action: 'toggle-ac' };
  acBody.userData = acUD; acFace.userData = acUD; led.userData = acUD;
  interactives.push(acBody, acFace, led);

  let acOn = false;
  let louverTarget = 0;
  let acAudioCtx = null, acGain = null, acSrc = null;

  function ensureACAudio() {
    if (acAudioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    acAudioCtx = new AC();
    const sr = acAudioCtx.sampleRate;
    const buf = acAudioCtx.createBuffer(1, sr * 2, sr);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
    acSrc = acAudioCtx.createBufferSource();
    acSrc.buffer = buf; acSrc.loop = true;
    const filter = acAudioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 820;
    acGain = acAudioCtx.createGain(); acGain.gain.value = 0;
    acSrc.connect(filter); filter.connect(acGain); acGain.connect(acAudioCtx.destination);
    acSrc.start();
  }
  function setACSound(on) {
    if (!on) {
      if (acGain && acAudioCtx) {
        acGain.gain.cancelScheduledValues(acAudioCtx.currentTime);
        acGain.gain.setTargetAtTime(0, acAudioCtx.currentTime, 0.12);
      }
      return;
    }
    if (window.GAME_MUTED) return;
    ensureACAudio();
    if (!acAudioCtx || !acGain) return;
    if (acAudioCtx.state === 'suspended') acAudioCtx.resume();
    acGain.gain.cancelScheduledValues(acAudioCtx.currentTime);
    acGain.gain.setTargetAtTime(0.085, acAudioCtx.currentTime, 0.25);
  }
  function toggleAC() {
    acOn = !acOn;
    ledMat.emissiveIntensity = acOn ? 1.6 : 0;
    louverTarget = acOn ? -1.0 : 0;
    setACSound(acOn);
    return acOn;
  }

  /* =====================================================================
   * N. 2 GIƯỜNG GỖ (MỚI)
   *    local (-4, 0, -3.5) và (4, 0, -3.5)  → world -8.5
   * =================================================================== */
  function buildBed(bx, bz, roomId) {
    const g = new THREE.Group();
    g.position.set(bx, 0, bz);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.34, 2.5), matWoodDark);
    frame.position.y = 0.28;
    frame.castShadow = true; frame.receiveShadow = true;
    g.add(frame);

    for (const sx of [-0.58, 0.58]) for (const sz of [-1.15, 1.15]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), matWood);
      leg.position.set(sx, 0.12, sz);
      g.add(leg);
    }

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 2.36), matMattress);
    mattress.position.y = 0.55; mattress.castShadow = true;
    g.add(mattress);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.85, 0.12), matWoodDark);
    headboard.position.set(0, 0.62, -1.3);
    headboard.castShadow = true;
    g.add(headboard);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.15, 0.42), matPillow);
    pillow.position.set(0, 0.72, -0.98);
    pillow.castShadow = true;
    g.add(pillow);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.1, 1.3), matPillow);
    blanket.position.set(0, 0.69, 0.5);
    g.add(blanket);

    group.add(g);
    colliders.push([bx - 0.72, bx + 0.72, bz - 1.3, bz + 1.3]);

    const ud = {
      action: 'sleep-bed', roomId,
      bedPos: new THREE.Vector3(bx, 0.62, bz + 0.15),
      headDir: new THREE.Vector3(0, 0, -1),
      bedRot: Math.PI,
    };
    g.traverse((o) => { if (o.isMesh) { o.userData = ud; interactives.push(o); } });
    return g;
  }
  buildBed(-4.0, -3.5, 'left');
  buildBed(4.0, -3.5, 'right');

  /* =====================================================================
   * O. 2 CUỘN CHIẾU TRE (MỚI)
   *    local (±1.58, 0, -1.55)
   * =================================================================== */
  function buildMatRoll(px, pz, matId) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);

    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.55, 12), matMat);
    roll.position.y = 0.79;
    roll.rotation.z = 0.09 * (matId === 1 ? 1 : -1);
    roll.castShadow = true; roll.receiveShadow = true;
    g.add(roll);

    const tie1 = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 6, 14), matWoodDark);
    tie1.rotation.x = Math.PI / 2; tie1.position.set(0.005, 0.95, 0);
    g.add(tie1);
    const tie2 = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 6, 14), matWoodDark);
    tie2.rotation.x = Math.PI / 2; tie2.position.set(-0.005, 0.55, 0);
    g.add(tie2);

    group.add(g);
    const ud = { action: 'pickup-mat', matId };
    g.traverse((o) => { if (o.isMesh) { o.userData = ud; interactives.push(o); } });
    colliders.push([px - 0.18, px + 0.18, pz - 0.18, pz + 0.18]);
  }
  buildMatRoll(-1.58, -1.55, 1);
  buildMatRoll(1.58, -1.55, 2);

  /* =====================================================================
   * P. NỘI THẤT BẾP NHÀ NGANG (MỚI)
   *    Kitchen building ở world (9.5, 0, -1.5) → group-local (9.5, 0, 3.5)
   * =================================================================== */
  const kitchenInterior = new THREE.Group();
  kitchenInterior.name = 'KitchenInterior';
  kitchenInterior.position.set(9.5, 0, 3.5);
  kitchenInterior.visible = false;
  group.add(kitchenInterior);

  /* Toạ độ LOCAL bên trong bếp, tâm (0, 0, 0) */
  const KX0 = -2.0, KX1 = 2.0, KZ0 = -1.8, KZ1 = 1.8;

  /* P1. Bếp củi mới */
  const stoveNew = new THREE.Group();
  stoveNew.position.set(1.25, 0, -1.2);
  kitchenInterior.add(stoveNew);

  const stoveBaseNew = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.92), matClay);
  stoveBaseNew.position.y = 0.42;
  stoveBaseNew.castShadow = true; stoveBaseNew.receiveShadow = true;
  stoveNew.add(stoveBaseNew);

  const stoveMouth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.4, 0.06), new THREE.MeshBasicMaterial({ color: 0x150a05 }));
  stoveMouth.position.set(0, 0.36, 0.47);
  stoveNew.add(stoveMouth);

  const fireMatNew = new THREE.MeshBasicMaterial({
    color: 0xff6a12, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const firesNew = [];
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.1 - i * 0.02, 0.28 - i * 0.04, 6), fireMatNew.clone());
    f.position.set(-0.14 + i * 0.14, 0.28, 0.44);
    stoveNew.add(f);
    firesNew.push(f);
  }

  const potBodyNew = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.34, 16), matSteel);
  potBodyNew.position.set(0, 1.03, 0.05);
  potBodyNew.castShadow = true;
  stoveNew.add(potBodyNew);

  const potLidNew = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), matSteel);
  potLidNew.position.set(0, 1.22, 0.05);
  stoveNew.add(potLidNew);

  colliders.push([10.2, 11.3, -3.2, -2.2]);

  /* P2. Hơi nước bốc lên */
  const steamTexNew = new THREE.CanvasTexture(makeSoftCircleCanvas());
  if (THREE.SRGBColorSpace) steamTexNew.colorSpace = THREE.SRGBColorSpace;

  const steamsNew = [];
  for (let i = 0; i < 12; i++) {
    const sm = new THREE.SpriteMaterial({ map: steamTexNew, color: 0xdfeef2, transparent: true, opacity: 0, depthWrite: false });
    const sp = new THREE.Sprite(sm);
    kitchenInterior.add(sp);
    steamsNew.push({ sp, life: Math.random() * 3, maxLife: 2.6 + Math.random() * 1.4, seed: Math.random() * 100 });
  }

  /* P3. Nông cụ treo vách */
  (function tools() {
    const hoeHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), matWood);
    hoeHandle.position.set(KX0 + 0.22, 1.55, KZ0 + 0.9);
    hoeHandle.rotation.z = 0.12;
    kitchenInterior.add(hoeHandle);

    const hoeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.05), matIron);
    hoeBlade.position.set(KX0 + 0.31, 2.2, KZ0 + 0.9);
    hoeBlade.rotation.z = 0.6;
    kitchenInterior.add(hoeBlade);

    const sickleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), matWoodDark);
    sickleHandle.position.set(KX0 + 0.22, 1.75, KZ0 + 1.6);
    kitchenInterior.add(sickleHandle);

    const sickleBlade = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 6, 16, Math.PI * 1.15), matIron);
    sickleBlade.position.set(KX0 + 0.22, 1.98, KZ0 + 1.6);
    sickleBlade.rotation.y = Math.PI / 2;
    kitchenInterior.add(sickleBlade);

    for (const pz of [0.9, 1.6]) {
      const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), matIron);
      nail.rotation.z = Math.PI / 2;
      nail.position.set(KX0 + 0.16, 2.3, KZ0 + pz);
      kitchenInterior.add(nail);
    }
  })();

  /* P4. Nồi niêu, rổ rá, bó tỏi */
  (function wallItems() {
    for (let i = 0; i < 2; i++) {
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), matClay);
      pot.rotation.x = Math.PI / 2;
      pot.position.set(KX0 + 0.2, 1.5 - i * 0.42, KZ0 + 2.55);
      kitchenInterior.add(pot);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 6, 14), matClay);
      rim.rotation.y = Math.PI / 2;
      rim.position.set(KX0 + 0.2, 1.5 - i * 0.42, KZ0 + 2.55);
      kitchenInterior.add(rim);
    }

    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.14, 14, 1, true), matBasket);
    basket.rotation.z = Math.PI / 2;
    basket.position.set(KX0 + 0.18, 1.05, KZ0 + 1.25);
    kitchenInterior.add(basket);

    const basket2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.12, 14, 1, true), matBasket);
    basket2.rotation.z = Math.PI / 2;
    basket2.position.set(KX0 + 0.18, 0.78, KZ0 + 1.6);
    kitchenInterior.add(basket2);

    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      g.position.set(KX0 + 0.2, 2.15, KZ0 + 2.15 + i * 0.22);
      for (let j = 0; j < 4; j++) {
        const clove = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), matGarlic);
        clove.position.set((Math.random() - 0.5) * 0.1, -j * 0.07, (Math.random() - 0.5) * 0.1);
        clove.scale.set(1, 1.5, 1);
        g.add(clove);
      }
      kitchenInterior.add(g);
    }

    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0x8a7448 }));
    rope.position.set(KX0 + 0.2, 2.45, KZ0 + 2.25);
    kitchenInterior.add(rope);
  })();

  /* =====================================================================
   * Q. API MỚI
   * =================================================================== */
  function toggleCurtain(roomId) {
    const c = curtains[roomId];
    if (!c) return false;
    c.target = c.target > 0.5 ? 0 : 1;
    c.mesh.userData.isOpen = c.target > 0.5;
    return c.mesh.userData.isOpen;
  }
  function isCurtainOpen(roomId) {
    const c = curtains[roomId];
    return !!c && c.target > 0.5;
  }
  function setKitchenInteriorVisible(v) { kitchenInterior.visible = !!v; }

  /* =====================================================================
   * R. UPDATE
   * =================================================================== */
  function update(dt, elapsed) {
    const d = Math.min(dt || 0, 0.1);
    const t = elapsed || 0;

    /* --- Điều hòa louver --- */
    louverPivot.rotation.z += (louverTarget - louverPivot.rotation.z) * Math.min(1, d * 9);

    /* --- Rèm vén --- */
    for (const id of ['left', 'right']) {
      const c = curtains[id];
      if (!c) continue;
      c.k += (c.target - c.k) * Math.min(1, d * 6.5);
      c.pivot.scale.x = 1 - 0.84 * c.k;
      c.mesh.userData.isOpen = c.target > 0.5;
    }

    /* --- Bếp cũ: lửa + khói --- */
    if (fireMatOld.emissiveIntensity > 0.5) {
      const arr = steamGeoOld.attributes.position.array;
      for (let i = 0; i < STEAM_N_OLD; i++) {
        const p = steamPartsOld[i];
        p.age += d;
        if (p.age > p.life) {
          p.x = (Math.random() - 0.5) * 0.15; p.y = 0; p.z = (Math.random() - 0.5) * 0.15; p.age = 0;
        }
        p.y += p.vy * d;
        p.x += Math.sin(t * 0.8 + i) * 0.02 * d;
        p.z += Math.cos(t * 0.6 + i) * 0.02 * d;
        arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
      }
      steamGeoOld.attributes.position.needsUpdate = true;
      fireMatOld.emissiveIntensity = 1.5 + Math.sin(t * 8) * 0.5 + Math.sin(t * 13) * 0.3;
    }

    /* --- Khói nhang --- */
    if (incenseSmokeActive) {
      incenseSmokeMat.opacity = Math.min(0.6, incenseSmokeMat.opacity + d * 0.3);
      const arr = incenseSmokeGeo.attributes.position.array;
      for (let i = 0; i < INCENSE_N; i++) {
        const p = incenseParts[i];
        p.age += d;
        if (p.age > p.life) {
          p.x = (Math.random() - 0.5) * 0.05; p.y = 0; p.z = (Math.random() - 0.5) * 0.05; p.age = 0;
        }
        p.y += p.vy * d;
        p.x += Math.sin(t * 0.5 + i) * 0.03 * d;
        arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
      }
      incenseSmokeGeo.attributes.position.needsUpdate = true;
    }

    /* --- Bếp mới trong nhà ngang --- */
    if (kitchenInterior.visible) {
      for (let i = 0; i < firesNew.length; i++) {
        const f = firesNew[i];
        const s = 0.85 + Math.sin(t * 9 + i * 1.9) * 0.18;
        f.scale.set(s, 1.1 + Math.sin(t * 7.3 + i) * 0.25, s);
        f.material.opacity = 0.62 + Math.sin(t * 11 + i * 2.1) * 0.22;
      }
      for (let i = 0; i < steamsNew.length; i++) {
        const s = steamsNew[i];
        s.life += d;
        if (s.life > s.maxLife) { s.life = 0; s.seed = Math.random() * 100; }
        const k = s.life / s.maxLife;
        const sway = Math.sin(s.life * 2 + s.seed) * 0.16;
        s.sp.position.set(1.25 + sway, 1.32 + k * 1.5, -1.15 + Math.cos(s.life * 1.7 + s.seed) * 0.16);
        const sc = 0.22 + k * 0.55;
        s.sp.scale.set(sc, sc, 1);
        s.sp.material.opacity = Math.sin(Math.min(1, k) * Math.PI) * 0.55;
      }
    }
  }

  /* =====================================================================
   * S. RETURN — Hợp nhất API cũ + mới
   * =================================================================== */
  return {
    group,
    interactives,
    update,
    // API CŨ (giữ nguyên)
    lightIncense,
    igniteFire,
    door: doorGroup,
    // API MỚI
    toggleAC,
    toggleCurtain,
    isCurtainOpen,
    setKitchenInteriorVisible,
    colliders,
    isACOn: () => acOn,
    curtains,
    kitchenInterior,
  };
}

export default buildInterior;