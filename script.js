/* ContoSource — Presence Gate (Midnight Blue & Purple)
   - Entrance sequencing (3-10s)
   - WebAudio synthesized warm tone (432-ish)
   - No external files
   - Accessible, minimal
*/

const cfg = {
  timings: { orbIn: 220, orbFloat: 1400, whisperIn: 1600, haloIn: 2200, showHome: 9000 },
  tone: { baseFreq: 432, volume: 0.06, attack: 0.12, sustain: 1.2 }
};

/* DOM references */
const orb = document.getElementById('orb');
const halo = document.getElementById('halo');
const whisper = document.getElementById('whisper');
const enterBtn = document.getElementById('enterBtn');
const supportBtn = document.getElementById('supportBtn');
const gate = document.getElementById('gate');
const home = document.getElementById('home');
const beginSession = document.getElementById('beginSession');
const donateLink = document.getElementById('donateLink');

/* WebAudio synth basics */
let audioCtx = null;
let masterGain = null;
let oscMain = null;
let oscDetune = null;
let envGain = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(audioCtx.destination);

  // envelope node
  envGain = audioCtx.createGain();
  envGain.gain.value = 0;
  envGain.connect(masterGain);

  // main oscillator (sine)
  oscMain = audioCtx.createOscillator();
  oscMain.type = 'sine';
  oscMain.frequency.setValueAtTime(cfg.tone.baseFreq, audioCtx.currentTime);

  // detuned companion oscillator for warmth
  oscDetune = audioCtx.createOscillator();
  oscDetune.type = 'sine';
  oscDetune.frequency.setValueAtTime(cfg.tone.baseFreq * 0.9993, audioCtx.currentTime);

  // connect
  oscMain.connect(envGain);
  oscDetune.connect(envGain);

  // start oscillators
  try {
    oscMain.start();
    oscDetune.start();
  } catch (e) {
    // ignore if already started
  }
}

/* play a short tone with envelope */
function playPresenceTone(duration = cfg.tone.sustain) {
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const v = cfg.tone.volume;
    envGain.gain.cancelScheduledValues(now);
    envGain.gain.setValueAtTime(0.0001, now);
    envGain.gain.linearRampToValueAtTime(v, now + cfg.tone.attack);
    envGain.gain.linearRampToValueAtTime(0.0002, now + duration);
  } catch (err) {
    // Autoplay blocked; will work after user gesture
  }
}

/* visual sequence functions */
function revealOrb() {
  orb.style.opacity = '1';
  orb.style.transform = 'scale(1)';
}
function floatOrb() {
  orb.classList.add('floaty');
  halo.style.opacity = '1';
  halo.style.transform = 'scale(1)';
}
function revealWhisper() {
  whisper.style.opacity = '1';
  whisper.style.transform = 'translateY(0)';
}
function showHome() {
  gate.classList.add('hidden');
  home.classList.remove('hidden');
  home.setAttribute('aria-hidden','false');
}

/* master sequence (runs on load) */
function runSequence() {
  // Orb in
  setTimeout(() => {
    revealOrb();
    playPresenceTone(1.6);
  }, cfg.timings.orbIn);

  // Orb float + halo
  setTimeout(() => {
    floatOrb();
  }, cfg.timings.orbFloat);

  // Whisper appear
  setTimeout(() => {
    revealWhisper();
  }, cfg.timings.whisperIn);

  // halo accent
  setTimeout(() => {
    playPresenceTone(1.2);
  }, cfg.timings.haloIn);

  // finish -> home
  setTimeout(() => {
    showHome();
  }, cfg.timings.showHome);
}

/* Safe audio start on first user gesture (browsers often block autoplay) */
document.body.addEventListener('pointerdown', function one() {
  if (!audioCtx) initAudio();
  // optional gentle tone when user taps
  try { playPresenceTone(0.7); } catch(e){}
}, { once: true, passive: true });

/* Buttons */
enterBtn.addEventListener('click', () => {
  try { playPresenceTone(1.0); } catch(e){}
  showHome();
});

supportBtn.addEventListener('click', () => {
  // placeholder: replace with your actual payment / gumroad / paypal link when ready.
  const p = prompt('Paste your support URL (Gumroad / PayPal.Me / BuyMeACoffee). Or press Cancel.');
  if (p) {
    window.open(p, '_blank', 'noopener');
  }
});

beginSession.addEventListener('click', () => {
  alert('Begin Alignment — guided experience coming soon. Thank you for being here.');
});

/* donate link placeholder */
donateLink.addEventListener('click', (e) => {
  e.preventDefault();
  const p = prompt('Paste your payment/support link (Gumroad/PayPal).');
  if (p) window.open(p, '_blank', 'noopener');
});

/* init visuals (initial state) */
orb.style.opacity = 0; orb.style.transform = 'scale(.6)'; halo.style.opacity = 0; halo.style.transform = 'scale(.85)'; whisper.style.opacity = 0; whisper.style.transform = 'translateY(8px)';

/* Kick the sequence after minimal delay to ensure DOM readiness */
window.addEventListener('load', () => {
  setTimeout(runSequence, 140);
});

