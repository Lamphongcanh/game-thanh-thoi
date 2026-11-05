// js/pets.js
// HỢP NHẤT: GIỮ mèo + chõng tre (cũ) + THÊM chó cỏ + NPC (mới)
// Export: buildPets() — sẽ được import trong main.js
import * as THREE from 'three';

/* ================================================================
 *  WEB AUDIO
 * ================================================================ */
let _audio = null;
function getAudio() {
  if (!_audio) {
    try { _audio = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (_audio.state === 'suspended') _audio.resume().catch(() => {});
  return _audio;
}
const isMuted = () => (typeof window !== 'undefined' && window.GAME_MUTED);

function playMeow() {
  if (isMuted()) return;
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const base = 560 + Math.random() * 120;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.08);
  osc.frequency.exponentialRampToValueAtTime(base * 0.75, t + 0.32);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.45);
}

function playPurr() {
  if (isMuted()) return;
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(42, t);
  lfo.type = 'sine';     lfo.frequency.setValueAtTime(24, t);
  lfoGain.gain.setValueAtTime(18, t);
  lfo.connect(lfoGain).connect(osc.frequency);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
  gain.gain.setValueAtTime(0.05, t + 1.0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); lfo.start(t);
  osc.stop(t + 1.6); lfo.stop(t + 1.6);
}

function playBark(vol = 0.14) {
  if (isMuted()) return;
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(170 + Math.random() * 40, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.2);
}

function playWhine() {
  if (isMuted()) return;
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(640, t + 0.35);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.07, t + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.42);
}

/* ================================================================
 *  HELPERS
 * ================================================================ */
const rand = (a, b) => a + Math.random() * (b - a);
const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

const WEST_GATE_AREA = new THREE.Vector3(-11, 0, 10);
const EAST_KITCHEN_AREA = new THREE.Vector3(9, 0, 6);

/* ================================================================
 *  [OLD] MÈO
 * ================================================================ */
function createCat(type) {
  const g = new THREE.Group();
  const isTabby = type === 'tabby';

  const tabbyBase = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
  const tabbyStripe = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const britishBase = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.9 });
  const britishEar = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.8 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff9999, roughness: 0.6 });

  const bodyMat = isTabby ? tabbyBase : britishBase;
  const scale = isTabby ? 1 : 1.15;

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 12, 10), bodyMat);
  body.scale.set(1.6, 0.9, 1.1);
  body.position.y = 0.15;
  body.castShadow = true;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16 * scale, 12, 10), bodyMat);
  head.position.set(0.25 * scale, 0.22, 0);
  head.castShadow = true;
  g.add(head);

  for (const sz of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 4), isTabby ? bodyMat : britishEar);
    ear.position.set(0.25 * scale, 0.35, sz * 0.1);
    ear.rotation.x = sz * 0.2;
    g.add(ear);
  }

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), noseMat);
  nose.position.set(0.4 * scale, 0.2, 0);
  g.add(nose);

  const tailGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.5, 6);
  tailGeo.translate(0, 0.25, 0);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(-0.3 * scale, 0.1, 0);
  tail.rotation.x = Math.PI / 2;
  tail.rotation.z = 0.5;
  tail.castShadow = true;
  g.add(tail);

  if (isTabby) {
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.17 * scale, 0.015, 4, 8, Math.PI), tabbyStripe);
      stripe.position.set(-0.1 + i * 0.1, 0.15, 0);
      stripe.rotation.y = Math.PI / 2;
      g.add(stripe);
    }
  }

  g.userData = {
    head, tail, body,
    state: 'sleep',
    timer: 30 + Math.random() * 10,
    stretchProgress: 0,
    type: type
  };
  return g;
}

/* ================================================================
 *  [NEW] CHÓ
 * ================================================================ */
function buildDogMesh(isPuppy) {
  const furColor = isPuppy ? 0xe0bd76 : 0xc99a4a;
  const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.95 });
  const darkEarMat = new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.95 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1008 });

  const g = new THREE.Group();
  g.scale.setScalar(isPuppy ? 0.55 : 1.0);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 14), furMat);
  body.scale.set(0.9, 0.8, 1.4);
  body.position.set(0, 0.42, 0);
  body.castShadow = true;
  g.add(body);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.62, 0.55);
  g.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), furMat);
  headGroup.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), furMat);
  snout.scale.set(1, 0.8, 1.2);
  snout.position.set(0, -0.08, 0.22);
  headGroup.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), noseMat);
  nose.position.set(0, -0.08, 0.36);
  headGroup.add(nose);

  const eyeGeo = new THREE.SphereGeometry(0.032, 8, 6);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.09, 0.06, 0.18);
  headGroup.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.09, 0.06, 0.18);
  headGroup.add(eyeR);

  const earGeo = new THREE.SphereGeometry(0.11, 8, 6);
  const earL = new THREE.Mesh(earGeo, darkEarMat);
  earL.scale.set(0.6, 1.3, 0.4);
  earL.position.set(-0.18, 0.14, -0.05);
  headGroup.add(earL);
  const earR = earL.clone();
  earR.position.set(0.18, 0.14, -0.05);
  headGroup.add(earR);

  const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6);
  for (const [lx, lz] of [[-0.2, 0.32], [0.2, 0.32], [-0.2, -0.32], [0.2, -0.32]]) {
    const leg = new THREE.Mesh(legGeo, furMat);
    leg.position.set(lx, 0.2, lz);
    g.add(leg);
  }

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.55, -0.55);
  g.add(tailGroup);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.42, 6), furMat);
  tail.rotation.x = -0.6;
  tail.position.set(0, 0, -0.15);
  tailGroup.add(tail);

  g.userData.parts = { body, headGroup, tailGroup };
  return g;
}

