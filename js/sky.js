import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   SKY — bầu trời hoàng hôn toàn cảnh (ảnh assets/textures/sky.jpg)
   Mái vòm lớn bám theo camera, đổi màu theo chu kỳ ngày – đêm.
   ═══════════════════════════════════════════════════════════════ */

export function buildSky() {
  const tex = new THREE.TextureLoader().load('assets/textures/sky.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const geo = new THREE.SphereGeometry(150, 64, 32);
  geo.scale(-1, 1, 1);               // nhìn từ bên trong, không bị ngược ảnh

  const mat = new THREE.MeshBasicMaterial({
    map: tex, fog: false, depthWrite: false, toneMapped: false
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -1;
  dome.frustumCulled = false;

  const WHITE = new THREE.Color(1, 1, 1);
  const DUSK  = new THREE.Color(0.86, 0.66, 0.50);
  const NIGHT = new THREE.Color(0.06, 0.09, 0.19);
  const FOG_DAY   = new THREE.Color(0xe8c28e);
  const tint = new THREE.Color();

  const smooth = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };

  /* sunY: độ cao mặt trời (-sunDistance … +sunDistance) */
  function update(sunY, sunDistance, fog, camera) {
    const h = sunY / sunDistance;
    if (h >= 0) tint.copy(DUSK).lerp(WHITE, smooth(0, 0.5, h));
    else        tint.copy(DUSK).lerp(NIGHT, smooth(0, 0.35, -h));

    mat.color.copy(tint);
    if (fog) fog.color.copy(tint).multiply(FOG_DAY);
    if (camera) dome.position.copy(camera.position);
  }

  return { dome, update };
}