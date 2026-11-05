import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   NHÀ BA GIAN HAI CHÁI + NHÀ NGANG + TƯỜNG BAO & CỔNG
   ═══════════════════════════════════════════════════════════════ */

const C = {
  wood: 0x5a3820, woodDark: 0x2e1808, woodLight: 0x7a5030,
  lime: 0xdcc9a0, limeAlt: 0xcbb890,
  stone: 0x8a8078, stoneDark: 0x6b625a,
  thatch: 0xb8a06a, straw: 0xc0a060,
  leaf: 0x4a7a2a, leafDark: 0x3a5a1a, leafLight: 0x6a9a3a,
  orchid: 0xc060b0
};

const woodMat     = new THREE.MeshStandardMaterial({ color: C.wood, roughness: 0.78 });
const woodDarkMat = new THREE.MeshStandardMaterial({ color: C.woodDark, roughness: 0.72 });
const woodLightMat= new THREE.MeshStandardMaterial({ color: C.woodLight, roughness: 0.75 });
const wallMat     = new THREE.MeshStandardMaterial({ color: C.lime, roughness: 0.95 });
const wallAltMat  = new THREE.MeshStandardMaterial({ color: C.limeAlt, roughness: 0.95 });
const stoneMat    = new THREE.MeshStandardMaterial({ color: C.stone, roughness: 0.92 });
const stoneDarkMat= new THREE.MeshStandardMaterial({ color: C.stoneDark, roughness: 0.9 });
const thatchMat   = new THREE.MeshStandardMaterial({ color: C.thatch, roughness: 0.95 });
const strawMat    = new THREE.MeshStandardMaterial({ color: C.straw, roughness: 0.95 });
const leafMat     = new THREE.MeshStandardMaterial({ color: C.leaf, roughness: 0.85, side: THREE.DoubleSide });
const leafDarkMat = new THREE.MeshStandardMaterial({ color: C.leafDark, roughness: 0.85, side: THREE.DoubleSide });
const orchidMat   = new THREE.MeshStandardMaterial({ color: C.orchid, roughness: 0.7 });
const ironMat     = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.7 });

/* ─── Texture gạch cổ ─── */
function makeBrickMaterial() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#cec3a8'; ctx.fillRect(0, 0, S, S);
  const rows = 9, cols = 5, bh = S / rows, bw = S / cols;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) ? bw * 0.5 : 0;
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = `hsl(${10 + Math.random() * 18}, ${42 + Math.random() * 20}%, ${26 + Math.random() * 16}%)`;
      ctx.fillRect(c * bw + off + 3, r * bh + 3, bw - 6, bh - 6);
    }
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(70,100,45,${0.15 + Math.random() * 0.25})`;
    ctx.beginPath(); ctx.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.96 });
}

/* ─── Texture ngói mũi hài (đỏ tươi + rêu phong) ─── */
let _tileMat = null;
function getTileMaterial() {
  if (_tileMat) return _tileMat;

  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#5a2018';
  ctx.fillRect(0, 0, S, S);

  const rows = 8, cols = 8;
  const rh = S / rows, cw = S / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw + cw / 2;
      const y = r * rh + rh / 2;

      const g = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0);
      g.addColorStop(0, '#3a1008');
      g.addColorStop(0.35, '#8a3526');
      g.addColorStop(0.55, '#b04a36');
      g.addColorStop(0.75, '#8a3526');
      g.addColorStop(1, '#3a1008');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y - rh * 0.30, cw * 0.45, Math.PI, 0, false);
      ctx.lineTo(x + cw * 0.45, y + rh * 0.50);
      ctx.lineTo(x - cw * 0.45, y + rh * 0.50);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(90,107,58,${0.12 + Math.random() * 0.35})`;
    ctx.beginPath();
    ctx.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 11, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 6);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;

  _tileMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.88, metalness: 0.02 });
  return _tileMat;
}

