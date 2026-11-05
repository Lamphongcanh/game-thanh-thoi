import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   CHICKENS — Gà mẹ, gà con, đi dạo & ăn thóc
   ═══════════════════════════════════════════════════════════════ */

export function buildChickens() {
  const group = new THREE.Group();
  group.name = 'chickens';

  /* ── 1. Materials ── */
  const henMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });
  const henCombMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.7 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.6 });
  const chickMat = new THREE.MeshStandardMaterial({ color: 0xffe135, roughness: 0.8 });

  /* ── 2. Tạo Gà Mẹ ── */
  function createHen() {
    const g = new THREE.Group();
    
    // Thân
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), henMat);
    body.scale.set(1.3, 1.0, 0.9);
    body.position.y = 0.25;
    body.castShadow = true;
    g.add(body);

    // Đầu
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), henMat);
    head.position.set(0.2, 0.45, 0);
    head.castShadow = true;
    g.add(head);

    // Mào
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.1), henCombMat);
    comb.position.set(0.2, 0.58, 0);
    g.add(comb);

    // Mỏ
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), beakMat);
    beak.position.set(0.32, 0.44, 0);
    beak.rotation.z = -Math.PI / 2;
    g.add(beak);

    // Chân
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 4), beakMat);
      leg.position.set(0, 0.075, sz * 0.08);
      g.add(leg);
    }

    g.userData = { head, body, type: 'hen', phase: Math.random() * 10 };
    return g;
  }

  /* ── 3. Tạo Gà Con ── */
  function createChick() {
    const g = new THREE.Group();
    
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), chickMat);
    body.position.y = 0.08;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), chickMat);
    head.position.set(0.06, 0.16, 0);
    g.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 4), beakMat);
    beak.position.set(0.12, 0.16, 0);
    beak.rotation.z = -Math.PI / 2;
    g.add(beak);

    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 4), beakMat);
      leg.position.set(0, 0.03, sz * 0.03);
      g.add(leg);
    }

    g.userData = { head, phase: Math.random() * 10 };
    return g;
  }

  /* ── 4. Khởi tạo Đàn Gà ── */
  const hen = createHen();
  hen.position.set(1.5, 0, -1);
  group.add(hen);

  const chicks = [];
  for (let i = 0; i < 4; i++) {
    const c = createChick();
    c.position.set(1.5 + (Math.random() - 0.5), 0, -1 + (Math.random() - 0.5));
    group.add(c);
    chicks.push(c);
  }

  /* ── 5. Hệ thống Thóc (Particles) ── */
  const SEED_COUNT = 25;
  const seedGeo = new THREE.BufferGeometry();
  const seedPos = new Float32Array(SEED_COUNT * 3);
  seedGeo.setAttribute('position', new THREE.BufferAttribute(seedPos, 3));
  
  const seedMat = new THREE.PointsMaterial({
    color: 0xffd700,
    size: 0.04,
    sizeAttenuation: true
  });
  const seeds = new THREE.Points(seedGeo, seedMat);
  seeds.visible = false;
  seeds.frustumCulled = false;
  group.add(seeds);

  let seedTarget = new THREE.Vector3();
  let isFeeding = false;
  let seedTimer = 0;
  const seedVelocities = []; // Để hạt rơi tự do
  for (let i = 0; i < SEED_COUNT; i++) {
    seedVelocities.push({ vx: 0, vy: 0, vz: 0, active: false });
  }

  function dropSeeds(point) {
    seedTarget.copy(point);
    isFeeding = true;
    seedTimer = 0;
    seeds.visible = true;

    const pos = seedGeo.attributes.position.array;
    for (let i = 0; i < SEED_COUNT; i++) {
      pos[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 1.2 + Math.random() * 0.5; // Từ tay player (không phải từ trời)
      pos[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;
      seedVelocities[i].active = true;
      seedVelocities[i].vx = (Math.random() - 0.5) * 0.5;
      seedVelocities[i].vy = 0;
      seedVelocities[i].vz = (Math.random() - 0.5) * 0.5;
    }
    seedGeo.attributes.position.needsUpdate = true;
  }

  /* ── 6. Update Loop ── */
  const wanderCenter = new THREE.Vector3(0, 0, -1); // Gốc cây lộc vừng
  const henTarget = new THREE.Vector3().copy(hen.position);
  let henWaitTime = 0;

  function update(dt, elapsed) {
    /* --- A. Cập nhật hạt thóc rơi --- */
    if (isFeeding) {
      const pos = seedGeo.attributes.position.array;
      let allLanded = true;
      
      for (let i = 0; i < SEED_COUNT; i++) {
        const v = seedVelocities[i];
        if (!v.active) continue;

        v.vy -= 9.8 * dt; // Trọng lực
        pos[i * 3] += v.vx * dt;
        pos[i * 3 + 1] += v.vy * dt;
        pos[i * 3 + 2] += v.vz * dt;

        if (pos[i * 3 + 1] <= 0.02) {
          pos[i * 3 + 1] = 0.02;
          v.vx = 0; v.vy = 0; v.vz = 0;
          v.active = false; // Nằm yên trên mặt đất
        } else {
          allLanded = false;
        }
      }
      seedGeo.attributes.position.needsUpdate = true;

      // Gà ăn hết thóc sau 5 giây
      if (allLanded) {
        seedTimer += dt;
        if (seedTimer > 5.0) {
          isFeeding = false;
          seeds.visible = false;
        }
      }
    }

    /* --- B. Di chuyển Gà Mẹ --- */
    if (isFeeding) {
      // Chạy về phía đống thóc
      const dir = new THREE.Vector3().subVectors(seedTarget, hen.position);
      dir.y = 0;
      const dist = dir.length();
      
      if (dist > 0.5) {
        dir.normalize();
        hen.position.addScaledVector(dir, 1.5 * dt); // Chạy nhanh
        hen.rotation.y = Math.atan2(-dir.x, dir.z);
      } else {
        // Đang mổ thóc
        hen.userData.head.rotation.x = Math.abs(Math.sin(elapsed * 15)) * 0.6;
      }
    } else {
      // Đi dạo ngẫu nhiên
      henWaitTime -= dt;
      if (henWaitTime <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3;
        henTarget.set(
          wanderCenter.x + Math.cos(angle) * radius,
          0,
          wanderCenter.z + Math.sin(angle) * radius
        );
        henWaitTime = 2 + Math.random() * 3;
      }

      const dir = new THREE.Vector3().subVectors(henTarget, hen.position);
      dir.y = 0;
      if (dir.length() > 0.1) {
        dir.normalize();
        hen.position.addScaledVector(dir, 0.4 * dt);
        hen.rotation.y = Math.atan2(-dir.x, dir.z);
      } else {
        // Đứng im mổ đất ngẫu nhiên
        if (Math.random() < 0.05) {
          hen.userData.head.rotation.x = Math.abs(Math.sin(elapsed * 10)) * 0.5;
        }
      }
    }

    // Nhấp nhô thân gà mẹ khi đi
    hen.userData.body.position.y = 0.25 + Math.sin(elapsed * 10) * 0.01;

    /* --- C. Di chuyển Gà Con --- */
    for (let i = 0; i < chicks.length; i++) {
      const c = chicks[i];
      
      // Gà con bám theo gà mẹ với khoảng cách lệch
      const offset = new THREE.Vector3(
        Math.cos(i * Math.PI / 2) * 0.4,
        0,
        Math.sin(i * Math.PI / 2) * 0.4
      );
      const target = hen.position.clone().add(offset);
      const dir = new THREE.Vector3().subVectors(target, c.position);
      dir.y = 0;

      if (dir.length() > 0.1) {
        dir.normalize();
        c.position.addScaledVector(dir, 1.2 * dt); // Gà con chạy nhanh hơn
        c.rotation.y = Math.atan2(-dir.x, dir.z);
      }

      // Gà con mổ thóc (nếu đang ăn) hoặc mổ đất ngẫu nhiên
      if (isFeeding && c.position.distanceTo(seedTarget) < 0.6) {
        c.userData.head.rotation.x = Math.abs(Math.sin(elapsed * 20 + i)) * 0.8;
      } else if (Math.random() < 0.02) {
        c.userData.head.rotation.x = Math.abs(Math.sin(elapsed * 12 + i)) * 0.5;
      }
    }
  }

  return {
    group,
    update,
    dropSeeds
  };
}