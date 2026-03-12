// ============================================================
// COLORS MODULE
// Level 0: show color name → pick color swatch
// Level 1: audio only → pick color swatch
// Level 2: color mixing — two swatches → pick the result
// ============================================================

const COLORS_DATA = [
  { id:'red',    name:'אָדֹם',  hex:'#EF476F' },
  { id:'blue',   name:'כָּחֹל', hex:'#3A86FF' },
  { id:'yellow', name:'צָהֹב',  hex:'#FFD166' },
  { id:'green',  name:'יָרֹק',  hex:'#06D6A0' },
  { id:'orange', name:'כָּתֹם', hex:'#FF6B35' },
  { id:'purple', name:'סָגֹל',  hex:'#A78BFA' },
  { id:'pink',   name:'וָרֹד',  hex:'#FF85A1' },
  { id:'black',  name:'שָׁחֹר', hex:'#1A1A2E' },
];

// Color mixing pairs — all results exist in COLORS_DATA
const COLOR_MIXES = [
  { aId:'red',  bId:'yellow', resultId:'orange' },
  { aId:'red',  bId:'blue',   resultId:'purple' },
  { aId:'blue', bId:'yellow', resultId:'green'  },
  { aId:'red',  bId:'white',  resultId:'pink',
    aHex:'#EF476F', bHex:'#FFFFFF', bNameHe:'לָבָן', bNameEn:'white' },
];

const ColorsQuiz = (() => {
  let sessionOrder  = [];
  let currentIdx    = 0;
  let answered      = false;
  let _journeyCount = 0;

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _journeyDone() {
    _journeyCount++;
    Confetti.burst();
    Progress.recordModuleCompletion('colors');
    const msgs = Lang.strings().journeyMsgs;
    Speech.speak(msgs[Math.min(_journeyCount - 1, msgs.length - 1)]);
    setTimeout(() => Journey.start('colors-journey', 8, _journeyDone), 1400);
  }

  function init() {
    sessionOrder  = _shuffle(Adaptive.buildPool('colors', COLORS_DATA, c => c.id));
    currentIdx    = 0;
    _journeyCount = 0;
    Journey.start('colors-journey', 8, _journeyDone);
    _renderQuestion();
  }

  function _renderQuestion() {
    answered = false;
    const level   = Math.min(_journeyCount, 2);
    const display = document.getElementById('color-display');
    const nameEl  = document.getElementById('color-name-label');
    const grid    = document.getElementById('colors-choices');

    let target;

    if (level >= 2) {
      // Color mixing
      const mix    = COLOR_MIXES[Math.floor(Math.random() * COLOR_MIXES.length)];
      const aColor = mix.aHex || COLORS_DATA.find(c => c.id === mix.aId).hex;
      const bColor = mix.bHex || COLORS_DATA.find(c => c.id === mix.bId).hex;
      const aName  = COLORS_DATA.find(c => c.id === mix.aId)?.name || '';
      const bName  = mix.bNameHe || COLORS_DATA.find(c => c.id === mix.bId)?.name || '';
      target       = COLORS_DATA.find(c => c.id === mix.resultId);

      // Reshape display div from circle to mixing row
      display.style.cssText = 'width:min(92vw,340px);height:72px;border-radius:12px;background:transparent;' +
        'display:flex;align-items:center;gap:0.5rem;margin:0.4rem 0;flex-direction:row;';
      display.innerHTML =
        `<div style="flex:1;height:100%;background:${aColor};border-radius:8px;"></div>` +
        `<div style="font-size:1.8rem;font-weight:800;color:var(--dark);">+</div>` +
        `<div style="flex:1;height:100%;background:${bColor};border-radius:8px;"></div>` +
        `<div style="font-size:1.8rem;font-weight:800;color:var(--dark);">=</div>` +
        `<div style="flex:1;height:100%;background:#e0e0e0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;">?</div>`;
      nameEl.textContent = '';
      const q = Lang.isHe()
        ? `${aName} ועוד ${bName} שווה למה?`
        : `${aName} and ${bName} make what?`;
      Speech.speak(q);

    } else {
      // Name → find color
      target = COLORS_DATA[sessionOrder[currentIdx % sessionOrder.length]];

      // Reset display to hidden circle
      display.style.cssText = '';
      display.textContent   = '';
      display.style.background = 'transparent';
      display.style.border     = 'none';
      display.style.boxShadow  = 'none';

      if (level === 0) {
        nameEl.textContent   = target.name;
        nameEl.style.fontSize = 'clamp(2.2rem,8vw,3.2rem)';
        Speech.speak(target.name);
      } else {
        nameEl.textContent = '';
        Speech.speak(target.name);
        setTimeout(() => Speech.speak(target.name), 1800);
      }
    }

    // 4-choice grid — color swatches (no text labels)
    const wrongs  = _shuffle(COLORS_DATA.filter(c => c.id !== target.id)).slice(0, 3);
    const choices = _shuffle([target, ...wrongs]);
    grid.innerHTML = '';
    choices.forEach(item => {
      const btn = document.createElement('button');
      btn.className        = 'choice-btn';
      btn.style.background = item.hex;
      btn.style.minHeight  = '96px';
      btn.style.border     = '3px solid rgba(255,255,255,0.3)';
      btn.dataset.colorId  = item.id;
      btn.onclick          = () => _handleChoice(btn, item.id === target.id, target);
      grid.appendChild(btn);
    });
  }

  function _handleChoice(btn, isCorrect, target) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      btn.classList.add('correct');
      Progress.record('colors', target.id, true);
      Claude.trackCorrect('colors', target.id);
      Speech.speak(Lang.p());
      App.addStar();
      Confetti.burst();
      const journeyDone = Journey.advance();
      const delay = journeyDone ? 2600 : 1300;
      setTimeout(() => { btn.classList.remove('correct'); currentIdx++; _renderQuestion(); }, delay);
    } else {
      btn.classList.add('wrong');
      Progress.record('colors', target.id, false);
      Claude.trackWrong('colors', target.id, target.name);
      Speech.speak(Lang.ta());
      setTimeout(() => {
        btn.classList.remove('wrong');
        document.querySelectorAll('#colors-choices .choice-btn').forEach(b => {
          if (b.dataset.colorId === target.id) b.classList.add('correct');
        });
        setTimeout(() => {
          document.querySelectorAll('#colors-choices .choice-btn').forEach(b => b.classList.remove('correct'));
          currentIdx++;
          _renderQuestion();
        }, 1000);
      }, 800);
    }
  }

  return { init };
})();
