// ============================================================
// MEMORY MATCH MODULE — Screen 11 (v1.1 redesign)
// PDD: PDD_MemoryMatch_v1.1.md + memory-match-visual-deck.html
//
// Band A (ages 3–4): identical animal pairs, 2×3 grid (6 cards, 3 pairs)
// Band B (ages 5–6): associative pairs — letter ↔ emoji+word, 3×4 grid (12 cards, 6 pairs)
//
// Mechanics:
//   - 3D card flip (300ms rotateY)
//   - 250ms face-up window on mismatch (passive learning moment, no punishment)
//   - Auto-solve after 4 misses on same pair ("הנה הם!")
//   - Matched pairs stay visible at 70% opacity with green glow (M-10)
//   - Peek hint (Band B only): tap 🔍 to reveal one unmatched card for 800ms
//   - Hint button pulses after 8s of inactivity (Band B only)
//   - Star rating: ≤pairs×2.2 → ⭐⭐⭐ | ≤pairs×3.5 → ⭐⭐ | else ⭐
//   - Per-pair spaced repetition via Progress.record()
// ============================================================

const MemoryMatch = (() => {

  // ── Band A: identical animal pairs ──────────────────────────
  const BAND_A = [
    { id:'lion',     emoji:'🦁', name:'אַרְיֵה'     },
    { id:'elephant', emoji:'🐘', name:'פִּיל'        },
    { id:'giraffe',  emoji:'🦒', name:'זְרָפָה'     },
    { id:'monkey',   emoji:'🐒', name:'קוֹף'        },
    { id:'zebra',    emoji:'🦓', name:'זֵבְרָה'     },
    { id:'parrot',   emoji:'🦜', name:'תּוּכִּי'    },
    { id:'hippo',    emoji:'🦛', name:'קַרְנַפִּית' },
    { id:'croc',     emoji:'🐊', name:'תַּנִּין'    },
  ];

  // ── Band B: letter ↔ word+emoji associative pairs ───────────
  const BAND_B = [
    { id:'aleph',  letter:'א', word:'אֲרִי',    emoji:'🦁', speakA:'אָלֶף',   speakB:'אֲרִי'     },
    { id:'bet',    letter:'ב', word:'בַּיִת',   emoji:'🏠', speakA:'בֵּית',   speakB:'בַּיִת'    },
    { id:'gimel',  letter:'ג', word:'גָּמָל',   emoji:'🐪', speakA:'גִּימֶל', speakB:'גָּמָל'   },
    { id:'dalet',  letter:'ד', word:'דָּג',     emoji:'🐟', speakA:'דָּלֶת',  speakB:'דָּג'      },
    { id:'he',     letter:'ה', word:'הַר',      emoji:'⛰️', speakA:'הֵא',     speakB:'הַר'      },
    { id:'vav',    letter:'ו', word:'וֶרֶד',    emoji:'🌹', speakA:'וָו',     speakB:'וֶרֶד'    },
    { id:'zayin',  letter:'ז', word:'זֵבְרָה',  emoji:'🦓', speakA:'זַיִן',   speakB:'זֵבְרָה'  },
    { id:'chet',   letter:'ח', word:'חָתוּל',   emoji:'🐱', speakA:'חֵית',    speakB:'חָתוּל'   },
    { id:'tet',    letter:'ט', word:'טַיִס',    emoji:'✈️', speakA:'טֵית',    speakB:'טַיִס'    },
    { id:'yod',    letter:'י', word:'יֶלֶד',    emoji:'👦', speakA:'יוֹד',    speakB:'יֶלֶד'    },
    { id:'kaf',    letter:'כ', word:'כֶּלֶב',   emoji:'🐶', speakA:'כַּף',    speakB:'כֶּלֶב'   },
    { id:'lamed',  letter:'ל', word:'לֵב',      emoji:'❤️', speakA:'לָמֶד',   speakB:'לֵב'      },
    { id:'mem',    letter:'מ', word:'מַיִם',    emoji:'💧', speakA:'מֵם',     speakB:'מַיִם'    },
    { id:'nun',    letter:'נ', word:'נָחָשׁ',   emoji:'🐍', speakA:'נוּן',    speakB:'נָחָשׁ'   },
    { id:'samech', letter:'ס', word:'סוּס',     emoji:'🐴', speakA:'סָמֶך',   speakB:'סוּס'     },
    { id:'ayin',   letter:'ע', word:'עֵץ',      emoji:'🌳', speakA:'עַיִן',   speakB:'עֵץ'      },
    { id:'pe',     letter:'פ', word:'פֶּרַח',   emoji:'🌸', speakA:'פֵּא',    speakB:'פֶּרַח'   },
    { id:'tsadi',  letter:'צ', word:'צַב',      emoji:'🐢', speakA:'צָדִי',   speakB:'צַב'      },
    { id:'kof',    letter:'ק', word:'קוֹף',     emoji:'🐒', speakA:'קוֹף',    speakB:'קוֹף'     },
    { id:'resh',   letter:'ר', word:'רַכֶּבֶת', emoji:'🚂', speakA:'רֵישׁ',   speakB:'רַכֶּבֶת' },
    { id:'shin',   letter:'ש', word:'שֶׁמֶשׁ',  emoji:'☀️', speakA:'שִׁין',   speakB:'שֶׁמֶשׁ'  },
    { id:'tav',    letter:'ת', word:'תַּפּוּחַ', emoji:'🍎', speakA:'תָּו',    speakB:'תַּפּוּחַ' },
  ];

  // ── Session state ────────────────────────────────────────────
  let ageBand       = 'A';
  let cards         = [];
  let flipped       = [];       // indices of currently face-up (not matched) cards
  let matched       = new Set(); // matched pairIds
  let locked        = false;
  let flipsTotal    = 0;
  let totalPairs    = 0;
  let missPerPair   = {};       // { pairId: miss count }
  let _journeyCount = 0;
  let _hintTimer    = null;

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build a shuffled deck of card objects for this round
  function _buildDeck() {
    const age = parseInt(localStorage.getItem('ylmd_age') || '0');
    ageBand    = age >= 1 ? 'B' : 'A';
    totalPairs = ageBand === 'A' ? 3 : 6;

    const deck = [];

    if (ageBand === 'A') {
      const pool = _shuffle(BAND_A).slice(0, totalPairs);
      pool.forEach(animal => {
        deck.push({ cardId: animal.id + '-0', pairId: animal.id, type: 'animal', emoji: animal.emoji, speakText: animal.name });
        deck.push({ cardId: animal.id + '-1', pairId: animal.id, type: 'animal', emoji: animal.emoji, speakText: animal.name });
      });
    } else {
      const pool = _shuffle(BAND_B).slice(0, totalPairs);
      pool.forEach(pair => {
        deck.push({ cardId: pair.id + '-A', pairId: pair.id, type: 'letter',     text: pair.letter, speakText: pair.speakA });
        deck.push({ cardId: pair.id + '-B', pairId: pair.id, type: 'word-emoji', emoji: pair.emoji, text: pair.word, speakText: pair.speakB });
      });
    }

    return _shuffle(deck);
  }

  function _journeyDone() {
    _journeyCount++;
    Confetti.burst();
    Progress.recordModuleCompletion('memory');
    const msgs = Lang.strings().journeyMsgs;
    Speech.speak(msgs[Math.min(_journeyCount - 1, msgs.length - 1)]);
    setTimeout(() => {
      Journey.start('memory-journey', totalPairs, _journeyDone);
      _newRound();
    }, 1400);
  }

  function init() {
    _journeyCount = 0;
    // Determine band/totalPairs before Journey.start so it gets the right target
    const age = parseInt(localStorage.getItem('ylmd_age') || '0');
    ageBand    = age >= 1 ? 'B' : 'A';
    totalPairs = ageBand === 'A' ? 3 : 6;
    Journey.start('memory-journey', totalPairs, _journeyDone);
    _newRound();
  }

  function _newRound() {
    cards       = _buildDeck();
    flipped     = [];
    matched     = new Set();
    locked      = false;
    flipsTotal  = 0;
    missPerPair = {};
    _clearHintTimer();
    _hideWin();
    _render();
    setTimeout(() => Speech.speak(Lang.t('memoryTask')), 600);
  }

  // ── RENDER ──────────────────────────────────────────────────
  function _render() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const cols = ageBand === 'A' ? 3 : 4;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.width = ageBand === 'A' ? 'min(92vw, 360px)' : 'min(92vw, 440px)';

    cards.forEach((card, i) => {
      const isFaceUp  = flipped.includes(i);
      const isMatched = matched.has(card.pairId);
      const isMismatch = !!card._mismatch;

      const el = document.createElement('div');
      el.className = 'memory-card'
        + (isFaceUp || isMatched ? ' face-up' : '')
        + (isMatched  ? ' matched'  : '')
        + (isMismatch ? ' mismatch' : '');

      // Back face (face-down content)
      const back = document.createElement('div');
      back.className = 'mc-back';

      // Front face (face-up content)
      const front = document.createElement('div');
      front.className = 'mc-front';

      if (card.type === 'letter') {
        front.innerHTML = `<span class="mc-letter">${card.text}</span>`;
      } else if (card.type === 'word-emoji') {
        front.innerHTML = `<span class="mc-emoji-lg">${card.emoji}</span><span class="mc-word">${card.text}</span>`;
      } else {
        // animal (Band A identical pair)
        front.innerHTML = `<span class="mc-emoji-lg">${card.emoji}</span>`;
      }

      el.appendChild(back);
      el.appendChild(front);

      if (!isMatched) el.addEventListener('click', () => _flipCard(i));
      grid.appendChild(el);
    });

    _updateCounter();
    _updateHintBtn();
  }

  function _updateCounter() {
    const el = document.getElementById('mem-counter');
    if (el) el.textContent = `${matched.size} / ${totalPairs}`;
  }

  function _updateHintBtn() {
    const btn = document.getElementById('mem-hint-btn');
    if (!btn) return;
    btn.style.display = ageBand === 'B' ? 'inline-flex' : 'none';
  }

  // ── FLIP CARD ────────────────────────────────────────────────
  function _flipCard(i) {
    if (locked) return;
    if (flipped.includes(i)) return;
    if (matched.has(cards[i].pairId)) return;
    if (flipped.length >= 2) return;

    _resetHintTimer();
    flipped.push(i);
    flipsTotal++;
    _render();
    setTimeout(() => Speech.speak(cards[i].speakText), 120);

    if (flipped.length === 2) {
      locked = true;
      setTimeout(_checkMatch, 100);
    }
  }

  function _checkMatch() {
    const [a, b] = flipped;
    const pairIdA = cards[a].pairId;
    const pairIdB = cards[b].pairId;

    if (pairIdA === pairIdB) {
      // ── MATCH ──────────────────────────────────────────────
      matched.add(pairIdA);
      flipped = [];
      locked  = false;
      Progress.record('memory', pairIdA, true);
      App.addStar();
      Speech.speak(Theme.getPraise());
      Confetti.burst();
      _render();
      Journey.advance();

      if (matched.size === totalPairs) {
        setTimeout(_showWin, 900);
      }
    } else {
      // ── MISMATCH — 250ms face-up window ────────────────────
      cards[a]._mismatch = true;
      cards[b]._mismatch = true;
      _render();

      missPerPair[pairIdA] = (missPerPair[pairIdA] || 0) + 1;
      missPerPair[pairIdB] = (missPerPair[pairIdB] || 0) + 1;
      Progress.record('memory', pairIdA, false);

      setTimeout(() => {
        cards[a]._mismatch = false;
        cards[b]._mismatch = false;
        flipped = [];
        locked  = false;
        _render();
        // Auto-solve if either pair has 4+ misses
        if ((missPerPair[pairIdA] || 0) >= 4 && !matched.has(pairIdA)) _autoSolve(pairIdA);
        else if ((missPerPair[pairIdB] || 0) >= 4 && !matched.has(pairIdB)) _autoSolve(pairIdB);
      }, 250);
    }
  }

  // ── AUTO-SOLVE (4 misses on same pair) ──────────────────────
  function _autoSolve(pairId) {
    if (matched.has(pairId)) return;
    // Flash both cards of this pair face-up briefly, then match them
    const pairIndices = cards.map((c, i) => i).filter(i => cards[i].pairId === pairId);
    flipped = [...pairIndices];
    locked  = true;
    _render();
    Speech.speak(Lang.isHe() ? 'הִנֵּה הֵם!' : 'Here they are!');
    setTimeout(() => {
      matched.add(pairId);
      flipped = [];
      locked  = false;
      App.addStar();
      Journey.advance();
      _render();
      if (matched.size === totalPairs) setTimeout(_showWin, 900);
    }, 1100);
  }

  // ── PEEK HINT ────────────────────────────────────────────────
  function peek() {
    if (locked || flipped.length > 0) return;
    _clearHintTimer();

    const candidates = cards
      .map((c, i) => i)
      .filter(i => !matched.has(cards[i].pairId) && !flipped.includes(i));
    if (candidates.length === 0) return;

    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    locked  = true;
    flipped = [idx];
    _render();
    setTimeout(() => Speech.speak(cards[idx].speakText), 120);
    setTimeout(() => {
      flipped = [];
      locked  = false;
      _render();
    }, 800);
  }

  function _resetHintTimer() {
    _clearHintTimer();
    if (ageBand !== 'B') return;
    _hintTimer = setTimeout(() => {
      const btn = document.getElementById('mem-hint-btn');
      if (btn) btn.classList.add('pulse');
    }, 8000);
  }

  function _clearHintTimer() {
    if (_hintTimer) { clearTimeout(_hintTimer); _hintTimer = null; }
    const btn = document.getElementById('mem-hint-btn');
    if (btn) btn.classList.remove('pulse');
  }

  // ── WIN SCREEN ───────────────────────────────────────────────
  function _showWin() {
    _clearHintTimer();
    const ratio  = flipsTotal / totalPairs;
    const stars  = ratio <= 2.2 ? 3 : ratio <= 3.5 ? 2 : 1;
    const overlay = document.getElementById('mem-win');
    const starsEl = document.getElementById('mem-win-stars');
    const praiseEl = document.getElementById('mem-win-praise');
    if (!overlay) return;

    starsEl.textContent  = '⭐'.repeat(stars);
    praiseEl.textContent = Lang.strings().journeyMsgs[Math.min(_journeyCount, 2)];
    overlay.style.display = 'flex';
    Confetti.burst();
    Speech.speak(Lang.t('memoryComplete'));
  }

  function _hideWin() {
    const el = document.getElementById('mem-win');
    if (el) el.style.display = 'none';
  }

  function cleanup() {
    _clearHintTimer();
  }

  return { init, peek, cleanup };
})();
