import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   PATH — Lối đi gạch xương cá (herringbone) uốn lượn từ cổng
   vào thềm nhà chính, men theo 2 ao.
   ═══════════════════════════════════════════════════════════════ */

export function buildPath() {
  const g = new THREE.Group();
  g.name = 'path';

  // ─── 1. Texture gạch đỏ sứt sẹo rêu phong ───
  function makeBrickTexture() {
    const S = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#9a5040';
    ctx.fillRect(0, 0, S, S);

    // vết sứt mẻ
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${20 + Math.random() * 40 | 0},${10 + Math.random() * 20 | 0},${5 + Math.random() * 15 | 0},${0.2 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, 2 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // vết rêu phong
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = `rgba(70,90,40,${0.15 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, 4 + Math.random() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  const brickMat = new THREE.MeshStandardMaterial({
    map: makeBrickTexture(),
    color: 0xb56a55,
    roughness: 0.94,
    metalness: 0.02
  });
  const mortarMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a40, roughness: 1.0
  });

  // ─── 2. Spline uốn lượn từ cổng (z = 7) vào thềm (z = -3.5) ───
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.03, 7.0),
    new THREE.Vector3(0.3, 0.03, 5.5),
    new THREE.Vector3(-0.2, 0.03, 4.0),
    new THREE.Vector3(0.0, 0.03, 2.5),
    new THREE.Vector3(0.1, 0.03, 1.0),
    new THREE.Vector3(0.0, 0.03, -1.0),
    new THREE.Vector3(-0.1, 0.03, -2.5),
    new THREE.Vector3(0.0, 0.03, -3.5)
  ]);

  // ─── 3. Rải gạch xương cá dọc spline ───
  // Gạch kích thước 0.18 x 0.05, xoay 45° so le
  const BRICK_L = 0.22;
  const BRICK_W = 0.10;
  const BRICK_H = 0.025;
  const GAP = 0.015;

  const totalLen = curve.getLength();
  const step = BRICK_W + GAP;
  const count = Math.floor(totalLen / step);

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;

    // Điểm + hướng trên spline
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Vector pháp tuyến trong mặt phẳng XZ (vuông góc tiếp tuyến)
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Góc xoay để gạch nằm dọc theo spline
    const angle = Math.atan2(tangent.x, tangent.z);

    // Hai viên gạch so le 2 bên trục (xương cá)
    for (const side of [-1, 1]) {
      // viên lẻ: xoay 45° so với tangent
      const localAngle = angle + side * Math.PI / 4;

      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(BRICK_L, BRICK_H, BRICK_W),
        i % 5 === 0 ? mortarMat : brickMat
      );

      // lệch 2 bên trục
      const offset = normal.clone().multiplyScalar(side * (BRICK_W * 0.5 + 0.02));
      brick.position.copy(pos).add(offset);
      brick.position.y = 0.025;

      // thỉnh thoảng xê dịch nhẹ cho tự nhiên
      brick.position.x += (Math.random() - 0.5) * 0.02;
      brick.position.z += (Math.random() - 0.5) * 0.02;

      brick.rotation.y = localAngle;
      // thỉnh thoảng nghiêng nhẹ (gạch cũ lún)
      brick.rotation.x = (Math.random() - 0.5) * 0.05;
      brick.rotation.z = (Math.random() - 0.5) * 0.05;

      brick.castShadow = true;
      brick.receiveShadow = true;
      g.add(brick);
    }
  }

  // ─── 4. Viền đá hai bên (đường viền cổ) ───
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x6b625a, roughness: 0.92
  });

  for (let i = 0; i < count; i += 3) {
    const t = (i + 0.5) / count;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    for (const side of [-1, 1]) {
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.05, 0.10),
        borderMat
      );
      const offset = normal.clone().multiplyScalar(side * 0.22);
      stone.position.copy(pos).add(offset);
      stone.position.y = 0.02;
      stone.rotation.y = Math.atan2(tangent.x, tangent.z);
      stone.castShadow = true;
      stone.receiveShadow = true;
      g.add(stone);
    }
  }

  return g;
}