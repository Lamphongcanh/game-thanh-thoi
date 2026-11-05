import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   PROPS — Đồ đạc & hiệu ứng môi trường
   ═══════════════════════════════════════════════════════════════ */

export function buildProps() {
  const group = new THREE.Group();
  group.name = 'props';
  const interactives = [];

  /* ═══ 1. GHẾ BẬP BÊNH ═══ */
  const rockingChair = buildRockingChair();
  rockingChair.position.set(2.0, 0, 1.2);
  rockingChair.rotation.y = -0.4;
  rockingChair.userData.action = 'sit';
  group.add(rockingChair);
  interactives.push(rockingChair);

  /* ═══ 2. CHÕNG TRE + QUẠT MO CAU + ĐĨA KẸO ═══ */
  const chong = buildChong();
  chong.position.set(-2.8, 0, 1.5);
  chong.rotation.y = 0.5;
  group.add(chong);

  const palmFan = chong.userData.palmFan;
  palmFan.userData.action = 'fan';
  interactives.push(palmFan);

  const candyPlate = chong.userData.candyPlate;
  candyPlate.userData.action = 'candy';
  interactives.push(candyPlate);

  /* ═══ 3. CHỔI TRE ═══ */
  const broom = buildBroom();
  broom.position.set(-1.2, 0, -0.5);
  broom.rotation.y = 0.3;
  broom.userData.action = 'sweep';
  group.add(broom);
  interactives.push(broom);

  /* ═══ 4. CHUM SÀNH + GÁO DỪA ═══ */
  const jar = buildClayJar();
  jar.position.set(-3.8, 0, -4.2);
  group.add(jar);

  const ladle = jar.userData.ladle;
  ladle.userData.action = 'scoop';
  interactives.push(ladle);

  /* ═══ 5. ĐÈN LỒNG + ĐÈN DẦU (tự sáng ban đêm) ═══ */
  const lamps = [];
  const lanternPositions = [
    { x: -5.4, y: 3.9, z: -3.3 },   // cột trái hiên
    { x:  5.4, y: 3.9, z: -3.3 },   // cột phải hiên
  ];

  for (const p of lanternPositions) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(p.x, p.y, p.z);

    // dây treo
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x221100 })
    );
    string.position.y = 0.2;
    lampGroup.add(string);

    // thân lồng vải đỏ
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xdd3322, emissive: 0xff4400, emissiveIntensity: 0,
      roughness: 0.6, transparent: true, opacity: 0.92
    });
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.10, 0.22, 8),
      bodyMat
    );
    lampGroup.add(body);

    // nắp trên + đáy
    for (const yOff of [-0.11, 0.11]) {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8),
        new THREE.MeshStandardMaterial({ color: 0x332211 })
      );
      cap.position.y = yOff;
      lampGroup.add(cap);
    }

    // PointLight
    const light = new THREE.PointLight(0xff8844, 0, 6);
    light.position.y = 0;
    lampGroup.add(light);

lampGroup.userData.action = 'light-lamp';
lampGroup.userData.lampIndex = lamps.length;
interactives.push(lampGroup);
group.add(lampGroup);
lamps.push({ body: bodyMat, light, baseIntensity: 1.6, phase: Math.random() * 10, lit: false });
  }

  // đèn dầu nhỏ trên bàn trà (do garden tạo bàn rồi, ta đặt trên mặt bàn)
  const oilLamp = buildOilLamp();
oilLamp.position.set(0.15, 0.735, 1.55);
oilLamp.userData.action = 'light-lamp';
oilLamp.userData.lampIndex = lamps.length;
interactives.push(oilLamp);
group.add(oilLamp);
lamps.push({
  body: oilLamp.userData.glassMat,
  light: oilLamp.userData.light,
  baseIntensity: 1.2,
  phase: Math.random() * 10,
  lit: false
});

  /* ═══ 6. KHÓI BẾP CỦI (chiều tà) ═══ */
  const smoke = buildKitchenSmoke();
  smoke.points.position.set(9.5, 5.0, -1.5);   // đỉnh mái bếp nhà ngang
  group.add(smoke.points);

  /* ═══ UPDATE ═══ */
   function update(dt, elapsed, isDay, sunHeight) {
    for (const l of lamps) {
      if (!l.lit) continue;
      const flick = Math.sin(elapsed * 7 + l.phase) * 0.2 + Math.sin(elapsed * 13 + l.phase * 2) * 0.1;
      l.light.intensity = Math.max(0, l.baseIntensity + flick);
    }
    const isDusk = sunHeight !== undefined && sunHeight > -0.3 && sunHeight < 0.35;
    smoke.update(dt, elapsed, isDusk);
  }
  function lightLamp(idx) {
    const l = lamps[idx];
    if (!l) return;
    l.lit = true;
    l.light.intensity = l.baseIntensity;
    l.body.emissiveIntensity = 0.9;
  }

  return {
    group,
    update,
    interactives,
    rockingChair,
    chong,
    palmFan,
    candyPlate,
    broom,
    jar,
    ladle,
    lamps,
    lightLamp,  
  };
}

