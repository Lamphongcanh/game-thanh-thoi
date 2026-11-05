import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildVietnameseHouse } from './house.js';
import { buildGarden } from './garden.js';
import { buildPonds } from './pond.js';
import { buildPath } from './path.js';
import { buildWalls } from './walls.js';
import { buildPlayer } from './player.js';
import { buildProps } from './props.js';
import { buildPets as buildCats } from './pets.js';
import { buildChickens } from './chickens.js';
import { buildButterflies } from './butterflies.js';
import { buildFireflies } from './fireflies.js';
import { buildSky } from './sky.js';
import { buildInterior } from './interior.js';

/* ═══════════════════════════════════════════════════════════════
   RENDERER / SCENE / CAMERA
   ═══════════════════════════════════════════════════════════════ */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xb8c8d0, 30, 70);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
camera.position.set(8.5, 6.5, 12.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, -1);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 26;
controls.minPolarAngle = 0.30;
controls.maxPolarAngle = Math.PI / 2 - 0.08;

/* ═══════════════════════════════════════════════════════════════
   ÁNH SÁNG
   ═══════════════════════════════════════════════════════════════ */
scene.add(new THREE.HemisphereLight(0xd4e2ec, 0x6b5038, 0.85));

const sun = new THREE.DirectionalLight(0xffd7a3, 2.5);
sun.position.set(14, 18, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
const sc = sun.shadow.camera;
sc.left = -20; sc.right = 20; sc.top = 20; sc.bottom = -20;
sc.near = 0.5; sc.far = 55;
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x9ec2e8, 0.4);
fill.position.set(-12, 8, -10);
scene.add(fill);

/* ═══════════════════════════════════════════════════════════════
   MUTE / AUDIO
   ═══════════════════════════════════════════════════════════════ */
const clockEl = document.getElementById('clock');   
let isMuted = false;
const musicBtn = document.getElementById('music-toggle');
window.GAME_MUTED = false;

let nhacnenStarted = false;
const nhacnen = new Audio('./assets/audio/nhacnen.mp3');
nhacnen.loop = true;
nhacnen.volume = 0.5;

window.addEventListener('pointerdown', () => {
  if (!nhacnenStarted) {
    nhacnen.play().catch(() => {});
    nhacnenStarted = true;
  }
}, { once: true });

if (musicBtn) {
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    window.GAME_MUTED = isMuted;
    nhacnen.muted = isMuted;
    if (isMuted) nhacnen.pause();
    else if (nhacnenStarted) nhacnen.play().catch(() => {});
    musicBtn.innerText = isMuted ? '🔇' : '🔊';
  });
}

/* ═══════════════════════════════════════════════════════════════
   NỀN SÂN GẠCH
   ═══════════════════════════════════════════════════════════════ */
function makeBrickTexture() {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#9a9086';
  ctx.fillRect(0, 0, S, S);
  const rows = 8, cols = 4;
  const bh = S / rows, bw = S / cols;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) ? bw * 0.5 : 0;
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + off + 3, y = r * bh + 3, w = bw - 6, h = bh - 6;
      ctx.fillStyle = `hsl(${10 + Math.random() * 12}, ${36 + Math.random() * 18}%, ${30 + Math.random() * 14}%)`;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,235,215,0.06)';
      ctx.fillRect(x, y, w, h * 0.35);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(18, 18);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ map: makeBrickTexture(), roughness: 0.96 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ═══════════════════════════════════════════════════════════════
   BẦU TRỜI & CÁC MODULE
   ═══════════════════════════════════════════════════════════════ */
const sky = buildSky();
scene.add(sky.dome);

const house = buildVietnameseHouse();
scene.add(house.group);

const garden = buildGarden({ camera, renderer });
scene.add(garden.group);

const ponds = buildPonds();
scene.add(ponds.group);

const path = buildPath();
scene.add(path);

let walls = null;
try { walls = buildWalls(); scene.add(walls.group); } catch (e) { console.warn('walls.js:', e); }

const props = buildProps();
scene.add(props.group);

const cats = buildCats();
scene.add(cats.group);

