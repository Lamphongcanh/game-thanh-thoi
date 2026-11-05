import * as THREE from 'three';

export function buildGate() {
  const group = new THREE.Group();
  group.name = 'gate';
  group.position.set(0, 0, 10);

  const brickMat = makeBrickMaterial();
  const tileMat = makeTileMaterial();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.85, flatShading: true });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x2e1808, roughness: 0.82, flatShading: true });
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xc9ad63, roughness: 0.78, flatShading: true });

  const gateW = 2.6, pillarW = 0.7, pillarH = 3.0;

  // 2 trụ gạch
  for (const sx of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(pillarW, pillarH, pillarW), brickMat);
    pillar.position.set(sx * (gateW / 2 + pillarW / 2), pillarH / 2, 0);
    pillar.castShadow = true; pillar.receiveShadow = true;
    group.add(pillar);
  }

  // Mái ngói úp lên
  const roofGroup = new THREE.Group();
  roofGroup.position.y = pillarH;
  group.add(roofGroup);

  const roofW = gateW + pillarW * 2 + 1.2, roofD = 1.6, rise = 0.55;
  const halfW = roofW / 2;
  const slopeLen = Math.hypot(halfW, rise);
  const slopeAng = Math.atan2(rise, halfW);
  for (const side of [-1, 1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.1, roofD), tileMat);
    slope.rotation.z = -side * slopeAng;
    slope.position.set(side * halfW / 2, rise / 2, 0);
    slope.castShadow = true; slope.receiveShadow = true;
    roofGroup.add(slope);
  }
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, roofD + 0.15, 8), tileMat);
  ridge.rotation.x = Math.PI / 2; ridge.position.y = rise; ridge.castShadow = true;
  roofGroup.add(ridge);

  // 2 cánh cổng gỗ mở vào trong
  for (const side of [-1, 1]) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(side * (gateW / 2 - 0.05), 0, 0.15);
    doorGroup.rotation.y = side * -0.55;
    group.add(doorGroup);
    const doorW = gateW / 2 - 0.05, doorH = pillarH - 0.5;
    for (let i = 0; i < 5; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(doorW / 5 - 0.02, doorH, 0.06),
        i % 2 === 0 ? woodMat : woodDarkMat
      );
      plank.position.set(-side * (doorW / 2 - doorW / 10 * (i + 0.5)), doorH / 2, 0);
      plank.castShadow = true; doorGroup.add(plank);
    }
    for (const y of [0.5, doorH * 0.5, doorH - 0.15]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.08, 0.09), woodDarkMat);
      rail.position.set(-side * doorW / 2, y, 0.03);
      rail.castShadow = true; doorGroup.add(rail);
    }
  }

  // Biển tre lệch phải
  const signGroup = new THREE.Group();
  signGroup.position.set(gateW / 2 + pillarW + 0.15, pillarH - 0.9, 0.5);
  signGroup.rotation.y = -0.15; signGroup.rotation.z = 0.05;
  group.add(signGroup);
  for (const wx of [-0.25, 0.25]) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4), woodDarkMat);
    wire.position.set(wx, 0.2, 0); signGroup.add(wire);
  }
  const signW = 0.65, signH = 0.5;
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(signW, signH, 0.05), bambooMat);
  signBoard.castShadow = true; signGroup.add(signBoard);
  const signFace = new THREE.Mesh(
    new THREE.PlaneGeometry(signW * 0.9, signH * 0.85),
    new THREE.MeshBasicMaterial({ map: makeSignTexture(), transparent: true })
  );
  signFace.position.z = 0.03; signGroup.add(signFace);

  // Khóm trúc + dâm bụt
  const bambooCluster = makeBambooCluster();
  bambooCluster.position.set(-gateW / 2 - pillarW - 0.4, 0, 0.8);
  group.add(bambooCluster);

  const hibiscus = makeHibiscus();
  hibiscus.position.set(gateW / 2 + pillarW + 0.8, 0, 0.7);
  hibiscus.rotation.y = -0.3;
  group.add(hibiscus);

  return { group, interactives: [] };
}

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