/* ═══════════════════════════════════════════════════════════════
   NHÀ CHÍNH (GIỮ NGUYÊN 100% CHI TIẾT GỐC)
   ═══════════════════════════════════════════════════════════════ */
function buildMainHouse() {
  const g = new THREE.Group();
  const tileMat = getTileMaterial();

  const bayW = 3.6, chaiW = 2.4;
  const wallH = 4.0, chaiH = 3.3;
  const depth = 4.5, porchDepth = 2.0;
  const platformH = 0.65;
  const centerW = bayW * 3;

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(centerW + chaiW * 2 + 1.0, platformH, depth + porchDepth + 1.0),
    stoneMat
  );
  platform.position.y = platformH / 2;
  platform.castShadow = true; platform.receiveShadow = true;
  g.add(platform);

  const step = new THREE.Mesh(
    new THREE.BoxGeometry(bayW * 1.8, platformH * 0.55, 1.0),
    stoneMat
  );
  step.position.set(0, platformH * 0.275, (depth + porchDepth) / 2 + 0.5);
  step.castShadow = true; step.receiveShadow = true;
  g.add(step);

  const y0 = platformH;
  const wt = 0.22;

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(centerW, wallH, wt), wallMat);
  backWall.position.set(0, y0 + wallH / 2, -depth / 2 + wt / 2);
  backWall.castShadow = true; backWall.receiveShadow = true;
  g.add(backWall);

  for (const sx of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(wt, wallH, depth), wallAltMat);
    sw.position.set(sx * centerW / 2, y0 + wallH / 2, 0);
    sw.castShadow = true; sw.receiveShadow = true;
    g.add(sw);
  }

  for (let i = 0; i < 3; i++) {
    const cx = -bayW + i * bayW;

    if (i === 1) {
      const doorW = bayW * 0.85;
      const doorH = wallH * 0.88;
      const panels = 6;
      const pw = doorW / panels;

      const fTop = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.2, 0.15, 0.2), woodMat);
      fTop.position.set(cx, y0 + doorH + 0.1, depth / 2 - 0.05); g.add(fTop);

      for (const sx of [-1, 1]) {
        const fS = new THREE.Mesh(new THREE.BoxGeometry(0.12, doorH + 0.2, 0.2), woodMat);
        fS.position.set(cx + sx * (doorW / 2 + 0.06), y0 + doorH / 2, depth / 2 - 0.05); g.add(fS);
      }

      for (let p = 0; p < panels; p++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(pw * 0.92, doorH, 0.10),
          p % 2 === 0 ? woodDarkMat : woodMat
        );
        panel.position.set(cx - doorW / 2 + pw * (p + 0.5), y0 + doorH / 2, depth / 2 - 0.05);
        panel.castShadow = true; panel.receiveShadow = true;
        g.add(panel);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.88, 0.06, 0.12), woodDarkMat);
        rail.position.set(cx - doorW / 2 + pw * (p + 0.5), y0 + doorH * 0.5, depth / 2 - 0.03);
        g.add(rail);
      }
    } else {
      const wpanel = new THREE.Mesh(new THREE.BoxGeometry(bayW * 0.95, wallH, wt), wallMat);
      wpanel.position.set(cx, y0 + wallH / 2, depth / 2 - wt / 2);
      wpanel.castShadow = true; wpanel.receiveShadow = true;
      g.add(wpanel);

      const winW = bayW * 0.58, winH = wallH * 0.45;
      const winY = y0 + wallH * 0.58;

      const recess = new THREE.Mesh(
        new THREE.BoxGeometry(winW, winH, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9 })
      );
      recess.position.set(cx, winY, depth / 2 + 0.01); g.add(recess);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.15, winH + 0.15, 0.1), woodMat);
      frame.position.set(cx, winY, depth / 2 - 0.02); g.add(frame);

      for (let b = 1; b < 5; b++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, winH, 0.12), woodDarkMat);
        bar.position.set(cx - winW / 2 + (winW / 5) * b, winY, depth / 2 + 0.02);
        g.add(bar);
      }
    }
  }

  for (let i = 0; i <= 3; i++) {
    const x = -centerW / 2 + (centerW / 3) * i;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, wallH + 0.3, 16), woodMat);
    pillar.position.set(x, y0 + (wallH + 0.3) / 2, depth / 2 + porchDepth - 0.2);
    pillar.castShadow = true; g.add(pillar);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.24, 16), stoneMat);
    base.position.set(x, y0 + 0.12, depth / 2 + porchDepth - 0.2);
    base.castShadow = true; g.add(base);
  }

  const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(centerW, 0.06, porchDepth), stoneMat);
  porchFloor.position.set(0, y0 + 0.03, depth / 2 + porchDepth / 2);
  porchFloor.receiveShadow = true; g.add(porchFloor);

  const mainRoof = new THREE.Group();
  mainRoof.position.y = y0 + wallH; g.add(mainRoof);

  const roofW = centerW + 2.2;
  const roofD = (depth + porchDepth) + 1.8;
  const halfW = roofW / 2;
  const rise = 2.7;
  const slopeLen = Math.hypot(halfW, rise);
  const slopeAng = Math.atan2(rise, halfW);

  for (const side of [-1, 1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.16, roofD), tileMat);
    slope.rotation.z = -side * slopeAng;
    slope.position.set(side * halfW / 2, rise / 2, -porchDepth / 2);
    slope.castShadow = true; slope.receiveShadow = true;
    mainRoof.add(slope);
  }

  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, roofD + 0.3, 12), tileMat);
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, rise + 0.08, -porchDepth / 2);
  ridge.castShadow = true; mainRoof.add(ridge);

  for (const sz of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.10, 6, 12, Math.PI), tileMat);
    end.rotation.y = Math.PI / 2; end.rotation.z = Math.PI / 2;
    end.position.set(0, rise + 0.22, -porchDepth / 2 + sz * (roofD / 2 + 0.15));
    mainRoof.add(end);
  }

  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.9, 8), tileMat);
    tip.position.set(sx * (halfW + 0.2), 0.35, -porchDepth / 2 + sz * (roofD / 2));
    tip.rotation.z = -sx * 0.65; tip.rotation.x = sz * 0.45; tip.castShadow = true;
    mainRoof.add(tip);
  }

  for (const sx of [-1, 1]) {
    const chaiX = sx * (centerW / 2 + chaiW / 2);
    const cb = new THREE.Mesh(new THREE.BoxGeometry(chaiW, chaiH, wt), wallAltMat);
    cb.position.set(chaiX, y0 + chaiH / 2, -depth / 2 + wt / 2); cb.castShadow = true; g.add(cb);
    const cf = new THREE.Mesh(new THREE.BoxGeometry(chaiW * 0.92, chaiH, wt), wallMat);
    cf.position.set(chaiX, y0 + chaiH / 2, depth / 2 - wt / 2); cf.castShadow = true; g.add(cf);
    const co = new THREE.Mesh(new THREE.BoxGeometry(wt, chaiH, depth), wallAltMat);
    co.position.set(sx * (centerW / 2 + chaiW - wt / 2), y0 + chaiH / 2, 0); co.castShadow = true; g.add(co);

    const chaiRoof = new THREE.Group();
    chaiRoof.position.y = y0 + chaiH; g.add(chaiRoof);
    const cRW = chaiW + 1.2, cRD = depth + 1.2;
    const cHalf = cRW / 2, cRise = 1.3;
    const cLen = Math.hypot(cHalf, cRise);
    const cAng = Math.atan2(cRise, cHalf);
    for (const side of [-1, 1]) {
      const slope = new THREE.Mesh(new THREE.BoxGeometry(cLen, 0.12, cRD), tileMat);
      slope.rotation.z = -side * cAng;
      slope.position.set(chaiX + side * cHalf / 2, cRise / 2, 0);
      slope.castShadow = true; chaiRoof.add(slope);
    }
    const cRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, cRD + 0.2, 10), tileMat);
    cRidge.rotation.x = Math.PI / 2; cRidge.position.set(chaiX, cRise + 0.05, 0);
    cRidge.castShadow = true; chaiRoof.add(cRidge);
  }

  /* ── Giò phong lan treo hiên ── */
  for (const px of [-bayW * 0.7, bayW * 0.7]) {
    const og = new THREE.Group();
    og.position.set(px, y0 + wallH - 0.1, depth / 2 + porchDepth - 0.4);
    g.add(og);

    const str = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x2a2a1a, roughness: 1 }));
    str.position.y = -0.3;
    og.add(str);

    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, 0.18, 12), woodDarkMat);
    basket.position.y = -0.65;
    og.add(basket);

    for (let o = 0; o < 8; o++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.24), leafMat);
      leaf.position.set(
        (Math.random() - 0.5) * 0.3,
        -0.55 + Math.random() * 0.15,
        (Math.random() - 0.5) * 0.3);
      leaf.rotation.set(
        Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      og.add(leaf);

      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), orchidMat);
      flower.position.set(
        (Math.random() - 0.5) * 0.35,
        -0.45 + Math.random() * 0.15,
        (Math.random() - 0.5) * 0.35);
      og.add(flower);
    }
  }

  /* ── Lồng chim cu gáy ── */
  const cage = new THREE.Group();
  cage.position.set(-bayW * 1.1, y0 + wallH - 0.4, depth / 2 + porchDepth - 0.5);
  g.add(cage);

  const cStr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.4, 4), woodDarkMat);
  cStr.position.y = -0.2; cage.add(cStr);

  const cageBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.38, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x8a6030, roughness: 0.7, side: THREE.DoubleSide, wireframe: true
    }));
  cageBody.position.y = -0.55; cage.add(cageBody);

  const cTop = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 6, 16), woodDarkMat);
  cTop.rotation.x = Math.PI / 2; cTop.position.y = -0.36; cage.add(cTop);

  const cBot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.03, 16), woodDarkMat);
  cBot.position.y = -0.74; cage.add(cBot);

  const bird = new THREE.Group();
  bird.position.set(0, -0.60, 0);
  cage.add(bird);

  const birdBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.85 })
  );
  birdBody.scale.set(1.3, 1.0, 1.0);
  bird.add(birdBody);

  const birdHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.85 })
  );
  birdHead.position.set(0.05, 0.06, 0);
  bird.add(birdHead);

  const birdBeak = new THREE.Mesh(
    new THREE.ConeGeometry(0.012, 0.03, 4),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 })
  );
  birdBeak.position.set(0.09, 0.05, 0);
  birdBeak.rotation.z = -Math.PI / 2;
  bird.add(birdBeak);

  cage.userData = { birdHead, bird };

  return g;
}

