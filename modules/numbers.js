// ============================================================
// NUMBERS MODULE
// "How many?" — emoji groups → pick Hebrew word
// Level 0: emoji group + "כמה?" label → pick word
// Level 1: emoji group, no label → pick word
// Level 2: audio only → pick word
// ============================================================

const NUMBERS = [
  { num:1,  word:'אֶחָד',    emoji:'⭐' },
  { num:2,  word:'שְׁתַּיִם', emoji:'🍎' },
  { num:3,  word:'שָׁלוֹשׁ',  emoji:'🌸' },
  { num:4,  word:'אַרְבַּע',  emoji:'🐸' },
  { num:5,  word:'חָמֵשׁ',   emoji:'🦋' },
  { num:6,  word:'שֵׁשׁ',    emoji:'⚽' },
  { num:7,  word:'שֶׁבַע',   emoji:'🌟' },
  { num:8,  word:'שְׁמוֹנֶה', emoji:'🎈' },
  { num:9,  word:'תֵּשַׁע',   emoji:'🍭' },
  { num:10, word:'עֶשֶׂר',   emoji:'🍕' },
];

const NumbersQuiz = (() => {
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
    Progress.recordModuleCompletion('numbers');
    const msgs = Lang.strings().journeyMsgs;
    Speech.speak(msgs[Math.min(_journeyCount - 1, msgs.length - 1)]);
    setTimeout(() => Journey.start('numbers-journey', 5, _journeyDone), 1400);
  }

  function init() {
    sessionOrder  = _shuffle(Adaptive.buildPool('numbers', NUMBERS, n => String(n.num)));
    currentIdx    = 0;
    _journeyCount = 0;
    Journey.start('numbers-journey', 5, _journeyDone);
    _renderQuestion();
  }

  function _emojiGroup(num, emoji) {
    const items = Array(num).fill(emoji);
    if (num <= 5) {
      return `<div style="font-size:clamp(2.4rem,8vw,3.4rem);line-height:1.8;letter-spacing:0.15em">${items.join(' ')}</div>`;
    }
    // 6–10: two rows of 5
    const row1 = items.slice(0, 5).join(' ');
    const row2 = items.slice(5).join(' ');
    return `<div style="font-size:clamp(2rem,6vw,2.8rem);line-height:1.8;letter-spacing:0.1em">${row1}</div>`
         + `<div style="font-size:clamp(2rem,6vw,2.8rem);line-height:1.6;letter-spacing:0.1em">${row2}</div>`;
  }

  function _renderQuestion() {
    answered = false;
    const target   = NUMBERS[sessionOrder[currentIdx % sessionOrder.length]];
    const level    = Math.min(_journeyCount, 2);
    const display  = document.getElementById('num-display');
    const emojisEl = document.getElementById('num-emojis');
    const wordEl   = document.getElementById('num-word');

    if (level >= 2) {
      display.innerHTML    = '<span style="font-size:clamp(5rem,18vw,8rem)">🎧</span>';
      emojisEl.textContent = '';
      wordEl.textContent   = Lang.t('listenAndFind');
      setTimeout(() => Speech.speak(target.word), 700);
      setTimeout(() => Speech.speak(target.word), 3200);
    } else {
      display.innerHTML    = _emojiGroup(target.num, target.emoji);
      emojisEl.textContent = '';
      wordEl.textContent   = level === 0 ? (Lang.isHe() ? 'כַּמָּה?' : 'How many?') : '';
      setTimeout(() => Speech.speak(target.word), 700);
    }

    // 4-choice grid — Hebrew words
    const wrongs  = _shuffle(NUMBERS.filter(n => n.num !== target.num)).slice(0, 3);
    const choices = _shuffle([target, ...wrongs]);
    const grid    = document.getElementById('numbers-choices');
    grid.innerHTML = '';
    choices.forEach(item => {
      const btn = document.createElement('button');
      btn.className          = 'choice-btn';
      btn.style.fontSize     = 'clamp(1.3rem,5vw,2rem)';
      btn.style.fontFamily   = "'Varela Round', sans-serif";
      btn.dataset.num        = item.num;
      btn.textContent        = item.word;
      btn.onclick            = () => _handleChoice(btn, item.num === target.num, target);
      grid.appendChild(btn);
    });
  }

  function _handleChoice(btn, isCorrect, target) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      btn.classList.add('correct');
      Progress.record('numbers', String(target.num), true);
      Claude.trackCorrect('numbers', String(target.num));
      Speech.speak(Lang.p());
      App.addStar();
      Confetti.burst();
      const journeyDone = Journey.advance();
      const delay = journeyDone ? 2600 : 1300;
      setTimeout(() => { btn.classList.remove('correct'); currentIdx++; _renderQuestion(); }, delay);
    } else {
      btn.classList.add('wrong');
      Progress.record('numbers', String(target.num), false);
      Claude.trackWrong('numbers', String(target.num), target.word);
      Speech.speak(Lang.ta());
      setTimeout(() => {
        btn.classList.remove('wrong');
        document.querySelectorAll('#numbers-choices .choice-btn').forEach(b => {
          if (b.dataset.num === String(target.num)) b.classList.add('correct');
        });
        setTimeout(() => {
          document.querySelectorAll('#numbers-choices .choice-btn').forEach(b => b.classList.remove('correct'));
          currentIdx++;
          _renderQuestion();
        }, 1000);
      }, 800);
    }
  }

  return { init };
})();