function makeTileMaterial() {
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#5a1f10'; ctx.fillRect(0, 0, S, S);
  const cols = 10, cw = S / cols;
  for (let c = 0; c < cols; c++) {
    const x = c * cw + cw / 2;
    const g = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0);
    g.addColorStop(0, '#3a0f05'); g.addColorStop(0.5, '#a84a36'); g.addColorStop(1, '#3a0f05');
    ctx.fillStyle = g; ctx.fillRect(x - cw / 2, 0, cw, S);
  }
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(70,100,40,${0.2 + Math.random() * 0.4})`;
    ctx.beginPath(); ctx.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.86 });
}

function makeSignTexture() {
  const W = 512, H = 400, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#c9ad63'; ctx.fillRect(0, 0, W, H);
  for (let y = 10; y < H; y += 14) {
    ctx.strokeStyle = `rgba(140,110,55,${0.3 + Math.random() * 0.3})`;
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.03 + y * 0.05) * 2.5);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(50,30,15,0.7)'; ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.fillStyle = 'rgba(50,30,15,0.95)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 68px Georgia, serif'; ctx.fillText('HIÊN', W/2, H * 0.32);
  ctx.font = 'bold 62px Georgia, serif'; ctx.fillText('NHÀ CŨ', W/2, H * 0.65);
  ctx.fillStyle = 'rgba(180,30,20,0.75)';
  ctx.beginPath(); ctx.arc(W - 70, H - 70, 25, 0, Math.PI * 2); ctx.fill();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBambooCluster() {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7a9a3a, roughness: 0.75, flatShading: true });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a2a, side: THREE.DoubleSide, roughness: 0.85 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, dist = 0.15 + Math.random() * 0.2;
    const x = Math.cos(a) * dist, z = Math.sin(a) * dist;
    const h = 2.5 + Math.random() * 1.2;
    const segments = Math.floor(h / 0.35);
    for (let s = 0; s < segments; s++) {
      const y = 0.175 + s * 0.35, r = 0.05 - s * 0.003;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.1, 0.33, 6), trunkMat);
      seg.position.set(x + Math.sin(s * 0.5) * 0.05, y, z + Math.cos(s * 0.5) * 0.05);
      seg.castShadow = true; g.add(seg);
    }
    for (let l = 0; l < 6; l++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.4), leafMat);
      leaf.position.set(x + (Math.random() - 0.5) * 0.4, h - 0.1 + Math.random() * 0.3, z + (Math.random() - 0.5) * 0.4);
      leaf.rotation.set((Math.random() - 0.5) * 0.8, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5);
      leaf.castShadow = true; g.add(leaf);
    }
  }
  return g;
}

function makeHibiscus() {
  const g = new THREE.Group();
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a6a1a, side: THREE.DoubleSide, roughness: 0.85 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xd83030, roughness: 0.6, emissive: 0x330000 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0x442200 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a3a1a, roughness: 0.9 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.6, 6), stemMat);
  stem.position.y = 0.8; stem.castShadow = true; g.add(stem);
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.15 + Math.random() * 0.05, 6), leafMat);
    leaf.position.set((Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 1.2, (Math.random() - 0.5) * 0.6);
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    leaf.castShadow = true; g.add(leaf);
  }
  for (let f = 0; f < 3; f++) {
    const flower = new THREE.Group();
    flower.position.set((Math.random() - 0.5) * 0.5, 1.2 + Math.random() * 0.5, (Math.random() - 0.5) * 0.5);
    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(new THREE.CircleGeometry(0.09, 6), flowerMat);
      const a = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06);
      petal.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.3, a, 0);
      petal.scale.set(1, 1.3, 1); flower.add(petal);
    }
    flower.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), centerMat));
    g.add(flower);
  }
  return g;
}