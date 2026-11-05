import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   PONDS — 2 ao cá đối xứng qua trục trung tâm
   ═══════════════════════════════════════════════════════════════ */

const STONE_DARK = 0x6b625a;
const STONE_MID  = 0x8a8078;
const WATER_COLOR = 0x2e5e6e;

function makeKoi() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff6633, roughness: 0.5, metalness: 0.05
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat);
  body.scale.set(1.6, 0.75, 0.55);
  body.castShadow = true;
  g.add(body);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.13, 4), mat);
  tail.rotation.z = -Math.PI / 2;
  tail.position.x = -0.19;
  g.add(tail);

  return g;
}

function makePond(centerX, centerZ, sizeX, sizeZ) {
  const g = new THREE.Group();
  g.position.set(centerX, 0, centerZ);

  const halfX = sizeX / 2;
  const halfZ = sizeZ / 2;
  const rimThick = 0.15;
  const rimHeight = 0.28;

  const rimMat = new THREE.MeshStandardMaterial({
    color: STONE_DARK, roughness: 0.9
  });

  // 4 thành đá
  const rimSpecs = [
    [0, halfZ + rimThick / 2, sizeX + rimThick * 2, rimThick],
    [0, -halfZ - rimThick / 2, sizeX + rimThick * 2, rimThick],
    [halfX + rimThick / 2, 0, rimThick, sizeZ],
    [-halfX - rimThick / 2, 0, rimThick, sizeZ]
  ];
  for (const [x, z, w, d] of rimSpecs) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, rimHeight, d), rimMat);
    wall.position.set(x, rimHeight / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);
  }

  // đáy bể
  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(sizeX, 0.05, sizeZ),
    new THREE.MeshStandardMaterial({ color: 0x3a3532, roughness: 0.95 })
  );
  basin.position.y = 0.02;
  basin.receiveShadow = true;
  g.add(basin);

  // mặt nước (vertex displacement)
  const segX = 20, segZ = 14;
  const waterGeo = new THREE.PlaneGeometry(
    sizeX - 0.05, sizeZ - 0.05, segX, segZ);
  const basePos = waterGeo.attributes.position.array.slice();

  const waterMat = new THREE.MeshStandardMaterial({
    color: WATER_COLOR,
    roughness: 0.18,
    metalness: 0.15,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide
  });

  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.22;
  water.receiveShadow = true;
  g.add(water);

  // Cá chép
  const fishes = [];
  for (let i = 0; i < 4; i++) {
    const f = makeKoi();
    const radius = 0.30 + Math.random() * 0.35;
    f.userData = {
      centerX: (Math.random() - 0.5) * 0.30,
      centerZ: (Math.random() - 0.5) * 0.20,
      radius,
      speed: (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.4),
      phase: Math.random() * Math.PI * 2
    };
    f.position.y = 0.13;
    g.add(f);
    fishes.push(f);
  }

  // Lá sen
  const lotusMat = new THREE.MeshStandardMaterial({
    color: 0x3f6b32, roughness: 0.7, side: THREE.DoubleSide
  });
  for (let i = 0; i < 5; i++) {
    const lotus = new THREE.Mesh(
      new THREE.CircleGeometry(0.10 + Math.random() * 0.06, 12),
      lotusMat
    );
    lotus.rotation.x = -Math.PI / 2;
    lotus.position.set(
      (Math.random() - 0.5) * (sizeX - 0.5),
      0.235,
      (Math.random() - 0.5) * (sizeZ - 0.5)
    );
    lotus.receiveShadow = true;
    g.add(lotus);
  }

  function update(dt, elapsed) {
    // gợn nước
    const pos = waterGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePos[i], y = basePos[i + 1];
      pos[i + 2] =
        Math.sin(x * 4.2 + elapsed * 1.6) * 0.022 +
        Math.cos(y * 5.1 + elapsed * 1.3) * 0.020 +
        Math.sin((x + y) * 3.7 + elapsed * 2.1) * 0.012;
    }
    waterGeo.attributes.position.needsUpdate = true;
    waterGeo.computeVertexNormals();

    // cá bơi
    for (const f of fishes) {
      const u = f.userData;
      u.phase += u.speed * dt;
      const a = u.phase;
      f.position.x = u.centerX + Math.cos(a) * u.radius;
      f.position.z = u.centerZ + Math.sin(a) * u.radius;
      f.position.y = 0.13 + Math.sin(a * 3) * 0.015;
      f.rotation.y = -a - Math.PI / 2;
    }
  }

  return { group: g, update };
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT chính
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   BỂ CẠN NON BỘ — thay ao phải
   ═══════════════════════════════════════════════════════════════ */