/* ═══════════════════════════════════════════════════════════════
   NHÀ NGANG (GIỮ NGUYÊN CHI TIẾT GỐC + THÊM TƯỜNG ẨN/HIỆN & ỐNG KHÓI)
   ═══════════════════════════════════════════════════════════════ */
function buildKitchen() {
  const g = new THREE.Group();

  const width = 6.8, depth = 4.2;
  const wallH = 3.2, platformH = 0.45;

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.5, platformH, depth + 0.5), stoneMat);
  platform.position.y = platformH / 2;
  platform.castShadow = true; platform.receiveShadow = true;
  g.add(platform);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, wallH, 0.2), wallMat);
  backWall.position.set(0, platformH + wallH / 2, -depth / 2 + 0.1);
  backWall.castShadow = true; backWall.receiveShadow = true;
  g.add(backWall);

  for (const sx of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallH, depth), wallAltMat);
    sw.position.set(sx * width / 2, platformH + wallH / 2, 0);
    sw.castShadow = true; g.add(sw);
  }

  /* ── BỔ SUNG: Bức tường mặt trước (che khuất bên trong) ── */
  const frontWall = new THREE.Group();
  const fwMat = new THREE.MeshStandardMaterial({ color: C.lime, roughness: 0.95, side: THREE.DoubleSide });
  
  const fwLeft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, wallH, 0.2), fwMat);
  fwLeft.position.set(-width * 0.325, platformH + wallH / 2, depth / 2 - 0.1);
  fwLeft.castShadow = true; frontWall.add(fwLeft);

  const fwRight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, wallH, 0.2), fwMat);
  fwRight.position.set(width * 0.325, platformH + wallH / 2, depth / 2 - 0.1);
  fwRight.castShadow = true; frontWall.add(fwRight);

  // Cửa gỗ nhỏ ở giữa (click để vào bếp)
  const doorGroup = new THREE.Group();
  const doorW = width * 0.3, doorH = wallH * 0.85;
  for (let i = 0; i < 3; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(doorW / 3 - 0.02, doorH, 0.1), woodDarkMat);
    plank.position.set(-doorW/2 + (doorW/3)*(i+0.5), platformH + doorH/2, depth/2 - 0.1);
    doorGroup.add(plank);
  }
  doorGroup.userData.action = 'enter-kitchen';
  frontWall.add(doorGroup);

  g.add(frontWall);

  /* ── Cột mặt tiền ── */
  for (let i = 0; i <= 2; i++) {
    const x = -width / 2 + (width / 2) * i;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, wallH, 12), woodMat);
    pillar.position.set(x, platformH + wallH / 2, depth / 2 - 0.15);
    pillar.castShadow = true; g.add(pillar);
  }

  /* ── Mái tranh thấp dốc ── */
  const rW = width + 1.6, rD = depth + 1.4;
  const halfW = rW / 2, rise = 1.2;
  const len = Math.hypot(halfW, rise);
  const ang = Math.atan2(rise, halfW);

  for (const side of [-1, 1]) {
    const slope = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.14, rD), thatchMat);
    slope.rotation.z = -side * ang;
    slope.position.set(side * halfW / 2, platformH + wallH + rise / 2, 0);
    slope.castShadow = true; slope.receiveShadow = true;
    g.add(slope);
  }

  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, rD + 0.2, 8), thatchMat);
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, platformH + wallH + rise + 0.05, 0);
  g.add(ridge);

  /* ── BỔ SUNG: Ống khói gạch ── */
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.6), makeBrickMaterial());
  chimney.position.set(-width * 0.3, platformH + wallH + rise + 0.5, 0.3);
  chimney.castShadow = true; g.add(chimney);

  /* ── Bếp củi dã ngoại ── */
  const stove = new THREE.Group();
  stove.position.set(-width * 0.3, platformH, 0.3);
  g.add(stove);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.24, 0), stoneMat);
    stone.position.set(
      Math.cos(a) * 0.40,
      0.18 + Math.random() * 0.12,
      Math.sin(a) * 0.40);
    stone.rotation.set(
      Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    stone.scale.set(
      0.8 + Math.random() * 0.4,
      0.6 + Math.random() * 0.3,
      0.8 + Math.random() * 0.4);
    stone.castShadow = true;
    stove.add(stone);
  }

  const pot = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.5 }));
  pot.rotation.x = Math.PI;
  pot.position.set(0, 0.65, 0);
  pot.castShadow = true;
  stove.add(pot);

  const fire = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.8 }));
  fire.position.set(0, 0.2, 0);
  stove.add(fire);

  /* ── Đống rơm to tròn cạnh bếp ── */
  const hay = new THREE.Group();
  hay.position.set(width * 0.35, 0, depth / 2 + 1.2);
  g.add(hay);

  const hayBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.95, 1.1, 12), strawMat);
  hayBase.position.y = 0.55;
  hayBase.castShadow = true;
  hay.add(hayBase);

  const hayTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 1.3, 12), strawMat);
  hayTop.position.y = 1.75;
  hayTop.castShadow = true;
  hay.add(hayTop);

  /* ── Nông cụ treo vách ── */
  const hoeHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6), woodLightMat);
  hoeHandle.position.set(-width * 0.35, platformH + 1.6, -depth / 2 + 0.2);
  hoeHandle.rotation.z = 0.15;
  g.add(hoeHandle);

  const hoeBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.20, 0.28, 0.04), ironMat);
  hoeBlade.position.set(-width * 0.35 + 0.1, platformH + 1.0, -depth / 2 + 0.2);
  hoeBlade.rotation.z = 0.15;
  g.add(hoeBlade);

  return { group: g, frontWall, chimney, doorMesh: doorGroup };
}