const chickens = buildChickens();
scene.add(chickens.group);

const butterflies = buildButterflies();
scene.add(butterflies.group);

const fireflies = buildFireflies();
scene.add(fireflies.group);

const player = buildPlayer();
scene.add(player.group);

const interior = buildInterior();
scene.add(interior.group);
interior.group.visible = false;

/* ═══════════════════════════════════════════════════════════════
   VỊ TRÍ CỐ ĐỊNH CHO INTERACT
   ═══════════════════════════════════════════════════════════════ */
const BENCH_POS = new THREE.Vector3(-2.8, 0, 1.5);
const BENCH_ROT = 0.5;
const BENCH_APPROACH = new THREE.Vector3(-2.8, 0, 2.5);
const TEAPOT_POS = new THREE.Vector3(0, 0, 1.5);
const EXIT_DOOR_POS = new THREE.Vector3(0, 0, 6);
const ENTER_HOUSE_HOTSPOT = new THREE.Vector3(0, 0, -3.5);
const KITCHEN_DOOR_POS = new THREE.Vector3(9.5, 0, 1.5); // Cửa bếp hướng ra sân (do bếp xoay)

/* ═══════════════════════════════════════════════════════════════
   FADE OVERLAY
   ═══════════════════════════════════════════════════════════════ */
const fadeOverlay = document.createElement('div');
fadeOverlay.style.cssText = `
  position:fixed; inset:0; background:#000; z-index:999;
  opacity:0; pointer-events:none; transition:opacity 0.8s ease;
`;
document.body.appendChild(fadeOverlay);

function fadeTo(cb) {
  fadeOverlay.style.pointerEvents = 'all';
  fadeOverlay.style.opacity = '1';
  setTimeout(() => {
    if (cb) cb();
    fadeOverlay.style.opacity = '0';
    setTimeout(() => { fadeOverlay.style.pointerEvents = 'none'; }, 800);
  }, 800);
}

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
const gameState = {
  insideHouse: false,
  insideKitchen: false,
  nearBench: false,
  nearDoor: false,
  cinematicActive: false,
  cinematic: {
    startPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    t: 0,
    duration: 7,
  },
  dayCycle: 0,
  isDay: true,
};

/* ═══════════════════════════════════════════════════════════════
   HINT BANNER
   ═══════════════════════════════════════════════════════════════ */
const hintBanner = document.createElement('div');
hintBanner.style.cssText = `
  position:fixed; left:50%; bottom:80px; transform:translateX(-50%);
  background:rgba(16,18,22,0.82); color:#f4ece1; padding:10px 20px;
  border-radius:10px; font:14px/1.3 ui-sans-serif,system-ui,sans-serif;
  pointer-events:none; opacity:0; transition:opacity 0.3s;
  border:1px solid rgba(255,220,170,0.3); z-index:100;
`;
document.body.appendChild(hintBanner);

let hintTimer = null;
function showHint(text, duration = 2500) {
  hintBanner.textContent = text;
  hintBanner.style.opacity = '1';
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => { hintBanner.style.opacity = '0'; }, duration);
}

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC CAMERA
   ═══════════════════════════════════════════════════════════════ */
function enterCinematic() {
  if (gameState.cinematicActive) return;
  controls.enabled = false;
  gameState.cinematic.startPos.copy(camera.position);
  gameState.cinematic.startTarget.copy(controls.target);

  const px = player.root.position.x;
  const pz = player.root.position.z;
  const sunPos = sun.position;
  const dir = new THREE.Vector3(sunPos.x - px, 0, sunPos.z - pz).normalize();

  gameState.cinematic.endPos.set(px - dir.x * 6, 3.5, pz - dir.z * 6);
  gameState.cinematic.endTarget.set(px + dir.x * 20, 2.5, pz + dir.z * 20);

  gameState.cinematic.t = 0;
  gameState.cinematicActive = true;
}

