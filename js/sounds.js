export function buildSounds() {
  let ctx = null;
  const layers = {};
  let initialized = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(dur) {
    const c = getCtx();
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function makeWind() {
    const c = getCtx();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(4); src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 350;
    const gain = c.createGain(); gain.gain.value = 0;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.15;
    const lfoG = c.createGain(); lfoG.gain.value = 150;
    lfo.connect(lfoG).connect(lp.frequency);
    src.connect(lp).connect(gain).connect(c.destination);
    src.start(); lfo.start();
    return gain;
  }

  function makeWater() {
    const c = getCtx();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(3); src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const gain = c.createGain(); gain.gain.value = 0;
    src.connect(bp).connect(gain).connect(c.destination);
    src.start();
    return gain;
  }

  function makeCrickets() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 4200;
    const am = c.createGain(); am.gain.value = 0.01;
    const mod = c.createOscillator();
    mod.type = 'square'; mod.frequency.value = 24;
    const modG = c.createGain(); modG.gain.value = 0.01;
    mod.connect(modG).connect(am.gain);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 6000;
    const gain = c.createGain(); gain.gain.value = 0;
    osc.connect(am).connect(lp).connect(gain).connect(c.destination);
    osc.start(); mod.start();
    return gain;
  }

  function makeFrogs() {
    const c = getCtx();
    const gain = c.createGain(); gain.gain.value = 0;
    gain.connect(c.destination);
    setInterval(() => {
      if (!c || gain.gain.value < 0.005) return;
      const t = c.currentTime;
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g).connect(gain);
      osc.start(t); osc.stop(t + 0.3);
    }, 900);
    return gain;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    layers.wind = makeWind();
    layers.water = makeWater();
    layers.crickets = makeCrickets();
    layers.frogs = makeFrogs();
  }

  function fade(gainNode, target, dur) {
    if (!gainNode) return;
    const c = getCtx();
    const now = c.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + dur);
  }

  function update(isDay, sunHeight) {
    if (window.GAME_MUTED) {
      Object.values(layers).forEach(l => fade(l, 0, 0.5));
      return;
    }
    init();
    const isDusk = sunHeight !== undefined && sunHeight > -0.3 && sunHeight < 0.35;
    fade(layers.wind, isDusk ? 0.07 : 0.04, 2);
    fade(layers.water, 0.025, 1);
    fade(layers.crickets, isDay ? 0.012 : 0, 2);
    fade(layers.frogs, !isDay ? 0.035 : 0, 2);
  }

  return { update };
}