/* ═══════════════════════════════════════════════════════════════
   TƯỜNG BAO & CỔNG (BỔ SUNG MỚI THEO PROMPT)
   ═══════════════════════════════════════════════════════════════ */
function buildBoundaryWalls() {
  const g = new THREE.Group();
  const brickMat = makeBrickMaterial();
  const tileMat = getTileMaterial();
  const h = 2.5, thick = 0.4;

  const addWall = (w, x, z, rotY) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), brickMat);
    wall.position.set(x, h/2, z);
    wall.rotation.y = rotY;
    wall.castShadow = true; wall.receiveShadow = true;
    g.add(wall);
    
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.15, thick + 0.4), tileMat);
    cap.position.set(x, h + 0.1, z); cap.rotation.y = rotY;
    g.add(cap);
  };

  // Tường Bắc (Z = -11)
  addWall(28, 0, -11, 0);
  // Tường Tây (X = -14)
  addWall(23, -14, 0.5, Math.PI/2);
  // Tường Đông (X = 14)
  addWall(23, 14, 0.5, Math.PI/2);
  
  // Tường Nam (Z = 12) chừa cổng chính tại X = -8
  addWall(12, -8, 12, 0); // Đoạn trái cổng
  addWall(11, 8.5, 12, 0); // Đoạn phải cổng

  return g;
}