function exitCinematic() {
  if (!gameState.cinematicActive) return;
  gameState.cinematicActive = false;
  controls.enabled = true;
  controls.target.set(player.root.position.x, 1.4, player.root.position.z);
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVES
   ═══════════════════════════════════════════════════════════════ */
let interactives = [];

const enterHotspot = new THREE.Mesh(
  new THREE.BoxGeometry(3, 4, 1.5),
  new THREE.MeshBasicMaterial({ visible: false })
);
enterHotspot.position.copy(ENTER_HOUSE_HOTSPOT);
enterHotspot.position.y = 2;
enterHotspot.userData.action = 'enter-house';
scene.add(enterHotspot);

const kitchenHotspot = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 3, 1.5),
  new THREE.MeshBasicMaterial({ visible: false })
);
kitchenHotspot.position.copy(KITCHEN_DOOR_POS);
kitchenHotspot.position.y = 1.5;
kitchenHotspot.userData.action = 'enter-kitchen';
scene.add(kitchenHotspot);

const exitKitchenHotspot = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 3, 1.5),
  new THREE.MeshBasicMaterial({ visible: false })
);
exitKitchenHotspot.position.set(9.5, 1.5, -1.5);
exitKitchenHotspot.userData.action = 'exit-kitchen';
scene.add(exitKitchenHotspot);

function rebuildInteractives() {
  interactives = [];
  if (gameState.insideHouse) {
    interactives.push(...interior.interactives);
  } else if (gameState.insideKitchen) {
    interactives.push(exitKitchenHotspot);
  } else {
    interactives.push(...garden.interactives);
    interactives.push(...cats.interactives);
    if (props && props.interactives) interactives.push(...props.interactives);
    if (house && house.interactives) interactives.push(...house.interactives);
    
    chickens.group.userData.action = 'feed-chickens';
    interactives.push(chickens.group);
    interactives.push(enterHotspot);
    interactives.push(kitchenHotspot);
  }
}
rebuildInteractives();

/* ═══════════════════════════════════════════════════════════════
   ENTER / EXIT HOUSE & KITCHEN
   ═══════════════════════════════════════════════════════════════ */
function enterHouse() {
  if (gameState.insideHouse) return;
  exitCinematic();
  player.standUp();
  fadeTo(() => {
    gameState.insideHouse = true;
    interior.group.visible = true;
    interior.setKitchenInteriorVisible(false);  
    
    house.group.visible = false;
    garden.group.visible = false;
    ponds.group.visible = false;
    path.visible = false;
    if (walls) walls.group.visible = false;
    props.group.visible = false;
    cats.group.visible = false;
    chickens.group.visible = false;
    butterflies.group.visible = false;
    fireflies.group.visible = false;

    player.root.position.set(0, 0, 0); 
    player.root.rotation.y = Math.PI;
    
    camera.position.set(0, 2.2, 2);
    controls.target.set(0, 1.5, -5);
    
    controls.minDistance = 2;
    controls.maxDistance = 10;
    rebuildInteractives();
  });
}

function exitHouse() {
  if (!gameState.insideHouse) return;
  exitCinematic();
  player.standUp();
  fadeTo(() => {
    gameState.insideHouse = false;
    interior.group.visible = false;
    
    house.group.visible = true;
    garden.group.visible = true;
    ponds.group.visible = true;
    path.visible = true;
    if (walls) walls.group.visible = true;
    props.group.visible = true;
    cats.group.visible = true;
    chickens.group.visible = true;
    butterflies.group.visible = true;
    fireflies.group.visible = true;

    player.root.position.set(0, 0, 4);
    player.root.rotation.y = 0;
    
    camera.position.set(8.5, 6.5, 12.5);
    controls.target.set(0, 1.4, -1);
    
    controls.minDistance = 5;
    controls.maxDistance = 26;
    rebuildInteractives();
  });
}

