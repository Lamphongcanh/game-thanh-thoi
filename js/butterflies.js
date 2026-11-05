import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   BUTTERFLIES — Bướm ban ngày + Chim én lượn trên trời
   ═══════════════════════════════════════════════════════════════ */

export function buildButterflies() {
  const group = new THREE.Group();
  group.name = 'butterflies';

  /* ── 1. Materials bướm ── */
  const wingColors = [
    0xff9933, // cam
    0xffcc00, // vàng
    0x6699ff, // xanh dương
    0xff66cc, // hồng
    0x99ff66  // xanh lá
  ];
  const wingMats = wingColors.map(c =>
    new THREE.MeshStandardMaterial({
      color: c, roughness: 0.7, side: THREE.DoubleSide,
      emissive: c, emissiveIntensity: 0.15
    })
  );
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

  /* ── 2. Tạo 1 con bướm ── */
  function createButterfly() {
    const g = new THREE.Group();

    // cánh trái + phải (2 cặp)
    const wingGeo = new THREE.CircleGeometry(0.08, 6);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const wing = new THREE.Mesh(wingGeo, wingMats[Math.floor(Math.random() * wingMats.length)]);
        wing.position.set(sx * 0.06, 0, sz * 0.04);
        wing.rotation.x = sz * 0.4;
        wing.rotation.y = sx * 0.3;
        wing.scale.set(1, 0.7, 1);
        g.add(wing);
        wing.userData = { baseRotX: wing.rotation.x, baseRotY: wing.rotation.y, side: sz };
      }
    }

    // thân
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.10, 3, 6), bodyMat);
    body.rotation.z = Math.PI / 2;
    g.add(body);

    g.userData = {
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.15,
      radius: 2 + Math.random() * 2,
      centerX: (Math.random() - 0.5) * 4,
      centerZ: (Math.random() - 0.5) * 4,
      height: 0.8 + Math.random() * 1.2,
      wings: g.children.filter(c => c.geometry && c.geometry.type === 'CircleGeometry')
    };
    return g;
  }

  // 6 con bướm
  const butterflies = [];
  for (let i = 0; i < 6; i++) {
    const b = createButterfly();
    group.add(b);
    butterflies.push(b);
  }

  /* ── 3. Tạo đàn chim én ── */
  const swallowMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 });
  const swallowBodyMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f5, roughness: 0.7 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6 });

  function createSwallow() {
    const g = new THREE.Group();

    // thân
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 6), swallowBodyMat);
    body.scale.set(1.8, 0.7, 0.6);
    g.add(body);

    // đầu
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), swallowMat);
    head.position.x = 0.15;
    g.add(head);

    // mỏ
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 4), beakMat);
    beak.position.set(0.24, 0, 0);
    beak.rotation.z = -Math.PI / 2;
    g.add(beak);

    // cánh (2 tấm phẳng, đập lên xuống)
    const wingGeo = new THREE.PlaneGeometry(0.28, 0.12);
    const wings = [];
    for (const sz of [-1, 1]) {
      const wing = new THREE.Mesh(wingGeo, swallowMat);
      wing.position.set(0, 0.02, sz * 0.10);
      wing.rotation.x = sz * 0.3;
      wing.userData.side = sz;
      g.add(wing);
      wings.push(wing);
    }

    // đuôi xòe hình chữ V
    for (const sz of [-1, 1]) {
      const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.05), swallowMat);
      tail.position.set(-0.28, 0, sz * 0.06);
      tail.rotation.z = sz * 0.5;
      tail.rotation.x = -Math.PI / 2;
      g.add(tail);
    }

    g.userData = {
      wings,
      phase: Math.random() * Math.PI * 2,
      radius: 8 + Math.random() * 4,
      height: 8 + Math.random() * 3,
      speed: 0.18 + Math.random() * 0.10,
      centerX: 0,
      centerZ: 0,
      offset: Math.random() * Math.PI * 2
    };
    return g;
  }

  // 5 con én bay vòng tròn trên trời
  const swallows = [];
  for (let i = 0; i < 5; i++) {
    const s = createSwallow();
    group.add(s);
    swallows.push(s);
  }

  /* ── 4. Update ── */
  let butterflyVisible = true;

  function update(dt, elapsed, isDay) {
    // Bướm chỉ bay ban ngày
    const showButterfly = isDay;
    if (showButterfly !== butterflyVisible) {
      butterflyVisible = showButterfly;
      butterflies.forEach(b => { b.visible = showButterfly; });
    }

    if (showButterfly) {
      for (const b of butterflies) {
        const u = b.userData;
        u.phase += u.speed * dt;

        // bay hình số 8 quanh tâm
        b.position.x = u.centerX + Math.cos(u.phase) * u.radius;
        b.position.z = u.centerZ + Math.sin(u.phase * 2) * u.radius * 0.5;
        b.position.y = u.height + Math.sin(u.phase * 3) * 0.3;

        b.rotation.y = Math.atan2(
          -Math.sin(u.phase * 2) * u.radius,
          -Math.sin(u.phase) * u.radius
        ) + Math.PI / 2;

        // đập cánh
        const flap = Math.sin(elapsed * 18 + u.phase) * 0.7;
        for (const wing of u.wings) {
          wing.rotation.x = wing.userData.baseRotX + wing.userData.side * flap;
        }
      }
    }

    // Chim én: bay vòng tròn lớn, luôn hiện (ban ngày rõ hơn)
    for (const s of swallows) {
      const u = s.userData;
      u.phase += u.speed * dt;

      s.position.x = Math.cos(u.phase) * u.radius;
      s.position.z = Math.sin(u.phase) * u.radius;
      s.position.y = u.height + Math.sin(u.phase * 2) * 0.5;

      // hướng bay
      s.rotation.y = -u.phase - Math.PI / 2;

      // nghiêng theo hướng lượn
      s.rotation.z = Math.sin(u.phase) * 0.3;

      // đập cánh
      const flap = Math.sin(elapsed * 8 + u.phase) * 0.8;
      for (const wing of u.wings) {
        wing.rotation.x = wing.userData.side * (0.3 + flap);
      }

      // ban đêm én mờ dần
      s.visible = isDay;
    }
  }

  return { group, update };
}