function buildGates() {
  const g = new THREE.Group();
  const brickMat = makeBrickMaterial();
  const tileMat = getTileMaterial();

  const createGate = (x, z, isMain) => {
    const gg = new THREE.Group();
    gg.position.set(x, 0, z);
    
    const w = isMain ? 4 : 3, h = isMain ? 3.5 : 3;
    const pillarW = 0.6;

    for (const sx of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(pillarW, h, pillarW), brickMat);
      pillar.position.set(sx * (w/2 + pillarW/2), h/2, 0);
      pillar.castShadow = true; pillar.receiveShadow = true;
      gg.add(pillar);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.6, 4), tileMat);
      cap.position.set(sx * (w/2 + pillarW/2), h + 0.3, 0);
      cap.rotation.y = Math.PI/4;
      gg.add(cap);
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 0.2, 1.5), tileMat);
    roof.position.y = h + 0.1;
    gg.add(roof);

    return gg;
  };

  // Cổng chính tại (-8, 12)
  g.add(createGate(-8, 12, true));
  // Cổng phụ tại (14, 3) xoay dọc theo tường Đông
  const sideGate = createGate(14, 3, false);
  sideGate.rotation.y = Math.PI/2; 
  g.add(sideGate);

  return g;
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT CHÍNH
   ═══════════════════════════════════════════════════════════════ */