function enterKitchen() {
  if (gameState.insideKitchen) return;
  exitCinematic();
  player.standUp();
  fadeTo(() => {
    gameState.insideKitchen = true;
    interior.group.visible = true;
    interior.setKitchenInteriorVisible(true);
    
    house.setKitchenWallVisible(false); // Ẩn tường che
    
    house.group.visible = false; 
    garden.group.visible = false; 
    ponds.group.visible = false; 
    path.visible = false; 
    if (walls) walls.group.visible = false;
    props.group.visible = false; 
    cats.group.visible = false; 
    chickens.group.visible = false; 
    butterflies.group.visible = false; 
    fireflies.group.visible = false;

    player.root.position.set(9.5, 0, -1.5); 
    player.root.rotation.y = -Math.PI / 2;
    
    camera.position.set(9.5, 2.2, -1.5); 
    controls.target.set(9.5, 1.5, -3.5);
    
    controls.minDistance = 2;
    controls.maxDistance = 10;
    rebuildInteractives();
  });
}

function exitKitchen() {
  if (!gameState.insideKitchen) return;
  exitCinematic();
  player.standUp();
  fadeTo(() => {
    gameState.insideKitchen = false;
    interior.group.visible = false;
    
    house.setKitchenWallVisible(true); // Hiện lại tường
    
    house.group.visible = true; 
    garden.group.visible = true; 
    ponds.group.visible = true; 
    path.visible = true; 
    if (walls) walls.group.visible = true;
    props.group.visible = true; 
    cats.group.visible = true; 
    chickens.group.visible = true; 
    butterflies.group.visible = true; 
    fireflies.group.visible = true;

    player.root.position.set(9.5, 0, 2.5); 
    player.root.rotation.y = Math.PI / 2;
    
    camera.position.set(8.5, 6.5, 12.5); 
    controls.target.set(0, 1.4, -1);
    
    controls.minDistance = 5;
    controls.maxDistance = 26;
    rebuildInteractives();
  });
}

/* ═══════════════════════════════════════════════════════════════
   E KEY HANDLER
   ═══════════════════════════════════════════════════════════════ */
addEventListener('keydown', (e) => {
  if (e.code !== 'KeyE') return;
  e.preventDefault();

  if (gameState.cinematicActive) {
    exitCinematic();
    player.standUp();
    return;
  }
  if (typeof garden.setRockingOccupied === 'function') {
    garden.setRockingOccupied(false);
  }
  if (player.state.mode === 'drinking') {
    player.standUp(); showHint('Đứng dậy'); return;
  }
  if (player.isHoldingCandle()) {
    player.standUp(); showHint('Cất nến'); return;
  }
  if (player.state.mode === 'sitting' || player.state.mode === 'fanning') {
    player.standUp(); showHint('Đứng dậy'); return;
  }

  if (gameState.insideHouse) {
    const d = player.getPosition().distanceTo(EXIT_DOOR_POS);
    if (d < 2) {
      player.moveTo(new THREE.Vector3(0, 0, 4.8), () => exitHouse());
      return;
    }
    return;
  }

  if (gameState.insideKitchen) {
    const d = player.getPosition().distanceTo(new THREE.Vector3(9.5, 0, 1.5));
    if (d < 2) {
      player.moveTo(new THREE.Vector3(9.5, 0, 2.5), () => exitKitchen());
      return;
    }
    return;
  }

  const distBench = player.getPosition().distanceTo(BENCH_POS);
  if (distBench < 2.5) {
    player.moveTo(BENCH_APPROACH, () => {
      player.sit(BENCH_POS, BENCH_ROT);
      showHint('Đã ngồi chõng tre');
    });
    return;
  }

  if (!gameState.isDay) {
    player.holdCandle();
    showHint('Đã cầm nến. Click vào đèn để thắp sáng. Nhấn E để cất.');
    return;
  }

  showHint('Không có gì để tương tác ở đây');
});

/* ═══════════════════════════════════════════════════════════════
   CONTEXT MENU CHO CHIẾU TRE (#mat-menu)
   ═══════════════════════════════════════════════════════════════ */
const matMenuEl = document.getElementById('mat-menu');
let currentMat = null;

function openMatMenu(clientX, clientY, matMesh) {
  if (!matMenuEl) return;
  currentMat = matMesh;
  matMenuEl.style.left = clientX + 'px';
  matMenuEl.style.top = (clientY - 12) + 'px';
  matMenuEl.classList.add('show');
}

function closeMatMenu() {
  if (!matMenuEl) return;
  matMenuEl.classList.remove('show');
  currentMat = null;
}