function buildNpcMesh() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.9 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0b090, roughness: 0.9 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.0, 8), bodyMat);
  body.position.y = 0.95;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
  head.position.y = 1.62;
  g.add(head);

  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 8), bodyMat);
  legs.position.y = 0.28;
  g.add(legs);

  g.visible = false;
  return g;
}

/* ================================================================
 *  MAIN BUILD — tên export là buildPets
 * ================================================================ */
export function buildPets(pathfinder = null) {
  const group = new THREE.Group();
  group.name = 'pets';
  const interactives = [];
  const cats = [];
  const dogs = [];

  function findFreeSpot(x, z, radius = 2.0) {
    if (!pathfinder || typeof pathfinder.isAreaFree !== 'function') {
      return new THREE.Vector3(x, 0, z);
    }
    if (pathfinder.isAreaFree(x, z, 0.8, 0.8)) return new THREE.Vector3(x, 0, z);
    for (let d = 0.4; d <= radius; d += 0.4) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const nx = x + Math.cos(a) * d;
        const nz = z + Math.sin(a) * d;
        if (pathfinder.isAreaFree(nx, nz, 0.8, 0.8)) return new THREE.Vector3(nx, 0, nz);
      }
    }
    return new THREE.Vector3(x, 0, z);
  }

  /* ---------- CHÕNG TRE + 2 MÈO ---------- */
  const cotGroup = new THREE.Group();
  cotGroup.position.set(-1.5, 0, -2.5);
  cotGroup.rotation.y = 0.4;
  group.add(cotGroup);

  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xc9ad63, roughness: 0.72 });
  const bambooDarkMat = new THREE.MeshStandardMaterial({ color: 0x9d7f3d, roughness: 0.75 });

  const cotTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), bambooMat);
  cotTop.position.y = 0.5;
  cotTop.castShadow = true;
  cotTop.receiveShadow = true;
  cotGroup.add(cotTop);

  for (const [x, z] of [[0.7, 0.3], [-0.7, 0.3], [0.7, -0.3], [-0.7, -0.3]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 8), bambooDarkMat);
    leg.position.set(x, 0.25, z);
    leg.castShadow = true;
    cotGroup.add(leg);
  }

  const catTabby = createCat('tabby');
  catTabby.position.set(-0.3, 0.54, 0.1);
  catTabby.rotation.y = 0.5;
  catTabby.userData.action = 'meow';
  cotGroup.add(catTabby);
  interactives.push(catTabby);
  cats.push(catTabby);

  const catBritish = createCat('british');
  catBritish.position.set(0.4, 0.54, -0.1);
  catBritish.rotation.y = -0.8;
  catBritish.userData.action = 'purr';
  cotGroup.add(catBritish);
  interactives.push(catBritish);
  cats.push(catBritish);

  /* ---------- CHÓ CỎ ---------- */
  function createDog(isPuppy, pos) {
    const root = buildDogMesh(isPuppy);
    root.position.copy(pos);

    const pet = {
      root, kind: 'dog', isPuppy,
      pos: pos.clone(),
      yaw: rand(0, Math.PI * 2),
      state: 'sleeping',
      stateTimer: 0,
      happyTimer: 0,
      wagPhase: rand(0, Math.PI * 2),
      speed: 0.9,
      mother: null,
      puppies: [],
    };
    root.rotation.y = pet.yaw;

    pet.onPet = () => {
      for (const d of dogs) d.happyTimer = Math.max(d.happyTimer, 3.0);
      playWhine();
      setTimeout(() => playBark(0.07), 400);
    };

    root.traverse((o) => {
      o.userData.action = 'pet-dog';
      o.userData.pet = pet;
      o.userData.onPet = pet.onPet;
    });

    dogs.push(pet);
    group.add(root);
    interactives.push(root);
    return pet;
  }

  const nearWest = Math.random() < 0.5;
  const baseArea = nearWest ? WEST_GATE_AREA : EAST_KITCHEN_AREA;
  const motherPos = findFreeSpot(baseArea.x, baseArea.z, 3);
  const mother = createDog(false, motherPos);

  const puppyOffsets = [
    new THREE.Vector3(0.9, 0, 0.4),
    new THREE.Vector3(-0.7, 0, 0.7),
    new THREE.Vector3(0.15, 0, -0.75),
  ];
  for (const off of puppyOffsets) {
    const pp = findFreeSpot(motherPos.x + off.x, motherPos.z + off.z, 1.5);
    const pup = createDog(true, pp);
    pup.mother = mother;
    mother.puppies.push(pup);
  }

  /* ---------- NPC ---------- */
  const npc = {
    mesh: buildNpcMesh(),
    active: false,
    timer: rand(40, 70),
    pos: new THREE.Vector3(-11, 0, 3),
    speed: 1.8,
    barked: false,
  };
  group.add(npc.mesh);

  function triggerMotherBark() {
    mother.state = 'alert';
    mother.stateTimer = 2.0;
    playBark(0.12);
  }

  /* ---------- UPDATE MÈO ---------- */
  function updateCat(cat, dt, elapsed) {
    const u = cat.userData;
    const breath = Math.sin(elapsed * 2 + (u.type === 'tabby' ? 0 : 1.5)) * 0.03;
    cat.scale.set(1 + breath * 0.5, 1 + breath, 1 + breath * 0.5);

    if (Math.random() < 0.02) {
      u.tail.rotation.z = 0.5 + (Math.random() - 0.5) * 0.8;
    }
    u.tail.rotation.z += (0.5 - u.tail.rotation.z) * dt * 2;

    u.timer -= dt;
    if (u.state === 'sleep' && u.timer <= 0) {
      u.state = 'stretch';
      u.stretchProgress = 0;
    }

    if (u.state === 'stretch') {
      u.stretchProgress += dt;
      const p = Math.min(u.stretchProgress / 2.0, 1);
      const stretchCurve = Math.sin(p * Math.PI);
      cat.rotation.x = -stretchCurve * 0.4;
      cat.position.y = 0.54 + stretchCurve * 0.1;
      u.head.rotation.x = -stretchCurve * 0.5;

      if (u.stretchProgress >= 2.0) {
        u.state = 'sleep';
        u.timer = 30 + Math.random() * 10;
        cat.rotation.x = 0;
        cat.position.y = 0.54;
        u.head.rotation.x = 0;
      }
    }
  }

  /* ---------- UPDATE CHÓ ---------- */
  function updateDog(dog, dt, elapsed) {
    dog.happyTimer = Math.max(0, dog.happyTimer - dt);

    if (dog.state === 'alert') {
      dog.stateTimer -= dt;
      if (dog.stateTimer <= 0) dog.state = 'sleeping';
    }

    if (dog.isPuppy && dog.mother && dog.state !== 'alert') {
      const d = dog.pos.distanceTo(dog.mother.pos);
      if (d > 2.2) {
        const dir = dog.mother.pos.clone().sub(dog.pos).normalize();
        dog.pos.addScaledVector(dir, dog.speed * dt);
        const targetYaw = Math.atan2(dir.x, dir.z);
        dog.yaw = lerpAngle(dog.yaw, targetYaw, Math.min(1, 6 * dt));
      }
    }

    dog.root.position.set(dog.pos.x, 0, dog.pos.z);
    dog.root.rotation.y = dog.yaw;

    const parts = dog.root.userData.parts;
    if (parts && parts.tailGroup) {
      const happy = dog.happyTimer > 0 || dog.state === 'alert';
      if (happy) {
        dog.wagPhase += dt * 22;
        parts.tailGroup.rotation.y = Math.sin(dog.wagPhase) * 0.7;
      } else {
        dog.wagPhase += dt * 3;
        parts.tailGroup.rotation.y = Math.sin(dog.wagPhase) * 0.1;
      }
    }
  }

  /* ---------- UPDATE NPC ---------- */
  function updateNPC(dt) {
    if (!npc.active) {
      npc.timer -= dt;
      if (npc.timer <= 0) {
        npc.active = true;
        npc.barked = false;
        npc.pos.set(-11, 0, 2);
        npc.mesh.position.copy(npc.pos);
        npc.mesh.rotation.y = 0;
        npc.mesh.visible = true;
      }
      return;
    }
    npc.pos.z += npc.speed * dt;
    npc.mesh.position.copy(npc.pos);

    if (!npc.barked && npc.pos.z > 9 && npc.pos.z < 15) {
      npc.barked = true;
      triggerMotherBark();
    }
    if (npc.pos.z > 21) {
      npc.active = false;
      npc.mesh.visible = false;
      npc.timer = rand(50, 90);
    }
  }

  /* ---------- UPDATE ---------- */
  function update(dt, elapsed, dayCount) {
    for (const cat of cats) updateCat(cat, dt, elapsed);
    for (const dog of dogs) updateDog(dog, dt, elapsed);
    updateNPC(dt);
  }

  function onNewDay() {
    for (const d of dogs) d.happyTimer = 2.0;
    playBark(0.06);
  }

  return {
    group,
    interactives,
    update,
    onNewDay,
    playMeow,
    playPurr,
    cats,
    dogs,
  };
}

export default buildPets;