function makeRockGarden(centerX, centerZ, sizeX, sizeZ) {
  const g = new THREE.Group();
  g.position.set(centerX, 0, centerZ);

  const halfX = sizeX / 2;
  const halfZ = sizeZ / 2;
  const rimThick = 0.18;
  const rimHeight = 0.35;

  /* ── 1. Bể xi măng giả đá ── */
  const cementMat = new THREE.MeshStandardMaterial({
    color: 0x8a8078, roughness: 0.95, metalness: 0.02
  });

  // 4 thành
  const rimSpecs = [
    [0, halfZ + rimThick / 2, sizeX + rimThick * 2, rimThick],
    [0, -halfZ - rimThick / 2, sizeX + rimThick * 2, rimThick],
    [halfX + rimThick / 2, 0, rimThick, sizeZ],
    [-halfX - rimThick / 2, 0, rimThick, sizeZ]
  ];
  for (const [x, z, w, d] of rimSpecs) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, rimHeight, d), cementMat);
    wall.position.set(x, rimHeight / 2, z);
    wall.castShadow = true; wall.receiveShadow = true;
    g.add(wall);
  }

  // đáy bể (nước nông)
  const basinMat = new THREE.MeshStandardMaterial({
    color: 0x2e5a5a, roughness: 0.2, metalness: 0.3,
    transparent: true, opacity: 0.85
  });
  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(sizeX - 0.05, 0.05, sizeZ - 0.05), basinMat);
  basin.position.y = 0.10;
  basin.receiveShadow = true;
  g.add(basin);

  /* ── 2. Hòn non bộ (nhiều khối đá chồng) ── */
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x5a5650, roughness: 0.95, metalness: 0.05
  });
  const rockDarkMat = new THREE.MeshStandardMaterial({
    color: 0x3a3630, roughness: 0.95
  });

  const rockPositions = [
    { x: -0.3, y: 0.15, z: 0.1, s: 0.35 },
    { x: -0.1, y: 0.45, z: -0.1, s: 0.30 },
    { x: -0.2, y: 0.75, z: 0.05, s: 0.25 },
    { x: 0.15, y: 0.20, z: 0.20, s: 0.28 },
    { x: 0.25, y: 0.55, z: -0.15, s: 0.22 },
    { x: 0.10, y: 0.85, z: 0.10, s: 0.18 }
  ];

  for (const r of rockPositions) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r.s, 0),
      Math.random() < 0.4 ? rockDarkMat : rockMat
    );
    rock.position.set(r.x, r.y, r.z);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.scale.set(
      0.8 + Math.random() * 0.4,
      0.9 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4
    );
    rock.castShadow = true; rock.receiveShadow = true;
    g.add(rock);
  }

  /* ── 3. Vòi tre róc rách ── */
  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xc9ad63, roughness: 0.7
  });

  // ống tre chính (dựng đứng)
  const pipeMain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), bambooMat);
  pipeMain.position.set(-halfX + 0.4, 0.85, -halfZ + 0.4);
  pipeMain.castShadow = true;
  g.add(pipeMain);

  // ống tre ngang (vòi rót)
  const pipeSpout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), bambooMat);
  pipeSpout.rotation.z = Math.PI / 2;
  pipeSpout.position.set(-halfX + 0.7, 1.5, -halfZ + 0.4);
  pipeSpout.castShadow = true;
  g.add(pipeSpout);

  // dòng nước chảy (cylinder trong suốt)
  const waterStreamMat = new THREE.MeshStandardMaterial({
    color: 0x8ecbde, roughness: 0.1, metalness: 0.3,
    transparent: true, opacity: 0.6
  });
  const waterStream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 1.2, 6), waterStreamMat);
  waterStream.position.set(-halfX + 1.05, 0.9, -halfZ + 0.4);
  waterStream.castShadow = false;
  g.add(waterStream);

  // đốm nước bắn tung toé ở đáy (2-3 hạt)
  const splashMat = new THREE.MeshStandardMaterial({
    color: 0xb8e5f0, roughness: 0.1, transparent: true, opacity: 0.7
  });
  const splashes = [];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), splashMat);
    s.position.set(-halfX + 1.05 + (i - 1) * 0.08, 0.15, -halfZ + 0.4);
    g.add(s);
    splashes.push(s);
  }

  /* ── 4. Bèo hoa dâu (cụm lá nhỏ xanh) ── */
  const duckweedMat = new THREE.MeshStandardMaterial({
    color: 0x4a8a2a, roughness: 0.7, side: THREE.DoubleSide
  });
  for (let i = 0; i < 20; i++) {
    const dw = new THREE.Mesh(new THREE.CircleGeometry(0.04 + Math.random() * 0.03, 6), duckweedMat);
    dw.rotation.x = -Math.PI / 2;
    dw.position.set(
      (Math.random() - 0.5) * (sizeX - 0.3),
      0.135,
      (Math.random() - 0.5) * (sizeZ - 0.3)
    );
    dw.receiveShadow = true;
    g.add(dw);
  }

  /* ── 5. Vài viên sỏi cuội nhô lên mặt nước ── */
  for (let i = 0; i < 5; i++) {
    const pebble = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 6, 4),
      rockMat
    );
    pebble.scale.set(1.3, 0.5, 1);
    pebble.position.set(
      (Math.random() - 0.5) * (sizeX - 0.3),
      0.13,
      (Math.random() - 0.5) * (sizeZ - 0.3)
    );
    pebble.castShadow = true;
    g.add(pebble);
  }

  /* ── 6. Update: nước róc rách gợn sóng + splash nảy ── */
  function update(dt, elapsed) {
    // mặt nước gợn nhẹ
    basinMat.opacity = 0.82 + Math.sin(elapsed * 3) * 0.03;

    // splash nảy lên xuống
    for (let i = 0; i < splashes.length; i++) {
      const s = splashes[i];
      const p = (elapsed * 2 + i * 0.7) % 1;
      s.position.y = 0.13 + Math.sin(p * Math.PI) * 0.15;
      s.material.opacity = 0.8 * (1 - p);
      s.scale.setScalar(0.6 + p * 0.8);
    }

    // dòng nước hơi đung đưa
    waterStream.rotation.y = Math.sin(elapsed * 1.5) * 0.05;
  }

  return { group: g, update };
}

export function buildPonds() {
  const group = new THREE.Group();
  group.name = 'ponds';

  // Trái: ao sen mộc mạc
  const left  = makePond(-2.3, 3.4, 2.4, 1.8);

  // Phải: bể cạn non bộ cổ truyền
  const right = makeRockGarden(2.3, 3.4, 2.4, 1.8);

  group.add(left.group);
  group.add(right.group);

  function update(dt, elapsed) {
    left.update(dt, elapsed);
    right.update(dt, elapsed);
  }

  return { group, update };
}