/* ═══════════════════════════════════════════════════════════════
   BUILDERS
   ═══════════════════════════════════════════════════════════════ */

function buildRockingChair() {
  const g = new THREE.Group();
  const woodMat     = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.82 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.88 });

  // mặt ngồi
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.42), woodMat);
  seat.position.y = 0.42;
  seat.castShadow = true; seat.receiveShadow = true;
  g.add(seat);

  // lưng tựa
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.55, 0.05), woodMat);
  back.position.set(0, 0.68, -0.19);
  back.castShadow = true;
  g.add(back);

  // thanh lưng dọc
  for (const x of [-0.18, 0, 0.18]) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.03), woodMat);
    slat.position.set(x, 0.68, -0.17);
    g.add(slat);
  }

  // tay vịn
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.42), woodMat);
    arm.position.set(sx * 0.26, 0.56, 0);
    arm.castShadow = true;
    g.add(arm);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), woodMat);
    post.position.set(sx * 0.26, 0.47, 0.17);
    g.add(post);
  }

  // thanh trượt cong (rocker)
  for (const sx of [-1, 1]) {
    const rocker = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.03, 6, 16, Math.PI * 0.4),
      woodDarkMat
    );
    rocker.rotation.z = Math.PI / 2 + 0.25;
    rocker.rotation.y = Math.PI / 2;
    rocker.position.set(sx * 0.22, 0.30, 0);
    g.add(rocker);
  }

  // 4 chân ngắn nối thanh trượt vào ghế
  for (const [x, z] of [[0.22, 0.15], [-0.22, 0.15], [0.22, -0.15], [-0.22, -0.15]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), woodDarkMat);
    leg.position.set(x, 0.32, z);
    g.add(leg);
  }

  return g;
}

function buildChong() {
  const g = new THREE.Group();
  const bambooMat     = new THREE.MeshStandardMaterial({ color: 0xc9ad63, roughness: 0.72 });
  const bambooDarkMat = new THREE.MeshStandardMaterial({ color: 0x9d7f3d, roughness: 0.78 });

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.7), bambooMat);
  top.position.y = 0.45;
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);

  // nan tre
  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.02, 0.12), bambooDarkMat);
    slat.position.set(0, 0.49, -0.28 + i * 0.14);
    g.add(slat);
  }

  for (const [x, z] of [[0.6, 0.28], [-0.6, 0.28], [0.6, -0.28], [-0.6, -0.28]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6), bambooDarkMat);
    leg.position.set(x, 0.225, z);
    leg.castShadow = true;
    g.add(leg);
  }

  /* quạt mo cau */
  const fanGroup = new THREE.Group();
  fanGroup.position.set(0.38, 0.51, 0.05);
  fanGroup.rotation.y = -0.4;

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5), bambooDarkMat);
  handle.rotation.z = Math.PI / 2;
  fanGroup.add(handle);

  const blade = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 10, -Math.PI / 2, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xd4a878, roughness: 0.9, side: THREE.DoubleSide, flatShading: true })
  );
  blade.rotation.x = -Math.PI / 2;
  blade.position.set(-0.12, 0, 0);
  blade.castShadow = true;
  fanGroup.add(blade);

  g.add(fanGroup);
  g.userData.palmFan = fanGroup;

  /* đĩa kẹo */
  const plateGroup = new THREE.Group();
  plateGroup.position.set(-0.35, 0.51, 0.08);

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.13, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.7 })
  );
  plate.castShadow = true;
  plateGroup.add(plate);

  const candyColors = [0xffaa55, 0xff8866, 0xddaa77, 0xee9944, 0xcc8844];
  for (let i = 0; i < 7; i++) {
    const candy = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, 0.03),
      new THREE.MeshStandardMaterial({ color: candyColors[i % candyColors.length] })
    );
    const a = (i / 7) * Math.PI * 2;
    candy.position.set(Math.cos(a) * 0.07, 0.025, Math.sin(a) * 0.07);
    candy.rotation.y = Math.random() * Math.PI;
    plateGroup.add(candy);
  }
  g.add(plateGroup);
  g.userData.candyPlate = plateGroup;

  return g;
}