export function buildVietnameseHouse() {
  const complex = new THREE.Group();
  complex.name = 'nha-ba-gian-hai-chai';
  const colliders = [];

  // 1. Tường bao & Cổng
  const walls = buildBoundaryWalls();
  complex.add(walls);
  const gates = buildGates();
  complex.add(gates);

  // Colliders cho tường (cho A* pathfinding)
  colliders.push([-14.5, -13.5, -11.5, 12]); // Tây
  colliders.push([13.5, 14.5, -11.5, 12]);   // Đông
  colliders.push([-14, 14, -11.5, -10.5]);   // Bắc
  colliders.push([-14, -10, 11.5, 12.5]);    // Nam (Trái cổng)
  colliders.push([-6, 14, 11.5, 12.5]);      // Nam (Phải cổng)

  // 2. Nhà chính
  const mainHouse = buildMainHouse();
  mainHouse.position.set(0, 0, -7.5);
  complex.add(mainHouse);
  colliders.push([-7.8, 7.8, -11.5, -4]); // Vùng nhà chính

  // 3. Nhà ngang (Bếp)
  const kitchenData = buildKitchen();
  const kitchen = kitchenData.group;
  kitchen.position.set(9.5, 0, -1.5);
  kitchen.rotation.y = -Math.PI / 2;
  complex.add(kitchen);
  colliders.push([7.5, 11.5, -3.5, 2.5]); // Vùng nhà bếp

  // 4. Hạt khói từ ống khói
  const smokeGeo = new THREE.BufferGeometry();
  const smokeCount = 30;
  const smokePos = new Float32Array(smokeCount * 3);
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({ color: 0xcccccc, size: 0.5, transparent: true, opacity: 0.4 });
  const smokePts = new THREE.Points(smokeGeo, smokeMat);
  smokePts.position.copy(kitchenData.chimney.position);
  smokePts.position.y += 1.0;
  kitchen.add(smokePts);

  const smokeData = [];
  for(let i=0; i<smokeCount; i++) {
    smokeData.push({ y: Math.random()*3, x: (Math.random()-0.5)*0.4, z: (Math.random()-0.5)*0.4 });
  }

  // 5. Chim cu gáy (Âm thanh)
  let audioCtx = null;
  let nextCooTime = 3 + Math.random() * 4;
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function playCoo() {
    if (window.GAME_MUTED) return;
    const ctx = getAudio(); const now = ctx.currentTime;
    const notes = [{ start: 0.0, dur: 0.45, freq: 330 }, { start: 0.55, dur: 0.55, freq: 290 }];
    for (const n of notes) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filt = ctx.createBiquadFilter();
      osc.type = 'sine'; const t0 = now + n.start;
      osc.frequency.setValueAtTime(n.freq, t0);
      osc.frequency.linearRampToValueAtTime(n.freq * 0.85, t0 + n.dur * 0.6);
      osc.frequency.linearRampToValueAtTime(n.freq * 0.95, t0 + n.dur);
      filt.type = 'lowpass'; filt.frequency.value = 1200;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.05);
      gain.gain.linearRampToValueAtTime(0.14, t0 + n.dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + n.dur);
      osc.connect(filt).connect(gain).connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + n.dur + 0.05);
    }
  }

  // Update logic
  complex.userData.update = (dt, elapsed) => {
    // Chim gật đầu
    if (mainHouse && mainHouse.children) {
      const cage = mainHouse.children.find(c => c.userData && c.userData.birdHead);
      if (cage) {
        cage.userData.birdHead.position.y = 0.06 + Math.sin(elapsed * 2) * 0.005;
        cage.userData.birdHead.rotation.z = Math.sin(elapsed * 1.5) * 0.05;
      }
    }
    // Gù gù
    nextCooTime -= dt;
    if (nextCooTime <= 0) { playCoo(); nextCooTime = 8 + Math.random() * 12; }

    // Khói bụi
    const pos = smokeGeo.attributes.position.array;
    for (let i = 0; i < smokeCount; i++) {
      const p = smokeData[i];
      p.y += dt * 0.8;
      if (p.y > 4) { p.y = 0; p.x = (Math.random()-0.5)*0.4; p.z = (Math.random()-0.5)*0.4; }
      pos[i*3] = p.x; pos[i*3+1] = p.y; pos[i*3+2] = p.z;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  };

  // API Ẩn/Hiện tường
  function setKitchenWallVisible(visible) {
    kitchenData.frontWall.visible = visible;
  }

  return {
    group: complex,
    interactives: [kitchenData.doorMesh],
    colliders,
    gates: {
      main: new THREE.Vector3(-8, 0, 12),
      side: new THREE.Vector3(14, 0, 3)
    },
    update: complex.userData.update,
    setKitchenWallVisible
  };
}