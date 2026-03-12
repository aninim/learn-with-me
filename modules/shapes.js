// ============================================================
// SHAPES MODULE
// Show shape NAME → child finds the shape character
// Tier 0 (basic): 6 shapes — shown at start / 3-4yo
// Tier 1 (intermediate): +6 more shapes — unlocked with age/journey
// Level 0: show name text + speak → pick colored shape
// Level 1: audio only → pick mono shape
// Level 2: audio only → pick from full pool (harder)
// ============================================================

const SHAPES_ALL = [
  // Tier 0 — basic
  { id:'circle',    tier:0, char:'⬤', name:'עִיגּוּל',    color:'#FF6B35' },
  { id:'square',    tier:0, char:'■', name:'רִיבּוּעַ',    color:'#00B4A6' },
  { id:'triangle',  tier:0, char:'▲', name:'מְשֻׁלָּשׁ',   color:'#A78BFA' },
  { id:'heart',     tier:0, char:'♥', name:'לֵב',        color:'#EF476F' },
  { id:'star',      tier:0, char:'★', name:'כּוֹכָב',     color:'#FFD166' },
  { id:'rectangle', tier:0, char:'▬', name:'מַלְבֵּן',    color:'#06D6A0' },
  // Tier 1 — intermediate
  { id:'diamond',   tier:1, char:'◆', name:'מַעֲיָן',     color:'#3A86FF' },
  { id:'oval',      tier:1, char:'⬬', name:'אֵלִיפְּסָה',  color:'#FF6B35' },
  { id:'cross',     tier:1, char:'✚', name:'פְּלוּס',     color:'#06D6A0' },
  { id:'crescent',  tier:1, char:'🌙', name:'יָרֵחַ',     color:'#7C3AED' },
  { id:'pentagon',  tier:1, char:'⬟', name:'מְחֻמָּשׁ',   color:'#A78BFA' },
  { id:'hexagon',   tier:1, char:'⬢', name:'מְשֻׁשָּׁה',  color:'#EF476F' },
];

const ShapesQuiz = (() => {
  let _currentPool  = [];
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

  function _tier() {
    const age = parseInt(localStorage.getItem('ylmd_age') || '0');
    return Math.min(age + Math.floor(_journeyCount / 2), 1);
  }

  function _buildPool() {
    _currentPool = SHAPES_ALL.filter(s => s.tier <= _tier());
    sessionOrder = _shuffle(Adaptive.buildPool('shapes', _currentPool, s => s.id));
  }

  function _journeyDone() {
    _journeyCount++;
    Confetti.burst();
    Progress.recordModuleCompletion('shapes');
    const msgs = Lang.strings().journeyMsgs;
    Speech.speak(msgs[Math.min(_journeyCount - 1, msgs.length - 1)]);
    setTimeout(() => {
      _buildPool();
      Journey.start('shapes-journey', _currentPool.length, _journeyDone);
    }, 1400);
  }

  function init() {
    _journeyCount = 0;
    currentIdx    = 0;
    _buildPool();
    Journey.start('shapes-journey', _currentPool.length, _journeyDone);
    _renderQuestion();
  }

  function _renderQuestion() {
    answered = false;
    const target  = _currentPool[sessionOrder[currentIdx % sessionOrder.length]];
    const level   = Math.min(_journeyCount, 2);
    const display = document.getElementById('shape-display');

    // Display: shape name text (level 0) or audio icon (level 1+)
    if (level >= 1) {
      display.textContent  = '🎧';
      display.style.color  = 'var(--dark)';
      display.style.fontSize = 'clamp(5rem,18vw,8rem)';
      setTimeout(() => Speech.speak(target.name), 700);
      setTimeout(() => Speech.speak(target.name), 3200);
    } else {
      display.textContent  = target.name;
      display.style.color  = 'var(--dark)';
      display.style.fontSize = 'clamp(2.2rem,8vw,3.2rem)';
      display.style.fontFamily = "'Varela Round', sans-serif";
      setTimeout(() => Speech.speak((Lang.isHe() ? 'מצא: ' : 'Find: ') + target.name), 700);
    }

    // 4-choice grid — shape characters
    const wrongs  = _shuffle(_currentPool.filter(s => s.id !== target.id)).slice(0, 3);
    const choices = _shuffle([target, ...wrongs]);
    const grid    = document.getElementById('shapes-choices');
    grid.innerHTML = '';
    choices.forEach(item => {
      const btn = document.createElement('button');
      btn.className         = 'choice-btn';
      btn.style.color       = level >= 1 ? '#888' : item.color;
      btn.style.fontSize    = 'clamp(2.2rem,9vw,3.5rem)';
      btn.dataset.shapeId   = item.id;
      btn.textContent       = item.char;
      btn.onclick           = () => _handleChoice(btn, item.id === target.id, target);
      grid.appendChild(btn);
    });
  }

  function _handleChoice(btn, isCorrect, target) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      btn.classList.add('correct');
      Progress.record('shapes', target.id, true);
      Claude.trackCorrect('shapes', target.id);
      Speech.speak(Lang.p());
      App.addStar();
      Confetti.burst();
      const journeyDone = Journey.advance();
      const delay = journeyDone ? 2600 : 1300;
      setTimeout(() => { btn.classList.remove('correct'); currentIdx++; _renderQuestion(); }, delay);
    } else {
      btn.classList.add('wrong');
      Progress.record('shapes', target.id, false);
      Claude.trackWrong('shapes', target.id, target.name);
      Speech.speak(Lang.ta());
      setTimeout(() => {
        btn.classList.remove('wrong');
        document.querySelectorAll('#shapes-choices .choice-btn').forEach(b => {
          if (b.dataset.shapeId === target.id) b.classList.add('correct');
        });
        setTimeout(() => {
          document.querySelectorAll('#shapes-choices .choice-btn').forEach(b => b.classList.remove('correct'));
          currentIdx++;
          _renderQuestion();
        }, 1000);
      }, 800);
    }
  }

  return { init };
})();