document.addEventListener('pointerdown', (e) => {
  if (matMenuEl && !matMenuEl.contains(e.target)) closeMatMenu();
});

if (matMenuEl) {
  matMenuEl.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (!currentMat) return;

      if (action === 'lie') {
        const mp = currentMat.userData.pos || currentMat.position;
        player.moveTo(mp.clone(), () => {
          player.sit(mp, 0);
          showHint('Đang nằm nghỉ trên chiếu');
        });
        closeMatMenu();
      } else if (action === 'roll') {
        if (typeof garden.removePlacedMat === 'function' &&
            garden.removePlacedMat(currentMat)) {
          showHint('Đã cuộn chiếu cất đi');
        } else {
          currentMat.visible = false;
          showHint('Đã cất chiếu');
        }
        closeMatMenu();
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   RAYCASTING + CLICK
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   LOGIC SỔ TAY (ESC) & ÂM LƯỢNG AN TOÀN
   ═══════════════════════════════════════════════════════════════ */
(function initNotepadUI() {
  const notepadOverlay = document.getElementById('notepad-overlay');
  const closeNotepadBtn = document.getElementById('close-notepad-btn');

  // 1. Hàm bật/tắt Sổ Tay
  function toggleNotepad() {
    if (!notepadOverlay) return;
    notepadOverlay.classList.toggle('show');
  }

  // 2. Bắt sự kiện phím ESC
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      toggleNotepad();
    }
  });

  // 3. Nút "Tiếp tục chơi"
  if (closeNotepadBtn) {
    closeNotepadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotepad();
    });
  }

  // 4. Thanh trượt âm lượng Nhạc nền
  const volBgm = document.getElementById('volume-bgm');
  if (volBgm && typeof nhacnen !== 'undefined') {
    volBgm.value = nhacnen.volume * 100;
    volBgm.addEventListener('input', (e) => {
      nhacnen.volume = e.target.value / 100;
    });
  }

  // 5. Thanh trượt SFX (Tạm thời không can thiệp sâu để tránh lỗi crash)
  const volSfx = document.getElementById('volume-sfx');
  if (volSfx) {
    volSfx.addEventListener('input', (e) => {
      console.log("Mức âm lượng SFX:", e.target.value + "%");
    });
  }
})();
   
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pickHit(clientX, clientY) {
  pointer.x = (clientX / innerWidth) * 2 - 1;
  pointer.y = -(clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactives, true);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && !o.userData.action) o = o.parent;
  return o ? { obj: o, action: o.userData.action, point: hits[0].point } : null;
}

