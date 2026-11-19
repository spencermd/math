/**
 * Tiny synthesized sounds, so there are no audio files to load. Played only when the learner has turned
 * sound on; browsers also hold audio until the page has been clicked, which an answer always is.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac: AudioContext, freq: number, start: number, length: number, volume = 0.12, type: OscillatorType = 'sine') {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

/** A rising sparkle of bells. */
export function playJingle() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  [784, 988, 1175, 1568].forEach((f, i) => {
    tone(ac, f, t + i * 0.08, 0.5, 0.09);
    tone(ac, f * 2, t + i * 0.08, 0.25, 0.025, 'triangle');
  });
}

/** A low whoosh of fire, then the hiss of water. */
export function playFizzle() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, 180, t, 0.35, 0.08, 'sawtooth');
  tone(ac, 120, t + 0.05, 0.3, 0.06, 'triangle');
  // Water: a short burst of filtered noise.
  const length = 0.6;
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * length), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;
  const gain = ac.createGain();
  gain.gain.value = 0.05;
  noise.connect(filter).connect(gain).connect(ac.destination);
  noise.start(t + 0.75);
}
