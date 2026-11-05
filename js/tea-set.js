import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   TEA SET — ấm trà gốm men sần + 2 chén + khay gỗ tối màu
   (theo ảnh tham khảo: men trắng ngà xám, đốm nâu, chân mộc nâu đất)
   Trả về 1 THREE.Group, gốc tọa độ nằm ở đáy khay.
   ═══════════════════════════════════════════════════════════════ */

/* Texture men gốm: vệt bàn xoay + đốm nâu + chân mộc */
function makeGlazeTexture() {
  const W = 512, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0.00, '#d8d1c1');
  g.addColorStop(0.55, '#cbc1ad');
  g.addColorStop(0.80, '#b9a98f');
  g.addColorStop(0.89, '#7a5236');   // chân mộc nâu đất
  g.addColorStop(1.00, '#5e3b26');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // vệt xoay bàn xoay nằm ngang
  for (let y = 0; y < H * 0.9; y += 2 + Math.random() * 3) {
    const dark = Math.random() < 0.5;
    const a = 0.05 + Math.random() * 0.12;
    ctx.strokeStyle = dark ? `rgba(95,80,58,${a})` : `rgba(250,244,230,${a})`;
    ctx.lineWidth = 1 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 0.8);
    ctx.stroke();
  }

  // đốm nâu nhỏ li ti
  for (let i = 0; i < 1100; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.9;
    const r = 0.6 + Math.random() * 1.6;
    ctx.fillStyle = `rgba(${60 + Math.random() * 30},${38 + Math.random() * 20},${24},${0.45 + Math.random() * 0.45})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // vài vệt gỉ nâu lớn hơn
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = H * (0.3 + Math.random() * 0.55);
    ctx.fillStyle = `rgba(120,70,40,${0.18 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 3 + Math.random() * 7, 1 + Math.random() * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/* Texture gỗ tối cho khay */
function makeTrayWoodTexture() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#3a2216';
  ctx.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 1.5) {
    const a = 0.08 + Math.random() * 0.22;
    ctx.strokeStyle = Math.random() < 0.55 ? `rgba(20,10,5,${a})` : `rgba(110,70,40,${a * 0.7})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= S; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.04 + y * 0.3) * 1.6);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

function roundedRectShape(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* Ống cong có độ thon (dùng cho vòi ấm) */
function taperedTube(curve, seg, radial, r0, r1, mat) {
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = geo.attributes.position;
  const ring = radial + 1;
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    curve.getPointAt(i / seg, c);
    const r = r0 + (r1 - r0) * (i / seg);
    for (let j = 0; j < ring; j++) {
      const idx = i * ring + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

export function buildTeaSet() {
  const group = new THREE.Group();
  group.name = 'teaSet';

  const glaze = makeGlazeTexture();
  const glazeMat = new THREE.MeshStandardMaterial({
    map: glaze, bumpMap: glaze, bumpScale: 0.5,
    roughness: 0.62, metalness: 0.0
  });
  const glazeMatDouble = glazeMat.clone();
  glazeMatDouble.side = THREE.DoubleSide;

  /* ── Khay gỗ tối màu có thành viền ── */
  const trayW = 0.58, trayD = 0.36;
  const woodMat = new THREE.MeshStandardMaterial({
    map: makeTrayWoodTexture(), roughness: 0.55, metalness: 0.02
  });

  const baseGeo = new THREE.ExtrudeGeometry(
    roundedRectShape(trayW, trayD, 0.04), { depth: 0.012, bevelEnabled: false });
  baseGeo.rotateX(-Math.PI / 2);
  const base = new THREE.Mesh(baseGeo, woodMat);
  group.add(base);

  const rimShape = roundedRectShape(trayW, trayD, 0.04);
  rimShape.holes.push(roundedRectShape(trayW - 0.044, trayD - 0.044, 0.022));
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
    depth: 0.026, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2
  });
  rimGeo.rotateX(-Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, woodMat);
  rim.position.y = 0.006;
  group.add(rim);

  /* ── Ấm trà ── */
  const pot = new THREE.Group();
  pot.position.set(-0.05, 0.012, 0.0);
  group.add(pot);

  const bodyProfile = [
    [0.000, 0.000], [0.048, 0.000], [0.056, 0.008], [0.080, 0.016],
    [0.106, 0.044], [0.123, 0.085], [0.119, 0.125], [0.097, 0.158],
    [0.074, 0.176], [0.066, 0.186]
  ].map(p => new THREE.Vector2(p[0], p[1]));
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyProfile, 48), glazeMat);
  pot.add(body);

  // nắp: vành phẳng + chỏm tròn
  const lidProfile = [
    [0.000, 0.000], [0.086, 0.000], [0.088, 0.010], [0.074, 0.016],
    [0.060, 0.020], [0.052, 0.030], [0.030, 0.036], [0.000, 0.038]
  ].map(p => new THREE.Vector2(p[0], p[1]));
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lidProfile, 40), glazeMat);
  lid.position.y = 0.182;
  pot.add(lid);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.021, 16, 12), glazeMat);
  knob.scale.set(1, 0.92, 1);
  knob.position.y = 0.182 + 0.047;
  pot.add(knob);

  // vòi: ngắn, thon, cong nhẹ hướng lên (đầu vòi ở x≈0.215, y≈0.150)
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.094, 0.058, 0),
    new THREE.Vector3(0.150, 0.074, 0),
    new THREE.Vector3(0.190, 0.104, 0),
    new THREE.Vector3(0.215, 0.150, 0)
  ]);
  const spout = taperedTube(spoutCurve, 20, 14, 0.030, 0.018, glazeMat);
  pot.add(spout);

  const tipTan = spoutCurve.getTangentAt(1).normalize();
  const tipPos = spoutCurve.getPointAt(1);
  const tipCap = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), glazeMat);
  tipCap.position.copy(tipPos).addScaledVector(tipTan, 0.0004);
  tipCap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tipTan);
  pot.add(tipCap);
  const tipHole = new THREE.Mesh(
    new THREE.CircleGeometry(0.011, 14),
    new THREE.MeshBasicMaterial({ color: 0x2a1c12 })
  );
  tipHole.position.copy(tipPos).addScaledVector(tipTan, 0.0012);
  tipHole.quaternion.copy(tipCap.quaternion);
  pot.add(tipHole);

  // quai: vòng tai ở bên kia vòi
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.100, 0.150, 0),
    new THREE.Vector3(-0.150, 0.158, 0),
    new THREE.Vector3(-0.186, 0.125, 0),
    new THREE.Vector3(-0.178, 0.080, 0),
    new THREE.Vector3(-0.104, 0.055, 0)
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 28, 0.0135, 10, false), glazeMat);
  pot.add(handle);

  /* ── Chén trà (2 cái) có nước trà nâu ── */
  const cupProfile = [
    [0.000, 0.000], [0.026, 0.000], [0.029, 0.007], [0.040, 0.017],
    [0.050, 0.036], [0.054, 0.056],
    [0.051, 0.057], [0.046, 0.046], [0.034, 0.024], [0.000, 0.016]
  ].map(p => new THREE.Vector2(p[0], p[1]));
  const cupGeo = new THREE.LatheGeometry(cupProfile, 36);
  const teaMat = new THREE.MeshStandardMaterial({ color: 0x7a3f16, roughness: 0.12, metalness: 0.1 });

  function makeCup(x, z, ry) {
    const c = new THREE.Group();
    c.position.set(x, 0.012, z);
    c.rotation.y = ry;
    const shell = new THREE.Mesh(cupGeo, glazeMatDouble);
    c.add(shell);
    const tea = new THREE.Mesh(new THREE.CircleGeometry(0.043, 24), teaMat);
    tea.rotation.x = -Math.PI / 2;
    tea.position.y = 0.040;
    c.add(tea);
    return c;
  }
  group.add(makeCup(0.190, 0.080, 0.4));
  group.add(makeCup(0.120, -0.110, 1.9));

  group.traverse(o => {
    if (o.isMesh && o.material !== teaMat && !(o.material instanceof THREE.MeshBasicMaterial)) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return group;
}