let downPos = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved > 6) return;

  if (typeof garden.setRockingOccupied === 'function') {
    garden.setRockingOccupied(false);
  }
  if (gameState.cinematicActive) { exitCinematic(); return; }

  const hit = pickHit(e.clientX, e.clientY);
  
  if (hit && hit.action === 'placed-mat') {
    openMatMenu(e.clientX, e.clientY, hit.obj);
    return;
  }

  if (!hit) {
    if (gameState.insideHouse || gameState.insideKitchen) return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const g = raycaster.intersectObject(ground, false);
    if (g.length) {
      player.interrupt();
      player.moveTo(g[0].point);
    }
    return;
  }

  const approach = hit.point.clone();
  const dir = new THREE.Vector3()
    .subVectors(player.getPosition(), approach).setY(0);
  if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
  dir.normalize();
  const approachPos = approach.clone().addScaledVector(dir, 0.9);

  switch (hit.action) {
    case 'sit-table': {
      const cp = hit.obj.userData.chairPos;
      const cr = hit.obj.userData.chairRot;
      const dirBack = new THREE.Vector3(Math.sin(cr), 0, Math.cos(cr)).multiplyScalar(-0.8);
      const approachChair = cp.clone().add(dirBack);
      player.moveTo(approachChair, () => {
        player.drinkTea(cp, cr, (sip) => {
          if (sip === 1) enterCinematic();
        });
      });
      break;
    }
    case 'pour': {
      player.moveTo(approachPos, () => {
        let nearestChair = null;
        let minDist = Infinity;
        for (const c of garden.interactives) {
          if (c.userData.action === 'sit-table') {
            const d = player.getPosition().distanceTo(c.userData.chairPos);
            if (d < minDist) { minDist = d; nearestChair = c; }
          }
        }
        if (nearestChair) {
          const cp = nearestChair.userData.chairPos;
          const cr = nearestChair.userData.chairRot;
          player.moveTo(cp, () => {
            garden.playPour();
            player.drinkTea(cp, cr, (sip) => {
              if (sip === 1) enterCinematic();
            });
          });
        }
      });
      break;
    }
    case 'radio': player.moveTo(approachPos, () => garden.toggleRadio()); break;
    case 'meow': player.moveTo(approachPos, () => { player.pet(); cats.playMeow(); }); break;
    case 'purr': player.moveTo(approachPos, () => { player.pet(); cats.playPurr(); }); break;
    case 'pet-dog': {
      player.moveTo(approachPos, () => {
        player.pet();
        if (hit.obj.userData.onPet) hit.obj.userData.onPet();
      });
      break;
    }
    case 'sit': player.moveTo(approachPos, () => player.sit(hit.obj.position, hit.obj.rotation.y)); break;
    case 'sit-rocking': {
      const sp = hit.obj.userData.seatPos;
      const sr = hit.obj.userData.seatRot;
      player.moveTo(approachPos, () => {
        player.sit(sp, sr);
        garden.setRockingOccupied(true);
        showHint('Đang đung đưa ghế bập bênh');
      });
      break;
    }
    case 'fan': player.moveTo(BENCH_APPROACH, () => player.fanPalm(BENCH_POS, BENCH_ROT)); break;
    case 'candy': player.moveTo(approachPos); break;
    case 'sweep': player.moveTo(approachPos, () => player.sweep()); break;
    case 'scoop': player.moveTo(approachPos); break;
    case 'feed-chickens':
      player.moveTo(approachPos, () => {
        player.feed();
        const t = approach.clone().addScaledVector(dir, -0.5);
        chickens.dropSeeds(t);
      });
      break;
    case 'light-lamp': {
      if (!player.isHoldingCandle()) { showHint('Cần cầm nến (nhấn E khi trời tối)'); break; }
      player.moveTo(approachPos, () => {
        const idx = hit.obj.userData.lampIndex;
        if (typeof props.lightLamp === 'function') props.lightLamp(idx);
        showHint('Đèn đã thắp sáng');
      });
      break;
    }
    case 'enter-house': player.moveTo(new THREE.Vector3(0, 0, -2), () => enterHouse()); break;
    case 'enter-kitchen': player.moveTo(new THREE.Vector3(9.5, 0, 1.5), () => enterKitchen()); break;
    case 'exit-house': player.moveTo(new THREE.Vector3(0, 0, 4.8), () => exitHouse()); break;
    case 'exit-kitchen': player.moveTo(new THREE.Vector3(9.5, 0, 2.5), () => exitKitchen()); break;
    case 'incense':
      player.moveTo(new THREE.Vector3(0, 0, -4.5), () => {
        player.pet();
        interior.lightIncense();
      });
      break;
    case 'lie-bed':
      player.moveTo(new THREE.Vector3(-6.5, 0, -1), () => {
        player.sit(new THREE.Vector3(-6.5, 0, -1), Math.PI / 2);
      });
      break;
    case 'cook':
      player.moveTo(new THREE.Vector3(6, 0, 3), () => {
        player.pet();
        interior.igniteFire();
      });
      break;
    case 'toggle-curtain': {
      player.moveTo(approachPos, () => {
        const roomId = hit.obj.userData.roomId;
        const isOpen = interior.toggleCurtain(roomId);
        showHint(isOpen ? 'Đã vén rèm' : 'Đã buông rèm');
      });
      break;
    }
    case 'toggle-ac': {
      player.moveTo(approachPos, () => {
        const on = interior.toggleAC();
        showHint(on ? 'Điều hòa: BẬT' : 'Điều hòa: TẮT');
      });
      break;
    }
    case 'sit-indoor': {
      const sp = hit.obj.userData.seatPos;
      const sr = hit.obj.userData.seatRot;
      const chairApproach = new THREE.Vector3(sp.x + Math.sin(sr) * 0.7, 0, sp.z + Math.cos(sr) * 0.7);
      player.moveTo(chairApproach, () => { player.sit(sp, sr); showHint('Đã ngồi ghế'); });
      break;
    }
    case 'sleep-bed': {
      const bp = hit.obj.userData.bedPos;
      const br = hit.obj.userData.bedRot;
      const bedApproach = new THREE.Vector3(bp.x, 0, bp.z + 1.0);
      player.moveTo(bedApproach, () => { player.sit(bp, br); showHint('Đã nằm giường'); });
      break;
    }
    case 'pickup-mat': {
      player.moveTo(approachPos, () => { showHint('Đã nhặt chiếu tre'); });
      break;
    }
  }
});

