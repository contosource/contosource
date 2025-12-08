// ContoSource minimal Presence Gate (no external audio files)
// 3-10s empty-state entry with a synthesized warm tone (432Hz-ish)

const cfg = {
  timings: { orbAppear: 220, whisper: 1400, orbFloat: 2000, showHome: 9000 },
  tone: { freq: 432, volume: 0.08, attack: 0.12, decay: 1.6 }
};

// DOM
const gate = document.getElementById('gate');
const orb = document.getElementById('orb');
const whisper = document.getElementById('whisper');
const enterBtn = document.getElementById('enterBtn');
const home = document.getElementById('home');
const startSession = document.getElementById('startSession');
const support = document.getElementById('support');

// WebAudio synth (simple sine + subtle detune for warmth)
let audioCtx, master, osc, gainNode;
function initTone(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = cfg.tone.volume;
  master.connect(audioCtx.destination);

  // Create two slightly detuned oscillators to warm the tone
  osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0;
  osc.type = 'sine';
  osc.frequency.value = cfg.tone.freq;
  osc.detune.value = 0;
  osc2.type = 'sine';
  osc2.frequency.value = cfg.tone.freq * 0.9995; // tiny detune
  osc2.detune.value = -2;
  osc.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(master);

  osc.start();
  osc2.start();
}

// smooth envelope
function playTone(duration = 1.6){
  try{
    initTone();
    const now = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(cfg.tone.volume, now + cfg.tone.attack);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);
  }catch(e){
    // audio locked / autoplay blocked
  }
}

// Entrance sequence
function openGate(){
  // orb appears
  setTimeout(()=>{ orb.style.opacity = '1'; orb.style.transform = 'scale(1)'; orb.classList.add('float'); playTone(1.8); }, cfg.timings.orbAppear);
  // whisper appears
  setTimeout(()=>{ whisper.style.opacity = '1'; }, cfg.timings.whisper);
  // show enter button slightly later
  setTimeout(()=>{ enterBtn.style.opacity = '1'; enterBtn.style.transform = 'translateY(0)'; }, cfg.timings.orbFloat);
  // auto show home after full experience
  setTimeout(()=>{ showHome(); }, cfg.timings.showHome);
}

// Show home (portal dissolve)
function showHome(){
  gate.classList.add('hidden');
  home.classList.remove('hidden');
  home.setAttribute('aria-hidden','false');
}

// Safety: ensure audio plays after first user gesture if blocked
document.body.addEventListener('click', function once(){
  if (!audioCtx) initTone();
}, { once: true, passive: true });

// button interactions
enterBtn.addEventListener('click', ()=>{ showHome(); try{ playTone(1.2);}catch(e){} });

// start session (placeholder - later we can implement)
startSession.addEventListener('click', ()=>{ alert('Begin Alignment — guided experience coming soon.'); });

// support link (replace href dynamically if you have gumroad/paypal)
support.addEventListener('click', (e)=>{ 
  e.preventDefault();
  // replace with your payment link
  const payLink = prompt('Paste your Pay link (PayPal.Me / Gumroad / BuyMeACoffee) or press OK to open placeholder.');
  if(payLink){ window.open(payLink, '_blank'); }
});

// initialize with minimal style values
orb.style.opacity = 0; orb.style.transform = 'scale(.5)';
enterBtn.style.opacity = 0; enterBtn.style.transform = 'translateY(10px)';

// start
openGate();
