import * as THREE from 'three';

export function buildPlayer() {
  const group = new THREE.Group();
  group.name = 'player';

  /* ── Materials ── */
  const skinMat    = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.8 });
  const shirtMat   = new THREE.MeshStandardMaterial({ color: 0x8ba888, roughness: 0.9 });
  const shortsMat  = new THREE.MeshStandardMaterial({ color: 0xcdbf9e, roughness: 0.9 });
  const hairMat    = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8 });
  const shoeMat    = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9 });
  const hatMat     = new THREE.MeshStandardMaterial({ color: 0xd4b878, roughness: 0.9, side: THREE.DoubleSide });
  const fanMat     = new THREE.MeshStandardMaterial({ color: 0xd4a878, roughness: 0.9, side: THREE.DoubleSide });

  /* ── Root ── */
  const root = new THREE.Group();
  root.position.set(0, 0, 3.5);
  root.rotation.y = Math.PI;
  group.add(root);

  /* ── Torso + head ── */
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.55, 8), shirtMat);
  torso.position.y = 1.0;
  torso.castShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), skinMat);
  head.position.y = 1.45;
  head.castShadow = true;
  root.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), hairMat);
  hair.position.y = 1.47;
  root.add(hair);

  const hat = new THREE.Group();
  hat.position.y = 1.56;
  hat.add(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 12, 1, true), hatMat));
  root.add(hat);

  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    eye.position.set(sx * 0.055, 1.47, 0.13);
    root.add(eye);
  }

  /* ── Arms ── */
  function buildArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.24, 1.23, 0);

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.3, 6), shirtMat);
    upper.position.y = -0.15;
    upper.castShadow = true;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.y = -0.3;
    shoulder.add(elbow);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.3, 6), skinMat);
    lower.position.y = -0.15;
    lower.castShadow = true;
    elbow.add(lower);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), skinMat);
    hand.position.y = -0.32;
    elbow.add(hand);

    return { shoulder, elbow, hand };
  }
  const leftArm  = buildArm(-1);
  const rightArm = buildArm(1);
  root.add(leftArm.shoulder);
  root.add(rightArm.shoulder);

  /* ── Quạt mo cau (cho state fanning) ── */
  const fan = new THREE.Mesh(new THREE.CircleGeometry(0.14, 8, 0, Math.PI), fanMat);
  fan.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  fan.position.y = -0.35;
  fan.visible = false;
  rightArm.elbow.add(fan);

  /* ── Chén trà (cho state drinking) ── */
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.04, 0.05, 10),
    new THREE.MeshStandardMaterial({ color: 0xeae4d6, roughness: 0.4 }));
  cup.position.y = -0.35;
  cup.visible = false;
  rightArm.elbow.add(cup);

  /* ── Nến (cho state holdingCandle) ── */
  const candle = new THREE.Group();
  candle.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.022, 0.14, 8),
    new THREE.MeshStandardMaterial({ color: 0xf4e8d0, roughness: 0.85 })));
  const flameMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.015, 0.045, 6),
    new THREE.MeshBasicMaterial({ color: 0xffcc44 }));
  flameMesh.position.y = 0.09;
  candle.add(flameMesh);
  const candleLight = new THREE.PointLight(0xffaa44, 1.0, 3.5);
  candleLight.position.y = 0.12;
  candle.add(candleLight);
  candle.position.y = -0.08;
  candle.visible = false;
  rightArm.hand.add(candle);

  /* ── Legs ── */
  function buildLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.08, 0.72, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.35, 6), shortsMat);
    thigh.position.y = -0.17;
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.35;
    hip.add(knee);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.35, 6), skinMat);
    shin.position.y = -0.17;
    shin.castShadow = true;
    knee.add(shin);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.22), shoeMat);
    foot.position.set(0, -0.35, 0.05);
    foot.castShadow = true;
    knee.add(foot);

    return { hip, knee };
  }
  const leftLeg  = buildLeg(-1);
  const rightLeg = buildLeg(1);
  root.add(leftLeg.hip);
  root.add(rightLeg.hip);

  /* ── State machine ── */
  const state = {
    mode: 'idle',
    target: null,
    onArrive: null,
    walkPhase: 0,
    actionTimer: 0,
    snapPos: null,
    snapRot: null,
    nextSip: 0,
    sipCount: 0,
    onSip: null,
  };

  function resetPose() {
    leftArm.shoulder.rotation.set(0, 0, 0);
    rightArm.shoulder.rotation.set(0, 0, 0);
    leftArm.elbow.rotation.set(0, 0, 0);
    rightArm.elbow.rotation.set(0, 0, 0);
    leftLeg.hip.rotation.set(0, 0, 0);
    rightLeg.hip.rotation.set(0, 0, 0);
    leftLeg.knee.rotation.set(0, 0, 0);
    rightLeg.knee.rotation.set(0, 0, 0);
    root.position.y = 0;
    root.rotation.x = 0;
    fan.visible = false;
    cup.visible = false;
    candle.visible = false;
  }

  /* ── Public methods ── */
  function moveTo(pos, onArrive) {
    if (!pos) return;
    state.mode = 'walking';
    state.target = new THREE.Vector3(pos.x, 0, pos.z);
    state.onArrive = onArrive || null;
    state.walkPhase = 0;
    resetPose();
  }

  function sit(chairPos, chairRot) {
    state.mode = 'sitting';
    state.actionTimer = 0;
    resetPose();
    state.snapPos = chairPos.clone();
    state.snapRot = chairRot;
  }

  function standUp() {
    state.mode = 'idle';
    resetPose();
  }

  function drinkTea(chairPos, chairRot, onSip) {
    state.mode = 'drinking';
    state.actionTimer = 0;
    state.nextSip = 1.5;
    state.sipCount = 0;
    state.onSip = onSip || null;
    state.snapPos = chairPos.clone();
    state.snapRot = chairRot;
    resetPose();
  }

  function holdCandle() {
    state.mode = 'holdingCandle';
    state.actionTimer = 0;
    state.walkPhase = 0;
    resetPose();
    candle.visible = true;
  }

  function fanPalm(chairPos, chairRot) {
    state.mode = 'fanning';
    state.actionTimer = 0;
    resetPose();
    state.snapPos = chairPos.clone();
    state.snapRot = chairRot;
  }

  function pet() { state.mode = 'petting'; state.actionTimer = 0; resetPose(); }
  function feed() { state.mode = 'feeding'; state.actionTimer = 0; resetPose(); }
  function sweep() { state.mode = 'sweeping'; state.actionTimer = 0; resetPose(); }

  function interrupt() {
    state.onArrive = null;
    state.onSip = null;
    state.mode = 'idle';
    resetPose();
  }

  /* ── Update ── */
  function update(dt, elapsed) {
    switch (state.mode) {
      case 'walking': {
        if (!state.target) { state.mode = 'idle'; break; }
        const toT = new THREE.Vector3().subVectors(state.target, root.position);
        toT.y = 0;
        const dist = toT.length();
        if (dist < 0.1) {
          state.mode = 'idle';
          state.target = null;
          resetPose();
          const cb = state.onArrive;
          state.onArrive = null;
          if (cb) cb();
          break;
        }
        const dir = toT.normalize();
        root.position.addScaledVector(dir, 0.7 * dt);
        const targetAngle = Math.atan2(dir.x, dir.z);
        let diff = ((targetAngle - root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        root.rotation.y += diff * Math.min(dt * 4, 1);

        state.walkPhase += dt * 4.2;
        const swing = Math.sin(state.walkPhase) * 0.42;
        leftLeg.hip.rotation.x  = swing;
        rightLeg.hip.rotation.x = -swing;
        leftLeg.knee.rotation.x  = Math.max(0, -swing) * 0.7;
        rightLeg.knee.rotation.x = Math.max(0,  swing) * 0.7;
        leftArm.shoulder.rotation.x  = -swing * 0.65;
        rightArm.shoulder.rotation.x =  swing * 0.65;
        root.position.y = Math.abs(Math.sin(state.walkPhase * 2)) * 0.02;

        // Nếu đang cầm nến, giữ tay phải nâng cao
        if (state.mode === 'holdingCandle' || candle.visible) {
          candle.visible = true;
          rightArm.shoulder.rotation.x = -1.3;
          rightArm.shoulder.rotation.z = -0.15;
          rightArm.elbow.rotation.x = 0.4;
        }
        break;
      }

      case 'idle': {
        leftArm.shoulder.rotation.x = -0.35;
        leftArm.shoulder.rotation.z = -0.25;
        leftArm.elbow.rotation.x = -1.15;
        rightArm.shoulder.rotation.x = -0.35;
        rightArm.shoulder.rotation.z = 0.25;
        rightArm.elbow.rotation.x = -1.15;
        root.rotation.z = Math.sin(elapsed * 0.7) * 0.015;
        break;
      }

            case 'sitting':
      case 'fanning': {
        if (state.snapPos) {
          root.position.x = state.snapPos.x;
          root.position.z = state.snapPos.z;
          root.rotation.y = state.snapRot;
          state.snapPos = null;
        }
        root.position.y = -0.35;
        
        // Chân gập 90 độ
        leftLeg.hip.rotation.x = -1.4; rightLeg.hip.rotation.x = -1.4;
        leftLeg.knee.rotation.x = 1.4; rightLeg.knee.rotation.x = 1.4;

        // Tay đặt lên bàn (gập cùi chỏ, vai hạ xuống)
        leftArm.shoulder.rotation.x = -0.5;
        leftArm.shoulder.rotation.z = -0.15;
        leftArm.elbow.rotation.x = -1.0;

        rightArm.shoulder.rotation.x = -0.5;
        rightArm.shoulder.rotation.z = 0.15;
        rightArm.elbow.rotation.x = -1.0;

        state.actionTimer += dt;
        if (state.mode === 'fanning') {
          fan.visible = true;
          rightArm.shoulder.rotation.x = -0.85;
          rightArm.elbow.rotation.x = -0.35;
          rightArm.shoulder.rotation.z = Math.sin(elapsed * 3.2) * 0.5;
        }
        break;
      }

      case 'drinking': {
        if (state.snapPos) {
          root.position.x = state.snapPos.x;
          root.position.z = state.snapPos.z;
          root.rotation.y = state.snapRot;
          state.snapPos = null;
        }
        root.position.y = -0.35;
        leftLeg.hip.rotation.x = -1.4; rightLeg.hip.rotation.x = -1.4;
        leftLeg.knee.rotation.x = 1.4; rightLeg.knee.rotation.x = 1.4;

        // Chén trà trên tay phải
        cup.visible = true;
        cup.position.set(0, -0.35, 0.05);

        rightArm.shoulder.rotation.x = -0.5;
        rightArm.shoulder.rotation.z = 0.15;
        rightArm.elbow.rotation.x = -1.0;

        leftArm.shoulder.rotation.x = -0.5;
        leftArm.shoulder.rotation.z = -0.15;
        leftArm.elbow.rotation.x = -1.0;

        state.actionTimer += dt;
        state.nextSip -= dt;

        if (state.nextSip <= 0) {
          state.nextSip = 2.5 + Math.random() * 1.5;
          state.sipCount++;
          if (state.onSip) state.onSip(state.sipCount);
          state.sipAnimUntil = state.actionTimer + 0.8;
        }

        // Animation nhấp trà (nâng tay lên miệng)
        if (state.sipAnimUntil && state.actionTimer < state.sipAnimUntil) {
          const k = Math.sin((state.actionTimer - (state.sipAnimUntil - 0.8)) / 0.8 * Math.PI);
          rightArm.shoulder.rotation.x = -0.5 - k * 0.4;
          rightArm.elbow.rotation.x = -1.0 + k * 0.7;
          head.rotation.x = -k * 0.1;
        } else {
          head.rotation.x = 0;
        }
        break;
      }

      case 'holdingCandle': {
        candle.visible = true;
        // Đứng yên, tay phải nâng nến
        rightArm.shoulder.rotation.x = -1.3;
        rightArm.shoulder.rotation.z = -0.15;
        rightArm.elbow.rotation.x = -0.4;
        leftArm.shoulder.rotation.x = -0.2;

        // Nhấp nhô nhẹ nến
        candle.position.y = -0.08 + Math.sin(elapsed * 8) * 0.005;
        break;
      }

      case 'petting': {
        root.position.y = -0.42;
        leftLeg.hip.rotation.x  = -1.25;
        rightLeg.hip.rotation.x = -1.25;
        leftLeg.knee.rotation.x  = 2.2;
        rightLeg.knee.rotation.x = 2.2;
        rightArm.shoulder.rotation.x = -0.9;
        rightArm.elbow.rotation.x = -0.4 + Math.sin(elapsed * 4) * 0.2;
        leftArm.shoulder.rotation.x = -0.3;
        state.actionTimer += dt;
        if (state.actionTimer > 4) { state.mode = 'idle'; resetPose(); }
        break;
      }

      case 'feeding': {
        state.actionTimer += dt;
        const t = state.actionTimer;
        if (t < 0.6) rightArm.shoulder.rotation.x = -0.8 * (t / 0.6);
        else if (t < 1.0) rightArm.shoulder.rotation.x = -0.8 + ((t - 0.6) / 0.4) * 1.8;
        else rightArm.shoulder.rotation.x += (0 - rightArm.shoulder.rotation.x) * dt * 3;
        root.rotation.x = t < 1.0 ? Math.sin(t * Math.PI) * 0.1 : 0;
        if (t > 2.2) { state.mode = 'idle'; resetPose(); }
        break;
      }

      case 'sweeping': {
        leftArm.shoulder.rotation.x = -1.0;
        rightArm.shoulder.rotation.x = -1.0;
        const sweep = Math.sin(elapsed * 2.2) * 0.35;
        leftArm.shoulder.rotation.z = sweep;
        rightArm.shoulder.rotation.z = sweep;
        leftArm.elbow.rotation.x = -0.4;
        rightArm.elbow.rotation.x = -0.4;
        root.rotation.z = sweep * 0.15;
        state.actionTimer += dt;
        if (state.actionTimer > 5) { state.mode = 'idle'; resetPose(); }
        break;
      }
    }
  }

  return {
    group, root, update,
    moveTo, sit, standUp, drinkTea, holdCandle, interrupt,
    pet, feed, sweep, fanPalm,
    state,
    getPosition: () => root.position.clone(),
    isHoldingCandle: () => state.mode === 'holdingCandle' || candle.visible,
  };
}