function buildBroom() {
  const g = new THREE.Group();
  const handleMat  = new THREE.MeshStandardMaterial({ color: 0x9d7f3d, roughness: 0.85 });
  const bristleMat = new THREE.MeshStandardMaterial({ color: 0xb8a06a, roughness: 0.95 });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.5, 6), handleMat);
  handle.position.y = 0.85;
  handle.castShadow = true;
  g.add(handle);

  const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 10, 1, true), bristleMat);
  bristles.position.y = 0.2;
  bristles.rotation.z = Math.PI;
  bristles.castShadow = true;
  g.add(bristles);

  // cột dây buộc
  const tie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.05, 10, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9, side: THREE.DoubleSide })
  );
  tie.position.y = 0.32;
  g.add(tie);

  return g;
}

function buildClayJar() {
  const g = new THREE.Group();

  const jarMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.85, flatShading: true });

  const profile = [
    new THREE.Vector2(0.24, 0.00),
    new THREE.Vector2(0.28, 0.10),
    new THREE.Vector2(0.33, 0.30),
    new THREE.Vector2(0.30, 0.50),
    new THREE.Vector2(0.25, 0.65),
    new THREE.Vector2(0.20, 0.70),
    new THREE.Vector2(0.22, 0.72),
  ];
  const jar = new THREE.Mesh(new THREE.LatheGeometry(profile, 18), jarMat);
  jar.castShadow = true; jar.receiveShadow = true;
  g.add(jar);

  // nước trong
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2e5e6e, roughness: 0.1, metalness: 0.3,
    transparent: true, opacity: 0.82
  });
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.19, 16), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.60;
  g.add(water);

  // gáo dừa
  const ladleGroup = new THREE.Group();
  ladleGroup.position.set(0.18, 0.68, 0.02);
  ladleGroup.rotation.z = -0.3;

  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.75, side: THREE.DoubleSide })
  );
  bowl.rotation.x = Math.PI;
  bowl.position.y = 0.05;
  ladleGroup.add(bowl);

  const h = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4),
    new THREE.MeshStandardMaterial({ color: 0x9d7f3d })
  );
  h.rotation.z = 1.3;
  h.position.set(0.12, 0.13, 0);
  ladleGroup.add(h);

  g.add(ladleGroup);
  g.userData.ladle = ladleGroup;

  return g;
}

function buildOilLamp() {
  const g = new THREE.Group();

  // đế sành
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.06, 0.03, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a6030, roughness: 0.8 })
  );
  g.add(base);

  // thân dầu
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: 0xaa5522, roughness: 0.7 })
  );
  bowl.position.y = 0.045;
  g.add(bowl);

  // bấc
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.03, 4),
    new THREE.MeshStandardMaterial({ color: 0x221100 })
  );
  wick.position.y = 0.09;
  g.add(wick);

  // thủy tinh (ống khói)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffcc88, emissive: 0xff6600, emissiveIntensity: 0,
    roughness: 0.3, transparent: true, opacity: 0.85
  });
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.14, 10, 1, true),
    glassMat
  );
  glass.position.y = 0.17;
  g.add(glass);

  const light = new THREE.PointLight(0xffaa44, 0, 3);
  light.position.y = 0.15;
  g.add(light);

  g.userData = { light, glassMat };
  return g;
}

function buildKitchenSmoke() {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(200,200,200,0.55)');
  grad.addColorStop(0.5, 'rgba(180,180,180,0.25)');
  grad.addColorStop(1, 'rgba(150,150,150,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;

  const COUNT = 30;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    map: tex, size: 1.2, transparent: true, opacity: 0.5,
    depthWrite: false, color: 0xcccccc, sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  points.visible = false;
  points.frustumCulled = false;

  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 0.5,
      y: Math.random() * 2.5,
      z: (Math.random() - 0.5) * 0.5,
      vy: 0.4 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.15,
      age: Math.random() * 3,
      life: 2.5 + Math.random() * 1.5,
    });
  }

  function update(dt, elapsed, show) {
    points.visible = show;
    if (!show) return;
    const arr = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.age += dt;
      if (p.age > p.life) {
        p.x = (Math.random() - 0.5) * 0.5;
        p.y = 0;
        p.z = (Math.random() - 0.5) * 0.5;
        p.age = 0;
      }
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(elapsed * 0.8 + i) * 0.1) * dt;
      p.z += Math.cos(elapsed * 0.6 + i * 0.7) * 0.08 * dt;

      arr[i * 3]     = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}