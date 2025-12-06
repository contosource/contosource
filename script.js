const cfg = {
  toneVolume: 0.28,
  stageDelays: {
    stage1: 220,
    stage2: 1200,
    stage3: 3000,
    stage4: 5200,
    finish: 9000
  },
  breathCycleMs: 2200
};

const el = {
  sourcePoint: null,
  breathRing: null,
  whisper: null,
  portal: null,
  darkVoid: null,
  home: null,
  tone: null
};

window.addEventListener('load', () => {
  el.sourcePoint = document.getElementById('sourcePoint');
  el.breathRing = document.getElementById('breathRing');
  el.whisper = document.getElementById('whisper');
  el.portal = document.getElementById('portal');
  el.darkVoid = document.getElementById('darkVoid');
  el.home = document.getElementById('home');
  el.tone = document.getElementById('tone');

  function safePlayTone(){
    try{
      if(el.tone){
        el.tone.volume = cfg.toneVolume;
        el.tone.currentTime = 0;
        el.tone.play().catch(()=>{});
      }
    }catch(e){}
  }

  function stage1(){
    el.sourcePoint.style.opacity = '1';
    el.sourcePoint.style.transform = 'scale(1)';
    el.darkVoid.style.opacity = '0.0';
    safePlayTone();
  }
  function stage2(){
    el.breathRing.style.opacity = '1';
    el.breathRing.style.transform = 'scale(1.02)';
    el.breathRing.animate([
      { transform: 'scale(.92)', opacity: 0.08 },
      { transform: 'scale(1.16)', opacity: 0.26 },
      { transform: 'scale(.98)', opacity: 0.08 }
    ], { duration: cfg.breathCycleMs, iterations: 1, easing: 'cubic-bezier(.2,.9,.2,1)'});
  }
  function stage3(){
    el.whisper.style.opacity = '1';
    const lines = Array.from(el.whisper.querySelectorAll('.line'));
    lines.forEach((ln, i) => {
      ln.style.opacity = '0';
      ln.style.transform = 'translateY(8px)';
      setTimeout(() => {
        ln.style.transition = 'all 700ms cubic-bezier(.2,.9,.2,1)';
        ln.style.opacity = '1';
        ln.style.transform = 'translateY(0)';
      }, 120 + i * 300);
    });
  }
  function stage4(){
    el.portal.style.opacity = '1';
    el.portal.animate([{ transform: 'scale(.98)' }, { transform: 'scale(1.03)' }], { duration: 1200, fill: 'forwards' });
  }
  function finish(){
    document.getElementById('presenceGate').classList.add('hidden');
    el.home.classList.remove('hidden');
    el.home.setAttribute('aria-hidden','false');
    const beginBtn = document.getElementById('beginBtn');
    if(beginBtn){
      beginBtn.addEventListener('click', () => {
        try{ el.tone.play(); }catch(e){}
        alert('Begin Alignment — next features coming.');
      });
    }
  }

  setTimeout(stage1, cfg.stageDelays.stage1);
  setTimeout(stage2, cfg.stageDelays.stage2);
  setTimeout(stage3, cfg.stageDelays.stage3);
  setTimeout(stage4, cfg.stageDelays.stage4);
  setTimeout(finish, cfg.stageDelays.finish);

  document.body.addEventListener('click', () => { safePlayTone(); }, { once: true, passive: true });
});
