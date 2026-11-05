// js/garden.js
import * as THREE from 'three';

const AUDIO_URLS = {
  pour: './assets/audio/tiengrotnuoc.mp3',
  radio: './assets/audio/tiengredai.mp3'
};

/* ─── Textures procedural (GIỮ NGUYÊN CHI TIẾT GỐC) ─── */
function makeLeafTexture() {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, S, S);

  const g = ctx.createLinearGradient(S / 2, 8, S / 2, S - 8);
  g.addColorStop(0, '#5c8a3a');
  g.addColorStop(0.55, '#3f6a26');
  g.addColorStop(1, '#2a4a18');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 64, 38, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(30,50,15,0.65)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(64, 8); ctx.lineTo(64, 120); ctx.stroke();
  for (let i = 1; i < 5; i++) {
    const y = 20 + i * 20;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(30,50,15,0.35)';
    ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(64 - 26, y + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(64 + 26, y + 10); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBarkTexture() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#4a3424';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    ctx.strokeStyle = `rgba(${20 + Math.random() * 55 | 0},${15 + Math.random() * 40 | 0},${8 + Math.random() * 22 | 0},${0.18 + Math.random() * 0.32})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 18, y + 20 + Math.random() * 55);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 3);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGrilleTexture() {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#191c21';
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#3d444d';
  for (let y = 7; y < S; y += 9)
    for (let x = 7; x < S; x += 9) {
      ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();
    }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeSmokeTexture() {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, S, S);

  let g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.26)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * S * 0.25;
    const x = S / 2 + Math.cos(a) * r;
    const y = S / 2 + Math.sin(a) * r;
    const rr = S * (0.12 + Math.random() * 0.16);
    g = ctx.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, 'rgba(255,255,255,0.30)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export function buildGarden({ camera, renderer } = {}) {
  const group = new THREE.Group();
  group.name = 'garden';
  const interactives = [];
  const colliders = [];

  /* ── Materials (GIỮ OLD) ── */
  const barkMat = new THREE.MeshStandardMaterial({
    map: makeBarkTexture(), roughness: 0.95, metalness: 0
  });
  const leafMat = new THREE.MeshStandardMaterial({
    map: makeLeafTexture(), transparent: true, alphaTest: 0.45,
    side: THREE.DoubleSide, roughness: 0.9, metalness: 0
  });
  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xc9ad63, roughness: 0.72, metalness: 0
  });
  const bambooDarkMat = new THREE.MeshStandardMaterial({
    color: 0x9d7f3d, roughness: 0.75, metalness: 0
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xd83030, emissive: 0x330000, roughness: 0.6, metalness: 0.05
  });
  const flowerDeepMat = new THREE.MeshStandardMaterial({
    color: 0xa01818, roughness: 0.65, metalness: 0.05
  });

  /* ═══════════════════ HÀM TẠO CÂY LỘC VỪNG CHI TIẾT (OLD) ═══════════════════ */
  function createLocVungTree() {
    const treeGroup = new THREE.Group();
    const flowerStrings = [];
    const fallingFlowers = [];
    const fallingLeaves = [];

    function addLeafCluster(parent, pos) {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), leafMat);
        leaf.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.38,
          (Math.random() - 0.5) * 0.32,
          (Math.random() - 0.5) * 0.38
        ));
        leaf.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        leaf.castShadow = true;
        parent.add(leaf);
      }
    }

    function addFlowerString(parent, anchorPos, length, phase) {
      const sg = new THREE.Group();
      sg.position.copy(anchorPos);
      parent.add(sg);

      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, length, 4),
        new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 1 })
      );
      cord.position.y = -length / 2;
      sg.add(cord);

      const clusters = Math.max(3, Math.floor(length * 6));
      for (let i = 0; i < clusters; i++) {
        const k = (i + 0.5) / clusters;
        const y = -length * k;
        const n = 4 + Math.floor(Math.random() * 3);
        for (let f = 0; f < n; f++) {
          const flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.022 + Math.random() * 0.012, 6, 5),
            Math.random() < 0.25 ? flowerDeepMat : flowerMat
          );
          flower.position.set(
            (Math.random() - 0.5) * 0.06,
            y + (Math.random() - 0.5) * 0.04,
            (Math.random() - 0.5) * 0.06
          );
          sg.add(flower);
        }
      }

      sg.userData = { length, phase, anchor: anchorPos.clone() };
      flowerStrings.push(sg);
      return sg;
    }

    function growBranch(start, dir, len, rad, depth) {
      const geo = new THREE.CylinderGeometry(rad * 0.68, rad, len, 7, 1);
      geo.translate(0, len / 2, 0);

      const mesh = new THREE.Mesh(geo, barkMat);
      mesh.position.copy(start);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize()
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      treeGroup.add(mesh);

      const end = start.clone().addScaledVector(dir.clone().normalize(), len);

      if (depth === 0) {
        if (Math.random() < 0.90) addLeafCluster(treeGroup, end);
        if (Math.random() < 0.55) {
          addFlowerString(
            treeGroup, end,
            0.5 + Math.random() * 0.8,
            Math.random() * Math.PI * 2
          );
        }
        return;
      }

      const count = depth >= 2 ? 2 : 2 + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const d = dir.clone().normalize();
        const axis = new THREE.Vector3(
          Math.random() - 0.5, 0.12, Math.random() - 0.5
        ).normalize();
        d.applyAxisAngle(axis, 0.42 + Math.random() * 0.5);
        d.y = Math.max(d.y, 0.16);
        growBranch(end, d, len * 0.72, rad * 0.66, depth - 1);
      }
    }

    growBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1.8, 0.24, 3);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
      const root = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.08, 0.9, 6), barkMat);
      root.position.set(Math.cos(a) * 0.35, 0.05, Math.sin(a) * 0.35);
      root.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      root.rotation.y = -a;
      root.castShadow = true;
      treeGroup.add(root);
    }

    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.02 + Math.random() * 0.012, 5, 4),
        Math.random() < 0.3 ? flowerDeepMat : flowerMat
      );
      treeGroup.add(m);
      fallingFlowers.push({
        mesh: m,
        x: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3,
        y: 1.5 + Math.random() * 2.2,
        speed: 0.18 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        sway: 0.3 + Math.random() * 0.3
      });
    }

    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.145), leafMat);
      treeGroup.add(m);
      fallingLeaves.push({
        mesh: m,
        x: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3,
        y: Math.random() * 3.5,
        speed: 0.24 + Math.random() * 0.36,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2.4
      });
    }

    return { treeGroup, flowerStrings, fallingFlowers, fallingLeaves };
  }

  // Cây Trái
  const leftTree = createLocVungTree();
  leftTree.treeGroup.position.set(-5.5, 0, -1.5);
  group.add(leftTree.treeGroup);
  colliders.push({ x: -5.5, z: -1.5, radius: 0.9 });

  // Cây Phải (Lật đối xứng)
  const rightTree = createLocVungTree();
  rightTree.treeGroup.position.set(5.5, 0, -1.5);
  rightTree.treeGroup.scale.x = -1;
  group.add(rightTree.treeGroup);
  colliders.push({ x: 5.5, z: -1.5, radius: 0.9 });

  /* ═══════════════════ [OLD] BÀN TRÀ + 4 GHẾ ═══════════════════ */
  const TABLE_POS = new THREE.Vector3(0, 0, 1.5);
  const TABLE_TOP_Y = 0.735;

  const tableGroup = new THREE.Group();
  tableGroup.position.copy(TABLE_POS);
  group.add(tableGroup);
  colliders.push({ x: TABLE_POS.x, z: TABLE_POS.z, radius: 1.05 });

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.72, 0.065, 40), bambooMat);
  top.position.y = 0.705;
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.715, 0.026, 8, 52), bambooMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.712;
  rim.castShadow = true;
  tableGroup.add(rim);

  for (const [x, z] of [[0.46, 0.46], [-0.46, 0.46], [0.46, -0.46], [-0.46, -0.46]]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.052, 0.71, 10), bambooDarkMat);
    leg.position.set(x, 0.355, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    tableGroup.add(leg);
  }

  const brace = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.019, 6, 44), bambooMat);
  brace.rotation.x = Math.PI / 2;
  brace.position.y = 0.22;
  brace.castShadow = true;
  tableGroup.add(brace);

  function buildChair(x, z, rotY) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    group.add(g);

    const seat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.285, 0.285, 0.055, 24), bambooMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    seat.receiveShadow = true;
    g.add(seat);

    for (const [lx, lz] of [[0.185, 0.185], [-0.185, 0.185], [0.185, -0.185], [-0.185, -0.185]]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.031, 0.035, 0.45, 8), bambooDarkMat);
      leg.position.set(lx, 0.225, lz);
      leg.castShadow = true;
      g.add(leg);
    }
    for (const px of [-0.2, 0.2]) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.62, 8), bambooMat);
      pole.position.set(px, 0.76, -0.235);
      pole.castShadow = true;
      g.add(pole);
    }
    for (const py of [0.72, 0.87, 1.02]) {
      const slat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, 0.42, 8), bambooMat);
      slat.rotation.z = Math.PI / 2;
      slat.position.set(0, py, -0.235);
      slat.castShadow = true;
      g.add(slat);
    }
    return g;
  }

  const chairPositions = [
    { x: TABLE_POS.x - 1.05, z: TABLE_POS.z, rot: Math.PI / 2 },
    { x: TABLE_POS.x + 1.05, z: TABLE_POS.z, rot: -Math.PI / 2 },
    { x: TABLE_POS.x, z: TABLE_POS.z + 1.05, rot: Math.PI },
    { x: TABLE_POS.x, z: TABLE_POS.z - 1.05, rot: 0 }
  ];

  for (const pos of chairPositions) {
    const chair = buildChair(pos.x, pos.z, pos.rot);
    chair.userData.action = 'sit-table';
    chair.userData.chairPos = new THREE.Vector3(pos.x, 0, pos.z);
    chair.userData.chairRot = pos.rot;
    interactives.push(chair);
  }

  /* ═══════════════════ [OLD] ẤM TRÀ CHI TIẾT ═══════════════════ */
  const teapotGroup = new THREE.Group();
  teapotGroup.position.set(TABLE_POS.x - 0.22, TABLE_TOP_Y, TABLE_POS.z + 0.05);
  teapotGroup.rotation.y = -0.5;
  teapotGroup.userData.action = 'pour';
  group.add(teapotGroup);

  const ceramic = new THREE.MeshStandardMaterial({
    color: 0xeae4d6, roughness: 0.32, metalness: 0.06
  });
  const ceramicDark = new THREE.MeshStandardMaterial({
    color: 0x9fb0a6, roughness: 0.35, metalness: 0.08
  });

  const tray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.21, 0.016, 28), ceramicDark);
  tray.position.y = 0.008;
  tray.receiveShadow = true;
  tray.castShadow = true;
  teapotGroup.add(tray);

  const profile = [
    new THREE.Vector2(0.030, 0.000), new THREE.Vector2(0.100, 0.016),
    new THREE.Vector2(0.148, 0.058), new THREE.Vector2(0.166, 0.120),
    new THREE.Vector2(0.150, 0.180), new THREE.Vector2(0.116, 0.224),
    new THREE.Vector2(0.100, 0.252)
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), ceramic);
  body.position.y = 0.016;
  body.castShadow = true;
  body.receiveShadow = true;
  teapotGroup.add(body);

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.086, 0.106, 0.026, 22), ceramic);
  lid.position.y = 0.283;
  lid.castShadow = true;
  teapotGroup.add(lid);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), ceramic);
  knob.position.y = 0.310;
  knob.castShadow = true;
  teapotGroup.add(knob);

  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.140, 0.072, 0),
    new THREE.Vector3(0.238, 0.108, 0),
    new THREE.Vector3(0.300, 0.190, 0),
    new THREE.Vector3(0.328, 0.258, 0)
  ]);
  const spout = new THREE.Mesh(
    new THREE.TubeGeometry(spoutCurve, 20, 0.026, 10, false), ceramic);
  spout.castShadow = true;
  teapotGroup.add(spout);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.086, 0.018, 8, 24, Math.PI * 1.35), ceramic);
  handle.position.set(-0.152, 0.152, 0);
  handle.rotation.z = Math.PI * 0.325;
  handle.castShadow = true;
  teapotGroup.add(handle);

  /* ═══════════════════ [OLD] STEAM SHADER ═══════════════════ */
  const smokeTex = makeSmokeTexture();
  const STEAM_COUNT = 140;
  const steamPos = new Float32Array(STEAM_COUNT * 3);
  const steamSize = new Float32Array(STEAM_COUNT);
  const steamAlpha = new Float32Array(STEAM_COUNT);
  const steamRot = new Float32Array(STEAM_COUNT);

  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3).setUsage(THREE.DynamicDrawUsage));
  steamGeo.setAttribute('aSize', new THREE.BufferAttribute(steamSize, 1).setUsage(THREE.DynamicDrawUsage));
  steamGeo.setAttribute('aAlpha', new THREE.BufferAttribute(steamAlpha, 1).setUsage(THREE.DynamicDrawUsage));
  steamGeo.setAttribute('aRot', new THREE.BufferAttribute(steamRot, 1).setUsage(THREE.DynamicDrawUsage));

  const steamMat = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: smokeTex },
      uColor: { value: new THREE.Color(0xf4f8fb) },
      uOpacity: { value: 0.95 },
      uPixelScale: { value: 800.0 }
    },
    vertexShader: /* glsl */`
      attribute float aSize;
      attribute float aAlpha;
      attribute float aRot;
      varying float vAlpha;
      varying float vRot;
      uniform float uPixelScale;
      void main() {
        vAlpha = aAlpha;
        vRot = aRot;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float px = aSize * uPixelScale / max(-mv.z, 0.1);
        gl_PointSize = min(px, 220.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      varying float vRot;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vRot);
        float s = sin(vRot);
        uv = mat2(c, -s, s, c) * uv + 0.5;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
        vec4 tex = texture2D(uTex, uv);
        float a = tex.a * vAlpha * uOpacity;
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.NormalBlending
  });

  const steamPoints = new THREE.Points(steamGeo, steamMat);
  steamPoints.frustumCulled = false;
  steamPoints.renderOrder = 3;
  teapotGroup.add(steamPoints);

  const SPOUT_TIP = new THREE.Vector3(0.328, 0.262, 0);
  const steamParticles = [];

  function respawnSteam(p, initial = false) {
    p.age = initial ? -Math.random() * 1.6 : 0;
    p.life = 2.0 + Math.random() * 1.1;
    p.x = SPOUT_TIP.x + (Math.random() - 0.5) * 0.04;
    p.y = SPOUT_TIP.y + (Math.random() - 0.5) * 0.03;
    p.z = SPOUT_TIP.z + (Math.random() - 0.5) * 0.04;
    p.vx = (Math.random() - 0.5) * 0.07;
    p.vy = 0.30 + Math.random() * 0.24;
    p.vz = (Math.random() - 0.5) * 0.07;
    p.buoy = 0.10 + Math.random() * 0.18;
    p.drag = 0.55 + Math.random() * 0.40;
    p.size0 = 0.035 + Math.random() * 0.035;
    p.size1 = 0.24 + Math.random() * 0.18;
    p.opacity = 0.34 + Math.random() * 0.30;
    p.swirl = Math.random() * Math.PI * 2;
    p.swirlSpeed = 1.1 + Math.random() * 1.7;
    p.swirlAmp = 0.05 + Math.random() * 0.10;
    p.rot = Math.random() * Math.PI * 2;
    p.rotSpeed = (Math.random() - 0.5) * 1.8;
  }

  for (let i = 0; i < STEAM_COUNT; i++) {
    const p = {};
    respawnSteam(p, true);
    steamParticles.push(p);
  }

  function updateSteam(dt) {
    const pos = steamPos, sz = steamSize, al = steamAlpha, rt = steamRot;
    for (let i = 0; i < STEAM_COUNT; i++) {
      const p = steamParticles[i];
      p.age += dt;
      if (p.age >= p.life) respawnSteam(p);

      let alpha = 0, size = p.size0;
      if (p.age > 0) {
        p.vy += p.buoy * dt;
        p.vy *= 1 - p.drag * dt;
        p.vx *= 1 - 1.4 * dt;
        p.vz *= 1 - 1.4 * dt;
        p.x += (p.vx + Math.sin(p.age * p.swirlSpeed + p.swirl) * p.swirlAmp) * dt;
        p.z += (p.vz + Math.cos(p.age * p.swirlSpeed * 0.85 + p.swirl) * p.swirlAmp) * dt;
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;

        const k = Math.min(p.age / p.life, 1);
        size = p.size0 + (p.size1 - p.size0) * k;
        const fadeIn = Math.min(k / 0.12, 1);
        const fadeOut = Math.min((1 - k) / 0.55, 1);
        alpha = fadeIn * fadeOut * p.opacity;
      }

      const i3 = i * 3;
      pos[i3] = p.x; pos[i3 + 1] = p.y; pos[i3 + 2] = p.z;
      sz[i] = size; al[i] = alpha; rt[i] = p.rot;
    }
    steamGeo.attributes.position.needsUpdate = true;
    steamGeo.attributes.aSize.needsUpdate = true;
    steamGeo.attributes.aAlpha.needsUpdate = true;
    steamGeo.attributes.aRot.needsUpdate = true;
  }

  /* ═══════════════════ [OLD] ĐÀI CASSETTE CHI TIẾT ═══════════════════ */
  const cassetteGroup = new THREE.Group();
  cassetteGroup.position.set(TABLE_POS.x + 0.28, TABLE_TOP_Y, TABLE_POS.z - 0.08);
  cassetteGroup.rotation.y = -0.55;
  cassetteGroup.userData.action = 'radio';
  group.add(cassetteGroup);

  const plastic = new THREE.MeshStandardMaterial({
    color: 0x2b2f36, roughness: 0.62, metalness: 0.18
  });
  const plasticDark = new THREE.MeshStandardMaterial({
    color: 0x14171b, roughness: 0.5, metalness: 0.3
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xa9b0b8, roughness: 0.35, metalness: 0.85
  });

  const bodyBox = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.21, 0.29), plastic);
  bodyBox.position.y = 0.105;
  bodyBox.castShadow = true;
  bodyBox.receiveShadow = true;
  cassetteGroup.add(bodyBox);

  const grille = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 0.135),
    new THREE.MeshStandardMaterial({
      map: makeGrilleTexture(), roughness: 0.9, metalness: 0.2
    })
  );
  grille.position.set(-0.155, 0.118, 0.1465);
  cassetteGroup.add(grille);

  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(0.21, 0.115),
    new THREE.MeshStandardMaterial({
      color: 0x0e1216, roughness: 0.25, metalness: 0.5,
      transparent: true, opacity: 0.88
    })
  );
  win.position.set(0.098, 0.118, 0.1465);
  cassetteGroup.add(win);

  const reelMat = new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.6 });
  const reelL = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.006, 16), reelMat);
  reelL.rotation.x = Math.PI / 2;
  reelL.position.set(0.048, 0.118, 0.1495);
  cassetteGroup.add(reelL);

  const reelR = reelL.clone();
  reelR.position.x = 0.148;
  cassetteGroup.add(reelR);

  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0x555d68, roughness: 0.5, metalness: 0.5
  });
  for (let i = 0; i < 4; i++) {
    const btn = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.022, 0.028), buttonMat);
    btn.position.set(-0.19 + i * 0.075, 0.032, 0.148);
    btn.castShadow = true;
    cassetteGroup.add(btn);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.006, 0.44, 6), metalMat);
  antenna.position.set(0.235, 0.30, -0.075);
  antenna.rotation.z = -0.28;
  antenna.rotation.x = 0.22;
  antenna.castShadow = true;
  cassetteGroup.add(antenna);

  const carry = new THREE.Mesh(
    new THREE.TorusGeometry(0.085, 0.011, 6, 20, Math.PI), plasticDark);
  carry.position.set(0, 0.21, 0.02);
  carry.rotation.y = Math.PI / 2;
  carry.castShadow = true;
  cassetteGroup.add(carry);

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x552200, emissive: 0x000000, roughness: 0.4
  });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), ledMat);
  led.position.set(0.235, 0.062, 0.148);
  cassetteGroup.add(led);

  interactives.push(teapotGroup, cassetteGroup);

  /* ═══════════════════ [OLD] AUDIO ═══════════════════ */
  let audioCtx = null;
  const buffers = {};
  let radioNodes = null;
  let radioOn = false;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  async function loadAudioFile(key, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.arrayBuffer();
      buffers[key] = await getAudio().decodeAudioData(data);
      console.info(`[Audio] Đã tải: ${url}`);
    } catch (e) {
      console.info(`[Audio] Không tải được "${url}" — dùng âm tổng hợp.`);
    }
  }

  function noiseBuffer(ctx, dur) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playPour() {
    if (window.GAME_MUTED) return;
    const ctx = getAudio();
    const now = ctx.currentTime;

    if (buffers.pour) {
      const src = ctx.createBufferSource();
      src.buffer = buffers.pour;
      const g = ctx.createGain();
      g.gain.value = 0.95;
      src.connect(g).connect(ctx.destination);
      src.start(now);
      return;
    }

    const dur = 1.9;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, dur);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(700, now);
    bp.frequency.exponentialRampToValueAtTime(2800, now + dur * 0.8);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 380;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.34, now + 0.12);
    g.gain.setValueAtTime(0.34, now + dur * 0.62);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 11.5;
    const lg = ctx.createGain();
    lg.gain.value = 0.085;
    lfo.connect(lg).connect(g.gain);
    lfo.start(now);
    lfo.stop(now + dur);

    src.connect(bp).connect(hp).connect(g).connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  }

  function startRadio() {
    if (window.GAME_MUTED) return;
    if (radioNodes) return;
    const ctx = getAudio();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.85, now + 0.45);
    master.connect(ctx.destination);

    if (buffers.radio) {
      const src = ctx.createBufferSource();
      src.buffer = buffers.radio;
      src.loop = true;
      src.connect(master);
      src.start(now);
      radioNodes = { master, sources: [src], timers: [] };
      return;
    }

    const hissSrc = ctx.createBufferSource();
    hissSrc.buffer = noiseBuffer(ctx, 3);
    hissSrc.loop = true;

    const hissBp = ctx.createBiquadFilter();
    hissBp.type = 'bandpass';
    hissBp.frequency.value = 2400;
    hissBp.Q.value = 0.6;

    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.10;

    hissSrc.connect(hissBp).connect(hissGain).connect(master);
    hissSrc.start(now);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 392;

    const vib = ctx.createOscillator();
    vib.frequency.value = 5.0;
    const vibGain = ctx.createGain();
    vibGain.gain.value = 4.0;
    vib.connect(vibGain).connect(osc.frequency);

    const toneGain = ctx.createGain();
    toneGain.gain.value = 0.0001;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;

    osc.connect(toneGain).connect(lp).connect(master);
    osc.start(now);
    vib.start(now);

    const scale = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25];
    const iv = setInterval(() => {
      const t = ctx.currentTime;
      const f = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.18 ? 2 : 1);
      osc.frequency.setTargetAtTime(f, t, 0.05);
      toneGain.gain.cancelScheduledValues(t);
      toneGain.gain.setValueAtTime(0.0001, t);
      toneGain.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    }, 520);

    radioNodes = { master, sources: [hissSrc, osc, vib], timers: [iv] };
  }

  function stopRadio() {
    if (!radioNodes) return;
    const ctx = getAudio();
    const { master, sources, timers } = radioNodes;
    timers.forEach(clearInterval);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    setTimeout(() => {
      sources.forEach(s => { try { s.stop(); } catch (e) {} });
      try { master.disconnect(); } catch (e) {}
    }, 420);
    radioNodes = null;
  }

  function toggleRadio() {
    radioOn = !radioOn;
    if (window.GAME_MUTED) {
      if (!radioOn) stopRadio();
    } else {
      if (radioOn) startRadio();
      else stopRadio();
    }
    ledMat.emissive.setHex(radioOn ? 0xff7a1a : 0x000000);
    ledMat.color.setHex(radioOn ? 0xff9a3a : 0x552200);
    return radioOn;
  }

  /* ═══════════════════ [NEW] GHẾ BẬP BÊNH ═══════════════════ */
  const rockPivot = new THREE.Group();
  rockPivot.position.set(-4.2, 0, -1.0);
  rockPivot.rotation.y = 0.35;
  group.add(rockPivot);
  colliders.push({ x: -4.2, z: -1.0, radius: 0.55 });

  const chairInner = new THREE.Group();
  rockPivot.add(chairInner);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.85 });

  const seatRC = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.6), woodMat);
  seatRC.position.y = 0.4;
  seatRC.castShadow = true;
  chairInner.add(seatRC);

  const backRC = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.05), woodMat);
  backRC.position.set(0, 0.75, -0.28);
  backRC.rotation.x = -0.12;
  backRC.castShadow = true;
  chairInner.add(backRC);

  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.32, -0.55),
      new THREE.Vector3(0, 0.05, -0.28),
      new THREE.Vector3(0, 0.00, 0.00),
      new THREE.Vector3(0, 0.05, 0.28),
      new THREE.Vector3(0, 0.32, 0.55),
    ]);
    const geo = new THREE.TubeGeometry(curve, 12, 0.025, 6, false);
    const rocker = new THREE.Mesh(geo, woodMat);
    rocker.position.set(side * 0.35, 0, 0);
    chairInner.add(rocker);
  }

  for (const [lx, lz] of [[-0.28, -0.24], [0.28, -0.24], [-0.28, 0.24], [0.28, 0.24]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), woodMat);
    leg.position.set(lx, 0.22, lz);
    chairInner.add(leg);
  }

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.55), woodMat);
    arm.position.set(side * 0.33, 0.6, -0.02);
    chairInner.add(arm);
  }

  rockPivot.userData = {
    action: 'sit-rocking',
    seatPos: new THREE.Vector3(0, 0.45, 0).add(rockPivot.position),
    seatRot: rockPivot.rotation.y,
  };
  interactives.push(rockPivot);

  let rockingOccupied = false;
  let rockPhase = 0;
  function setRockingOccupied(occupied) {
    rockingOccupied = !!occupied;
  }

  /* ═══════════════════ [NEW] MAT PLACEMENT ═══════════════════ */
  const placedMats = [];

  function buildMatMesh() {
    const matGroup = new THREE.Group();
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xc8a96a, roughness: 0.95 });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.95 });

    const inner = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 1.0), innerMat);
    inner.position.y = 0.011;
    inner.receiveShadow = true;
    matGroup.add(inner);

    const border = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.015, 1.06), borderMat);
    matGroup.add(border);

    for (let i = -2; i <= 2; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.021, 0.02), borderMat);
      stripe.position.set(0, 0.012, i * 0.2);
      matGroup.add(stripe);
    }
    return matGroup;
  }

  function placeMatAt(targetX, targetZ, isBlockedFn) {
    const blocked = (x, z) => {
      if (typeof isBlockedFn === 'function') return isBlockedFn(x, z);
      return colliders.some((c) => {
        const dx = x - c.x;
        const dz = z - c.z;
        const rr = c.radius + 0.85;
        return dx * dx + dz * dz < rr * rr;
      });
    };

    let spot = null;
    if (!blocked(targetX, targetZ)) {
      spot = { x: targetX, z: targetZ };
    } else {
      const step = 0.45;
      const maxRings = 14;
      outer:
      for (let ring = 1; ring <= maxRings; ring++) {
        const r = ring * step;
        const samples = Math.max(8, Math.floor(r * 14));
        for (let i = 0; i < samples; i++) {
          const a = (i / samples) * Math.PI * 2 + ring * 0.3;
          const x = targetX + Math.cos(a) * r;
          const z = targetZ + Math.sin(a) * r;
          if (!blocked(x, z)) {
            spot = { x, z };
            break outer;
          }
        }
      }
    }

    if (!spot) return null;

    const matMesh = buildMatMesh();
    matMesh.position.set(spot.x, 0.02, spot.z);
    matMesh.rotation.y = Math.random() * Math.PI * 2;
    matMesh.userData = {
      action: 'placed-mat',
      matMesh,
      pos: new THREE.Vector3(spot.x, 0, spot.z),
    };

    group.add(matMesh);
    placedMats.push(matMesh);
    interactives.push(matMesh);
    colliders.push({ x: spot.x, z: spot.z, radius: 0.9 });

    return matMesh;
  }

  function removePlacedMat(matMesh) {
    if (!matMesh) return false;
    const idx = placedMats.indexOf(matMesh);
    if (idx === -1) return false;
    placedMats.splice(idx, 1);

    const iIdx = interactives.indexOf(matMesh);
    if (iIdx !== -1) interactives.splice(iIdx, 1);

    const p = matMesh.userData.pos || matMesh.position;
    for (let i = colliders.length - 1; i >= 0; i--) {
      const c = colliders[i];
      if (Math.abs(c.x - p.x) < 0.05 && Math.abs(c.z - p.z) < 0.05 && Math.abs(c.radius - 0.9) < 0.01) {
        colliders.splice(i, 1);
        break;
      }
    }

    group.remove(matMesh);
    matMesh.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
    });

    return true;
  }

  /* ═══════════════════ [OLD+NEW] UPDATE ═══════════════════ */
  function updatePixelScale() {
    if (!camera || !renderer) return;
    steamMat.uniforms.uPixelScale.value =
      renderer.domElement.height /
      (2 * Math.tan(camera.fov * Math.PI / 360));
  }
  updatePixelScale();

  function update(dt, elapsed) {
    for (const tree of [leftTree, rightTree]) {
      tree.treeGroup.rotation.z = Math.sin(elapsed * 0.55 + (tree === rightTree ? Math.PI : 0)) * 0.012;
      tree.treeGroup.rotation.x = Math.cos(elapsed * 0.42 + (tree === rightTree ? Math.PI : 0)) * 0.008;

      for (const fs of tree.flowerStrings) {
        fs.rotation.z = Math.sin(elapsed * 0.9 + fs.userData.phase) * 0.10;
        fs.rotation.x = Math.cos(elapsed * 0.7 + fs.userData.phase) * 0.08;
      }

      for (const ff of tree.fallingFlowers) {
        ff.y -= ff.speed * dt;
        ff.x += Math.sin(elapsed * 1.4 + ff.phase) * ff.sway * dt;
        ff.z += Math.cos(elapsed * 1.1 + ff.phase) * ff.sway * 0.6 * dt;
        ff.mesh.position.set(ff.x, ff.y, ff.z);
        if (ff.y < 0.03) {
          ff.y = 2.8 + Math.random() * 1.2;
          ff.x = (Math.random() - 0.5) * 3;
          ff.z = (Math.random() - 0.5) * 3;
        }
      }

      for (const lf of tree.fallingLeaves) {
        lf.y -= lf.speed * dt;
        lf.x += Math.sin(elapsed * 1.6 + lf.phase) * 0.28 * dt;
        lf.z += Math.cos(elapsed * 1.15 + lf.phase) * 0.20 * dt;
        lf.mesh.position.set(lf.x, lf.y, lf.z);
        lf.mesh.rotation.x = Math.sin(elapsed * 2.1 + lf.phase) * 0.9;
        lf.mesh.rotation.y += lf.spin * dt;
        lf.mesh.rotation.z = Math.cos(elapsed * 1.7 + lf.phase) * 0.7;
        if (lf.y < 0.03) {
          lf.y = 3.2 + Math.random() * 0.8;
          lf.x = (Math.random() - 0.5) * 3;
          lf.z = (Math.random() - 0.5) * 3;
        }
      }
    }

    updateSteam(dt);
    updatePixelScale();

    if (radioOn) {
      reelL.rotation.y += dt * 3.4;
      reelR.rotation.y += dt * 3.4 * 1.18;
    }

    if (rockingOccupied) {
      rockPhase += dt * 2.0;
      rockPivot.rotation.z = Math.sin(rockPhase) * 0.12;
    } else {
      rockPivot.rotation.z *= Math.max(0, 1 - dt * 4);
    }
  }

  loadAudioFile('pour', AUDIO_URLS.pour);
  loadAudioFile('radio', AUDIO_URLS.radio);

  return {
    group,
    update,
    interactives,
    colliders,
    teapot: teapotGroup,
    playPour,
    toggleRadio,
    setRockingOccupied,
    placeMatAt,
    removePlacedMat,
  };
}