renderer.domElement.addEventListener('pointermove', (e) => {
  if (e.buttons !== 0) return;
  const hit = pickHit(e.clientX, e.clientY);
  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
});

/* ═══════════════════════════════════════════════════════════════
   DAY / NIGHT CYCLE
   ═══════════════════════════════════════════════════════════════ */
const DAY_DURATION = 60 * 60;

function updateDayNight(t) {
  const cycle = (t % DAY_DURATION) / DAY_DURATION;
  gameState.dayCycle = cycle;
  const sunAngle = cycle * Math.PI * 2;
  const sunDist = 25;
  const sunY = Math.sin(sunAngle) * sunDist;
  const sunX = Math.cos(sunAngle) * sunDist;
  sun.position.set(sunX, Math.max(sunY, 1), 10);
  sun.intensity = Math.max(0.3, Math.min(2.5, sunY / sunDist * 2 + 0.5));
  gameState.isDay = sunY > 0;

  if (sky && sky.update) {
    sky.update(sunY, sunDist, scene.fog, camera);
  }
}

/* ═══════════════════════════════════════════════════════════════
   VÒNG LẶP
   ═══════════════════════════════════════════════════════════════ */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  updateDayNight(t);
  
  if (clockEl) {
    const totalMinutes = Math.floor(gameState.dayCycle * 24 * 60);
    const hh = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}`;
  }

  player.update(dt, t);

  if (!gameState.insideHouse && !gameState.insideKitchen) {
    const distBench = player.getPosition().distanceTo(BENCH_POS);
    gameState.nearBench = distBench < 2.5;
  }
  gameState.nearDoor = gameState.insideHouse && player.getPosition().distanceTo(EXIT_DOOR_POS) < 2;

  if (gameState.cinematicActive) {
    gameState.cinematic.t += dt;
    const k = Math.min(gameState.cinematic.t / gameState.cinematic.duration, 1);
    const e = k * k * (3 - 2 * k);
    camera.position.lerpVectors(gameState.cinematic.startPos, gameState.cinematic.endPos, e);
    controls.target.lerpVectors(gameState.cinematic.startTarget, gameState.cinematic.endTarget, e);
    camera.lookAt(controls.target);

    if (gameState.cinematic.t >= gameState.cinematic.duration) {
      exitCinematic();
    }
  }

  if (!gameState.insideHouse && !gameState.insideKitchen) {
    garden.update(dt, t);
    ponds.update(dt, t);
    const dayCount = Math.floor(t / DAY_DURATION);
    cats.update(dt, t, dayCount);
    chickens.update(dt, t);
    butterflies.update(dt, t, gameState.isDay);
    fireflies.update(dt, t, gameState.isDay);
    if (props && props.update) props.update(dt, t, gameState.isDay, Math.sin(gameState.dayCycle * Math.PI * 2));
    if (house.update) house.update(dt, t);
  } else {
    interior.update(dt, t);
  }

  controls.update();
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();

requestAnimationFrame(() => {
  const l = document.getElementById('loader');
  if (l) { l.classList.add('hidden'); setTimeout(() => l.remove(), 800); }
});
setTimeout(() => {
  const h = document.getElementById('hint');
  if (h) h.style.opacity = '0';
}, 14000);