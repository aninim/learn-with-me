/**
 * nature-physics.js  —  Physics & Nature module for Learn With Me
 * Replaces modules/engineering.js entirely.
 *
 * Screens:  screen-physics-hub  |  screen-physics-quiz
 * Data:     window.PHYSICS_CONCEPTS, PHYSICS_HINT_PROMPTS, PHYSICS_UNLOCK_ORDER
 * Engines:  Progress, Adaptive, Speech, Claude, Journey, App, Lang, Confetti
 */
const Physics = (() => {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────────
  let _band       = 'A';
  let _concept    = null;
  let _pool       = [];
  let _qIdx       = 0;
  let _question   = null;
  let _attempts   = 0;
  let _postHint   = false;
  let _selectedChoice = null;

  let _hesitationTimer = null;
  let _hesitationStart = 0;

  let _magnetRAF    = null;
  let _magnetActive = false;

  let _waterState = {};   // { objId: 'float'|'sink'|null }
  let _waterDone  = false;

  let _reduceMotion = false;

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    _reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const age = parseInt(localStorage.getItem('ylmd_age') || '0');
    _band = age >= 1 ? 'B' : 'A';
    _showHub();
  }

  // ── Hub ──────────────────────────────────────────────────────────────────────
  function _showHub() {
    const hub = document.getElementById('physics-hub-list');
    if (!hub) return;
    hub.innerHTML = '';

    const order = PHYSICS_UNLOCK_ORDER[_band];
    const isHe  = Lang.isHe();

    order.forEach((conceptId, idx) => {
      const concept = PHYSICS_CONCEPTS.find(c => c.id === conceptId);
      if (!concept) return;

      const unlocked = _isUnlocked(concept);
      const pct      = Math.round(_getConceptAccuracy(conceptId) * 100);

      const row = document.createElement('button');
      row.className = 'ph-hub-row' + (unlocked ? '' : ' ph-locked');
      row.disabled  = !unlocked;
      if (unlocked) row.onclick = () => _startConcept(concept);

      const label    = _getLabel(concept);
      const rightCol = unlocked
        ? `<div class="ph-hub-bar"><div class="ph-hub-fill" style="width:${pct}%"></div></div>`
        : `<span class="ph-hub-lock">🔒</span>`;

      row.innerHTML = `
        <span class="ph-hub-icon">${concept.icon}</span>
        <span class="ph-hub-label">${label}</span>
        ${rightCol}
        <span class="ph-hub-arrow">${isHe ? '←' : '→'}</span>`;

      hub.appendChild(row);
    });

    Speech.speak(isHe
      ? 'בחר נושא — על מה רוצה ללמוד היום?'
      : 'Choose a topic — what do you want to learn today?');
  }

  function _isUnlocked(concept) {
    if (!concept.unlockAfter) return true;
    return _getConceptAccuracy(concept.unlockAfter) >= 0.6;
  }

  function _getConceptAccuracy(conceptId) {
    if (!conceptId) return 1;
    const concept = PHYSICS_CONCEPTS.find(c => c.id === conceptId);
    if (!concept) return 0;
    let total = 0, correct = 0;
    concept.questions.forEach(q => {
      const d = Progress.get ? Progress.get('physics', q.id) : null;
      if (d) { total += (d.attempts || 0); correct += (d.correct || 0); }
    });
    return total === 0 ? 0 : correct / total;
  }

  // ── Concept Start ─────────────────────────────────────────────────────────────
  function _startConcept(concept) {
    cleanup();
    _concept  = concept;
    _attempts = 0;
    _qIdx     = 0;
    _postHint = false;
    _selectedChoice = null;

    // Simple shuffle (Adaptive hook-ready)
    _pool = concept.questions.slice().sort(() => Math.random() - 0.5);

    App.show('physics-quiz');
    Journey.start('physics-journey', _pool.length, _journeyDone);
    _renderQuestion(_pool[0]);
  }

  function _journeyDone() {
    App.addStar();
    App.show('physics-hub');
    // Routing calls Physics.init() which re-renders hub with updated accuracy
  }

  // ── Question Render ───────────────────────────────────────────────────────────
  function _renderQuestion(q) {
    _question = q;
    _attempts = 0;
    _postHint = false;
    _selectedChoice = null;
    _waterState = {};
    _waterDone  = false;
    _clearHesitation();
    _cancelMagnetField();

    const isHe = Lang.isHe();

    // Title
    const titleEl = document.getElementById('physics-quiz-title');
    if (titleEl) titleEl.textContent = _getLabel(_concept);

    // Scene
    const sceneEl = document.getElementById('physics-scene');
    sceneEl.innerHTML = '';
    sceneEl.className = 'ph-scene';

    // Prompt
    document.getElementById('physics-prompt').textContent = isHe ? q.promptHe : q.promptEn;

    // Choices
    const choicesEl = document.getElementById('physics-choices');
    choicesEl.innerHTML = '';

    // Check button
    const checkBtn = document.getElementById('physics-check-btn');
    if (checkBtn) { checkBtn.style.display = 'none'; checkBtn.disabled = true; checkBtn.onclick = null; }

    // Fact / hint
    _hideOverlays();

    // Render by type
    if (q.type === 'predict_reveal') {
      _renderPredictReveal(q);
    } else if (q.type === 'sort_classify' && q.scene && q.scene.type === 'water_drag') {
      _renderWaterDrag(q);
    } else if (q.type === 'drag_interactive') {
      _renderDragInteractive(q);
    } else {
      // drop_observe + sort_classify (balance)
      _renderTapChoices(q);
    }

    // Build scene visuals
    _buildScene(q);

    // Speak prompt
    Speech.speak(isHe ? q.promptHe : q.promptEn, { rate: 0.85 });

    // Hesitation timer
    _hesitationStart = Date.now();
    _startHesitation(q);
  }

  // ── Scene Builder ─────────────────────────────────────────────────────────────
  function _buildScene(q) {
    const sceneEl = document.getElementById('physics-scene');

    // Canvas overlay (always present for particle effects)
    const canvas = document.createElement('canvas');
    canvas.id        = 'physics-canvas';
    canvas.className = 'ph-canvas';
    canvas.width     = 320;
    canvas.height    = 220;
    // Appended last so it sits on top

    if (!q.scene) { sceneEl.appendChild(canvas); return; }

    if (q.type === 'drop_observe') {
      if (q.scene.anchor) {
        const anchor = _makeEl('div', 'ph-scene-anchor', q.scene.anchor);
        sceneEl.appendChild(anchor);
      }
      const obj = _makeEl('div', 'ph-scene-obj', q.scene.object);
      obj.id = 'ph-main-obj';
      sceneEl.appendChild(obj);
      if (q.scene.ground) sceneEl.appendChild(_makeEl('div', 'ph-scene-ground', ''));

    } else if (q.type === 'sort_classify' && q.scene.type === 'balance') {
      const wrap = document.createElement('div');
      wrap.className = 'ph-balance';
      wrap.innerHTML = `
        <div class="ph-balance-obj" id="ph-bal-left">${q.scene.objects[0]}</div>
        <div class="ph-balance-beam" id="ph-balance-beam">⚖️</div>
        <div class="ph-balance-obj" id="ph-bal-right">${q.scene.objects[1]}</div>`;
      sceneEl.appendChild(wrap);

    } else if (q.type === 'sort_classify' && q.scene.type === 'water_drag') {
      _buildWaterScene(q, sceneEl, canvas);

    } else if (q.type === 'predict_reveal') {
      _buildPredictScene(q, sceneEl, canvas);

    } else if (q.type === 'drag_interactive' && q.animation === 'live_shadow') {
      _buildShadowScene(q, sceneEl, canvas);
    }

    sceneEl.appendChild(canvas);

    // Magnet field starts after DOM settles
    if (q.animation === 'magnet_attract' || q.animation === 'magnet_poles') {
      setTimeout(() => _startMagnetField(sceneEl, canvas), 80);
    }
  }

  function _makeEl(tag, cls, text) {
    const el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    return el;
  }

  // ── Choice Renderers ──────────────────────────────────────────────────────────
  function _renderTapChoices(q) {
    if (!q.choices) return;
    const choicesEl = document.getElementById('physics-choices');
    const isHe = Lang.isHe();
    q.choices.forEach(ch => {
      const btn = _makeChoiceBtn(ch, isHe);
      btn.onclick = () => _handleTapChoice(ch.id, q);
      choicesEl.appendChild(btn);
    });
  }

  function _renderPredictReveal(q) {
    if (!q.choices) return;
    const choicesEl = document.getElementById('physics-choices');
    const checkBtn  = document.getElementById('physics-check-btn');
    const isHe = Lang.isHe();

    q.choices.forEach(ch => {
      const btn = _makeChoiceBtn(ch, isHe);
      btn.onclick = () => _selectPredictChoice(ch.id, q, btn);
      choicesEl.appendChild(btn);
    });

    if (checkBtn) {
      checkBtn.style.display = '';
      checkBtn.disabled = true;
      checkBtn.textContent = isHe ? 'בדוק!' : 'Check!';
    }
  }

  function _renderWaterDrag(q) {
    // Choices area stays empty — water zone acts as the drop target
  }

  function _renderDragInteractive(q) {
    const choicesEl = document.getElementById('physics-choices');
    const isHe = Lang.isHe();
    const btn = document.createElement('button');
    btn.className = 'choice-btn ph-choice ph-done-btn';
    btn.textContent = isHe ? '!הבנתי' : 'Got it!';
    btn.onclick = () => {
      Progress.record('physics', q.id, true);
      _clearHesitation();
      setTimeout(() => _showFactCard(q, true), 300);
    };
    choicesEl.appendChild(btn);
  }

  function _makeChoiceBtn(ch, isHe) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn ph-choice';
    btn.dataset.id = ch.id;
    btn.innerHTML = `<span class="ph-ch-icon">${ch.icon}</span><span class="ph-ch-label">${isHe ? ch.labelHe : ch.labelEn}</span>`;
    return btn;
  }

  // ── Tap-choice handler (Band A) ───────────────────────────────────────────────
  function _handleTapChoice(choiceId, q) {
    _clearHesitation();
    const hesMs    = Date.now() - _hesitationStart;
    const isCorrect = choiceId === q.correctId;
    _attempts++;

    Progress.record('physics', q.id, isCorrect);
    _logAdaptive(isCorrect, hesMs);

    _runAnimation(q.animation, document.getElementById('physics-scene'), q.scene);

    setTimeout(() => {
      if (isCorrect) {
        _showFactCard(q, true);
      } else if (_attempts < 2) {
        _showTryAgain(q);
      } else {
        _showFactCard(q, false);
      }
    }, 1100);
  }

  // ── Predict-Reveal handlers (Band B) ─────────────────────────────────────────
  function _selectPredictChoice(choiceId, q, btnEl) {
    _selectedChoice = choiceId;
    document.querySelectorAll('#physics-choices .ph-choice').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    const checkBtn = document.getElementById('physics-check-btn');
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.onclick = () => _handleCheckDispatch(q);
    }
  }

  function _handleCheckDispatch(q) {
    if (_postHint) _handleCheckFinal(q);
    else           _handleCheck(q);
  }

  function _handleCheck(q) {
    if (!_selectedChoice) return;
    _clearHesitation();
    const hesMs     = Date.now() - _hesitationStart;
    const isCorrect = _selectedChoice === q.correctId;
    const checkBtn  = document.getElementById('physics-check-btn');
    if (checkBtn) { checkBtn.disabled = true; checkBtn.onclick = null; }

    _attempts++;
    Progress.record('physics', q.id, isCorrect);
    _logAdaptive(isCorrect, hesMs);

    _runAnimation(q.animation, document.getElementById('physics-scene'), q.scene);

    const delay = (q.animation === 'magnet_attract') ? 1600 : 1200;
    setTimeout(async () => {
      if (isCorrect) {
        _showFactCard(q, true);
      } else if (_attempts === 1) {
        _showTryAgain(q);
      } else {
        // 2nd wrong → Socratic hint
        await _showHintBubble(q);
      }
    }, delay);
  }

  async function _showHintBubble(q) {
    const age = (parseInt(localStorage.getItem('ylmd_age') || '0') === 0) ? 4 : 6;
    const fn  = PHYSICS_HINT_PROMPTS[_concept.id] || PHYSICS_HINT_PROMPTS['default'];
    const prompt = fn(age);
    const system = `אתה מדריך מדע חם ועדין לילד בגיל ${age}. שאל שאלה פתוחה אחת בלבד. אל תיתן את התשובה. משפט אחד. מילים פשוטות מאוד.`;

    const bubble   = document.getElementById('physics-hint-bubble');
    const hintText = document.getElementById('physics-hint-text');
    if (bubble) bubble.style.display = '';
    if (hintText) hintText.textContent = '...';

    try {
      const hint = await Claude.hint(prompt, system);
      if (hintText) hintText.textContent = hint;
      Speech.speak(hint);
    } catch (e) {
      const fallback = Lang.isHe() ? 'חשוב שוב — מה אתה חושב?' : 'Think again — what do you think?';
      if (hintText) hintText.textContent = fallback;
      Speech.speak(fallback);
    }

    // Reset choices for attempt 3
    _postHint = true;
    _selectedChoice = null;
    document.querySelectorAll('#physics-choices .ph-choice').forEach(b => {
      b.classList.remove('selected', 'reveal-wrong');
      b.disabled = false;
    });
    const checkBtn = document.getElementById('physics-check-btn');
    if (checkBtn) { checkBtn.disabled = true; checkBtn.onclick = () => _handleCheckFinal(q); }
    _hesitationStart = Date.now();
    _startHesitation(q);
  }

  function _handleCheckFinal(q) {
    if (!_selectedChoice) return;
    _clearHesitation();
    _postHint = false;
    const checkBtn = document.getElementById('physics-check-btn');
    if (checkBtn) { checkBtn.disabled = true; checkBtn.onclick = null; }
    _attempts++;

    const bubble = document.getElementById('physics-hint-bubble');
    if (bubble) bubble.style.display = 'none';

    _runAnimation(q.animation, document.getElementById('physics-scene'), q.scene);
    setTimeout(() => _showFactCard(q, _selectedChoice === q.correctId), 1200);
  }

  // ── Water Drag Scene ──────────────────────────────────────────────────────────
  function _buildWaterScene(q, sceneEl, canvas) {
    // Shelf of items (top)
    const shelf = document.createElement('div');
    shelf.className = 'ph-water-shelf';
    shelf.id = 'ph-water-shelf';

    // Water zone (bottom)
    const waterZone = document.createElement('div');
    waterZone.className = 'ph-water-zone';
    waterZone.id = 'ph-water-zone';
    const surface = _makeEl('div', 'ph-water-surface physics-water-surface', '🌊🌊🌊');
    waterZone.appendChild(surface);

    q.scene.objects.forEach(obj => {
      _waterState[obj.id] = null;
      const el = document.createElement('div');
      el.className   = 'ph-water-item';
      el.id          = 'ph-water-item-' + obj.id;
      el.textContent = obj.icon;
      el.dataset.objId  = obj.id;
      el.dataset.floats = obj.floats;
      _setupWaterDrag(el, obj, q, canvas, waterZone, sceneEl);
      shelf.appendChild(el);
    });

    sceneEl.appendChild(shelf);
    sceneEl.appendChild(waterZone);
  }

  function _setupWaterDrag(el, obj, q, canvas, waterZone, sceneEl) {
    let clone = null;

    el.addEventListener('pointerdown', e => {
      if (_waterState[obj.id] !== null) return;
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch(err) {}
      clone = el.cloneNode(true);
      clone.style.cssText = `position:fixed;left:${e.clientX-20}px;top:${e.clientY-20}px;
        font-size:2.5rem;pointer-events:none;z-index:9999;will-change:transform;`;
      document.body.appendChild(clone);
      el.style.opacity = '0.3';
    });

    el.addEventListener('pointermove', e => {
      if (!clone) return;
      clone.style.left = (e.clientX - 20) + 'px';
      clone.style.top  = (e.clientY - 20) + 'px';
    });

    el.addEventListener('pointerup', e => {
      if (!clone) return;
      const zr = waterZone.getBoundingClientRect();
      const hit = e.clientX >= zr.left && e.clientX <= zr.right
               && e.clientY >= zr.top  && e.clientY <= zr.bottom;
      clone.remove(); clone = null;
      el.style.opacity = '1';
      if (hit) _dropIntoWater(obj, q, canvas, sceneEl);
    });

    el.addEventListener('pointercancel', () => {
      if (clone) { clone.remove(); clone = null; }
      el.style.opacity = '1';
    });
  }

  function _dropIntoWater(obj, q, canvas, sceneEl) {
    if (_waterState[obj.id] !== null) return;
    _waterState[obj.id] = obj.floats ? 'float' : 'sink';

    const itemEl   = document.getElementById('ph-water-item-' + obj.id);
    const zoneEl   = document.getElementById('ph-water-zone');
    const ctx      = canvas ? canvas.getContext('2d') : null;
    const sr       = sceneEl.getBoundingClientRect();
    const dropX    = sr.width / 2;
    const waterY   = 40;

    if (itemEl && zoneEl) {
      zoneEl.appendChild(itemEl);
      itemEl.style.position = 'absolute';
      itemEl.style.fontSize = '2rem';
      itemEl.style.left = (Math.random() * 55 + 20) + '%';

      if (obj.floats) {
        itemEl.style.top = (waterY - 15) + 'px';
        itemEl.classList.add('ph-float-bob');
        _drawSplash(ctx, dropX, waterY);
        _playSplash();
      } else {
        itemEl.style.top = waterY + 'px';
        itemEl.style.transition = 'top 0.7s cubic-bezier(0.1,0,0.3,1), opacity 0.5s';
        itemEl.style.opacity = '0.7';
        setTimeout(() => { itemEl.style.top = '72%'; itemEl.style.opacity = '0.4'; }, 50);
        _drawSplash(ctx, dropX, waterY);
        _playSplash();
        setTimeout(() => _drawBubbles(ctx, dropX, sr.height * 0.72), 200);
      }
    }

    // Check all dropped
    const allDone = q.scene.objects.every(o => _waterState[o.id] !== null);
    if (allDone && !_waterDone) {
      _waterDone  = true;
      const isCorrect = q.scene.objects.every(o =>
        (o.floats && _waterState[o.id] === 'float') ||
        (!o.floats && _waterState[o.id] === 'sink'));
      _clearHesitation();
      Progress.record('physics', q.id, isCorrect);
      _logAdaptive(isCorrect, Date.now() - _hesitationStart);
      setTimeout(() => _showFactCard(q, isCorrect), 1200);
    }
  }

  // ── Shadow Scene ──────────────────────────────────────────────────────────────
  function _buildShadowScene(q, sceneEl, canvas) {
    const isHe = Lang.isHe();
    const ground = _makeEl('div', 'ph-scene-ground', '');
    const shadow = _makeEl('div', 'ph-shadow', '');
    shadow.id = 'ph-shadow';
    const obj = _makeEl('div', 'ph-shadow-obj ph-scene-obj', q.scene.object);
    obj.id = 'ph-shadow-obj';

    const sun = _makeEl('div', 'ph-sun', q.scene.draggable);
    sun.id = 'ph-sun';
    sun.style.cssText = isHe
      ? 'position:absolute;top:15%;right:15%;cursor:grab;font-size:3rem;will-change:transform;touch-action:none;'
      : 'position:absolute;top:15%;left:15%;cursor:grab;font-size:3rem;will-change:transform;touch-action:none;';

    sceneEl.appendChild(ground);
    sceneEl.appendChild(shadow);
    sceneEl.appendChild(obj);
    sceneEl.appendChild(sun);

    _setupSunDrag(sun, sceneEl);
    setTimeout(() => _updateShadow(sceneEl), 150);
  }

  function _setupSunDrag(sunEl, sceneEl) {
    let dragging = false;
    sunEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      dragging = true;
      sunEl.style.cursor = 'grabbing';
      try { sunEl.setPointerCapture(e.pointerId); } catch(err) {}
    });
    sunEl.addEventListener('pointermove', e => {
      if (!dragging) return;
      const sr = sceneEl.getBoundingClientRect();
      const x  = e.clientX - sr.left;
      const y  = e.clientY - sr.top;
      sunEl.style.left   = (x - 24) + 'px';
      sunEl.style.top    = (y - 24) + 'px';
      sunEl.style.right  = 'auto';
      _updateShadow(sceneEl);
    });
    sunEl.addEventListener('pointerup',     () => { dragging = false; sunEl.style.cursor = 'grab'; });
    sunEl.addEventListener('pointercancel', () => { dragging = false; });
  }

  function _updateShadow(sceneEl) {
    const sunEl    = document.getElementById('ph-sun');
    const objEl    = document.getElementById('ph-shadow-obj');
    const shadowEl = document.getElementById('ph-shadow');
    if (!sunEl || !objEl || !shadowEl) return;

    const sr   = sceneEl.getBoundingClientRect();
    const sunR = sunEl.getBoundingClientRect();
    const objR = objEl.getBoundingClientRect();

    const sunX = sunR.left + sunR.width  / 2 - sr.left;
    const sunY = sunR.top  + sunR.height / 2 - sr.top;
    const objX = objR.left + objR.width  / 2 - sr.left;
    const objY = objR.top  + objR.height / 2 - sr.top;

    const dx   = objX - sunX;
    const dy   = objY - sunY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const shadowLength = Math.max(20, (sunY / (sr.height || 300)) * 120);
    const squish       = Math.max(0.2, 1 - shadowLength / 200);

    shadowEl.style.left      = (objX + (dx / dist) * shadowLength - 20) + 'px';
    shadowEl.style.top       = (objY + 22) + 'px';
    shadowEl.style.transform = `scaleX(${0.6 + squish * 0.4}) scaleY(${squish * 0.4})`;
    shadowEl.style.opacity   = String(Math.max(0.1, 0.7 - shadowLength / 200));
  }

  // ── Predict Scene Builder ─────────────────────────────────────────────────────
  function _buildPredictScene(q, sceneEl, canvas) {
    if (q.animation === 'magnet_attract') {
      _buildMagnetAttractScene(q, sceneEl);
    } else if (q.animation === 'magnet_poles') {
      _buildMagnetPolesScene(sceneEl);
    } else if (q.animation === 'sound_waves') {
      _buildSoundScene(q, sceneEl);
    } else {
      // Generic — render objects
      const icons = q.scene.objects || (q.scene.object ? [q.scene.object] : []);
      const row = document.createElement('div');
      row.className = 'ph-obj-row';
      icons.forEach((icon, i) => {
        const el = _makeEl('div', 'ph-scene-obj', icon);
        el.id = `ph-obj-${i}`;
        row.appendChild(el);
      });
      sceneEl.appendChild(row);
      if (q.scene.ground) sceneEl.appendChild(_makeEl('div', 'ph-scene-ground', ''));
    }
  }

  function _buildMagnetAttractScene(q, sceneEl) {
    const magnet = _makeEl('div', 'ph-scene-obj ph-magnet', q.scene.magnet || '🧲');
    magnet.id = 'ph-magnet';
    sceneEl.appendChild(magnet);

    const shelf = document.createElement('div');
    shelf.className = 'ph-mag-shelf';
    (q.scene.objects || []).forEach((icon, i) => {
      const el = _makeEl('div', 'ph-mag-item', icon);
      el.id = `ph-mag-item-${i}`;
      shelf.appendChild(el);
    });
    sceneEl.appendChild(shelf);
  }

  function _buildMagnetPolesScene(sceneEl) {
    const row = document.createElement('div');
    row.className = 'ph-mag-poles-row';
    const m1 = _makeEl('div', 'ph-scene-obj ph-magnet', '🧲');
    const m2 = _makeEl('div', 'ph-scene-obj ph-magnet ph-magnet-flip', '🧲');
    m1.id = 'ph-magnet';  m2.id = 'ph-magnet-2';
    row.appendChild(m1);  row.appendChild(m2);
    sceneEl.appendChild(row);
  }

  function _buildSoundScene(q, sceneEl) {
    const speaker = _makeEl('div', 'ph-scene-obj ph-speaker', q.scene.speaker || '🔊');
    speaker.id = 'ph-speaker';
    const figRow = document.createElement('div');
    figRow.className = 'ph-fig-row';
    (q.scene.figures || []).forEach((fig, i) => {
      const el = _makeEl('div', `ph-fig ph-fig-${fig.dist}`, fig.icon);
      el.id = `ph-fig-${i}`;
      figRow.appendChild(el);
    });
    sceneEl.appendChild(speaker);
    sceneEl.appendChild(figRow);
  }

  // ── Animation Dispatch ────────────────────────────────────────────────────────
  function _runAnimation(animName, sceneEl, sceneData) {
    if (!animName || !sceneEl) return;
    const canvas = document.getElementById('physics-canvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;

    switch (animName) {
      case 'gravity_fall':    _animGravityFall(sceneEl, ctx);           break;
      case 'throw_up_fall':   _animThrowUpFall(sceneEl, ctx);           break;
      case 'balance_tip':     _animBalanceTip(sceneEl);                 break;
      case 'rainbow_reveal':  _animRainbowReveal(sceneEl);              break;
      case 'sky_toggle':      _animSkyToggle(sceneEl);                  break;
      case 'dual_drop':       _animDualDrop(sceneEl, ctx);              break;
      case 'roll_off_edge':   _animRollOffEdge(sceneEl, ctx);           break;
      case 'magnet_attract':  _animMagnetAttract(sceneEl, ctx, sceneData); break;
      case 'magnet_poles':    _animMagnetPoles(sceneEl);                break;
      case 'dissolve_reveal': _animDissolveReveal(sceneEl, ctx);        break;
      case 'sound_waves':     _animSoundWaves(sceneEl, ctx);            break;
      case 'ice_melt':        _animIceMelt(sceneEl);                    break;
      case 'float_or_sink':   /* handled inline */                      break;
      case 'live_shadow':     /* interactive, no trigger */             break;
    }
  }

  // ── Animations ────────────────────────────────────────────────────────────────
  function _animGravityFall(sceneEl, ctx) {
    const obj = document.getElementById('ph-main-obj');
    if (!obj) return;
    if (_reduceMotion) { obj.style.transform = 'translateY(200px)'; _playThud(); return; }
    obj.style.willChange = 'transform';
    obj.classList.add('physics-falling');
    setTimeout(() => {
      if (ctx) {
        const r  = obj.getBoundingClientRect();
        const sr = sceneEl.getBoundingClientRect();
        _drawImpactDust(ctx, r.left - sr.left + r.width / 2, 180);
      }
      _playThud();
    }, 600);
  }

  function _animThrowUpFall(sceneEl, ctx) {
    const obj = document.getElementById('ph-main-obj');
    if (!obj) return;
    if (_reduceMotion) { obj.style.transform = 'translateY(160px)'; _playThud(); return; }
    obj.style.willChange   = 'transform';
    obj.style.transition   = 'transform 0.4s cubic-bezier(0,0,0.6,1)';
    obj.style.transform    = 'translateY(-100px)';
    setTimeout(() => {
      obj.style.transition = 'transform 0.6s cubic-bezier(0.4,0,1,1)';
      obj.style.transform  = 'translateY(160px) rotate(15deg)';
      setTimeout(() => { _playThud(); if (ctx) _drawImpactDust(ctx, 160, 170); }, 600);
    }, 400);
  }

  function _animBalanceTip(sceneEl) {
    const beam  = document.getElementById('ph-balance-beam');
    const left  = document.getElementById('ph-bal-left');
    const right = document.getElementById('ph-bal-right');
    if (!beam || !left || !right) return;
    if (_reduceMotion) return;

    const leftIsHeavy = _question && (_question.correctId === _question.choices[0].id);
    beam.style.transition  = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    beam.style.transform   = `rotate(${leftIsHeavy ? '12deg' : '-12deg'})`;
    left.style.transition  = 'transform 0.5s';
    left.style.transform   = `translateY(${leftIsHeavy ? '20px' : '-20px'})`;
    right.style.transition = 'transform 0.5s';
    right.style.transform  = `translateY(${leftIsHeavy ? '-20px' : '20px'})`;
    _playThud();
  }

  function _animRainbowReveal(sceneEl) {
    const isHe   = Lang.isHe();
    const colors = ['#FF0000','#FF7F00','#FFFF00','#00CC00','#0066FF','#4B0082','#8B00FF'];
    const namesHe = ['אָדֹם','כָּתֹם','צָהֹב','יָרֹק','כָּחֹל','אִינְדִּיגוֹ','סָגֹל'];
    const namesEn = ['Red','Orange','Yellow','Green','Blue','Indigo','Violet'];
    const names   = isHe ? namesHe : namesEn;

    const wrap = document.createElement('div');
    wrap.className = 'ph-rainbow-wrapper';
    sceneEl.appendChild(wrap);

    colors.forEach((color, i) => {
      const arc = document.createElement('div');
      arc.className = 'ph-rainbow-arc' + (isHe ? ' rtl-sweep' : '');
      arc.style.background       = color;
      arc.style.animationDelay   = (i * 0.3) + 's';
      arc.style.bottom           = (i * 10 + 15) + 'px';
      arc.style.height           = ((7 - i) * 8 + 18) + 'px';
      wrap.appendChild(arc);
      if (!_reduceMotion) setTimeout(() => Speech.speak(names[i]), i * 300 + 200);
    });
  }

  function _animSkyToggle(sceneEl) {
    const answer = _selectedChoice || (_question && _question.correctId) || 'day';
    const isDay  = answer === 'day';
    sceneEl.style.transition = 'background 1s ease';
    sceneEl.style.background = isDay
      ? 'linear-gradient(180deg,#87CEEB,#FFF9F0)'
      : 'linear-gradient(180deg,#1A1A2E,#2C2C5B)';

    sceneEl.querySelectorAll('.ph-sky-obj').forEach(e => e.remove());
    const body = _makeEl('div', 'ph-sky-obj ph-scene-obj', isDay ? '☀️' : '🌙');
    body.style.cssText = 'position:absolute;top:20%;left:50%;transform:translateX(-50%);font-size:4rem;';
    sceneEl.appendChild(body);

    if (!isDay) {
      for (let i = 0; i < 5; i++) {
        const star = _makeEl('div', 'ph-sky-obj', '⭐');
        star.style.cssText = `position:absolute;top:${Math.random()*35+5}%;left:${Math.random()*75+5}%;font-size:${(Math.random()*0.6+0.8).toFixed(1)}rem;`;
        sceneEl.appendChild(star);
      }
    }
  }

  function _animDualDrop(sceneEl, ctx) {
    const objs = sceneEl.querySelectorAll('.ph-scene-obj');
    if (_reduceMotion) { objs.forEach(o => { o.style.transform = 'translateY(160px)'; }); return; }
    objs.forEach((obj, i) => {
      obj.style.willChange = 'transform';
      if (i === 0) {
        // Ball — faster
        obj.classList.add('physics-falling');
      } else {
        // Feather — slower, wobble
        obj.style.animation = 'ph-feather-fall 1.6s ease-in forwards';
      }
    });
    setTimeout(() => { _playThud(); if (ctx) _drawImpactDust(ctx, 100, 180); }, 750);
  }

  function _animRollOffEdge(sceneEl, ctx) {
    const obj = document.getElementById('ph-obj-0') || sceneEl.querySelector('.ph-scene-obj');
    if (!obj || _reduceMotion) return;
    obj.style.willChange  = 'transform';
    obj.style.transition  = 'transform 0.5s linear';
    obj.style.transform   = 'translateX(55px)';
    setTimeout(() => {
      obj.style.transition = 'transform 0.55s cubic-bezier(0.4,0,1,1)';
      obj.style.transform  = 'translateX(100px) translateY(160px) rotate(200deg)';
      setTimeout(() => _playThud(), 550);
    }, 500);
  }

  function _animMagnetAttract(sceneEl, ctx, sceneData) {
    _cancelMagnetField();
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const magnetEl = document.getElementById('ph-magnet');
    if (!magnetEl) return;
    const sr = sceneEl.getBoundingClientRect();
    const mr = magnetEl.getBoundingClientRect();
    const tx = mr.left - sr.left + mr.width  / 2;
    const ty = mr.top  - sr.top  + mr.height / 2;

    const items = sceneEl.querySelectorAll('.ph-mag-item');
    items.forEach((item, i) => {
      setTimeout(() => {
        if (i < 2) {
          // Metal — vibrate then fly
          item.classList.add('ph-vibrate');
          setTimeout(() => {
            item.classList.remove('ph-vibrate');
            _flyToMagnet(item, tx, ty, sceneEl, () => {
              item.style.opacity  = '0.65';
              item.style.fontSize = '1.4rem';
              magnetEl.classList.add('ph-magnet-glow');
              _playMagnetSnap();
            });
          }, 200);
        } else {
          // Non-metal — lean and snap back
          item.style.transition = 'transform 0.15s ease-in';
          item.style.transform  = 'rotate(8deg)';
          setTimeout(() => {
            item.style.transition = 'transform 0.15s ease-out';
            item.style.transform  = 'rotate(0deg)';
          }, 150);
        }
      }, i * 80);
    });
  }

  function _flyToMagnet(el, targetX, targetY, sceneEl, onComplete) {
    const sr = sceneEl.getBoundingClientRect();
    const r  = el.getBoundingClientRect();
    const startX = r.left - sr.left + r.width  / 2;
    const startY = r.top  - sr.top  + r.height / 2;
    const cpX    = (startX + targetX) / 2;
    const cpY    = Math.min(startY, targetY) - 40;
    const dur    = 380;
    let   t0     = null;

    el.style.position = 'absolute';
    el.style.zIndex   = '10';

    function step(ts) {
      if (!t0) t0 = ts;
      const t    = Math.min((ts - t0) / dur, 1);
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const x    = (1-ease)*(1-ease)*startX + 2*(1-ease)*ease*cpX + ease*ease*targetX;
      const y    = (1-ease)*(1-ease)*startY + 2*(1-ease)*ease*cpY + ease*ease*targetY;
      el.style.left = (x - r.width  / 2) + 'px';
      el.style.top  = (y - r.height / 2) + 'px';
      if (t < 1) requestAnimationFrame(step);
      else if (onComplete) onComplete();
    }
    requestAnimationFrame(step);
  }

  function _animMagnetPoles(sceneEl) {
    _cancelMagnetField();
    const m1 = document.getElementById('ph-magnet');
    const m2 = document.getElementById('ph-magnet-2');
    if (!m1 || !m2 || _reduceMotion) return;
    const ease = 'cubic-bezier(0.34,1.56,0.64,1)';
    m1.style.transition = `transform 0.5s ${ease}`;
    m2.style.transition = `transform 0.5s ${ease}`;
    m1.style.transform  = 'translateX(-55px)';
    m2.style.transform  = 'translateX(55px)';
  }

  function _animDissolveReveal(sceneEl, ctx) {
    const obj = sceneEl.querySelector('.ph-scene-obj');
    if (!obj) return;
    const sr = sceneEl.getBoundingClientRect();
    if (ctx) _drawSplash(ctx, sr.width / 2, 80);
    _playSplash();
    obj.style.transition = 'transform 0.4s ease-in';
    obj.style.transform  = 'translateY(70px)';
    setTimeout(() => {
      let opacity = 1, scale = 1;
      const iv = setInterval(() => {
        opacity -= 0.07; scale -= 0.05;
        obj.style.opacity   = String(Math.max(0, opacity));
        obj.style.transform = `translateY(70px) scale(${Math.max(0.3, scale)})`;
        if (opacity <= 0) { clearInterval(iv); obj.style.display = 'none'; }
      }, 100);
    }, 450);
  }

  function _animSoundWaves(sceneEl, ctx) {
    if (!ctx || _reduceMotion) return;
    const speakerEl = document.getElementById('ph-speaker');
    if (!speakerEl) return;
    const sr = sceneEl.getBoundingClientRect();
    const r  = speakerEl.getBoundingClientRect();
    const sx = r.left - sr.left + r.width  / 2;
    const sy = r.top  - sr.top  + r.height / 2;
    _drawSoundWaves(ctx, sx, sy);
  }

  function _animIceMelt(sceneEl) {
    const obj = document.getElementById('ph-obj-0') || sceneEl.querySelector('.ph-scene-obj');
    if (!obj) return;
    if (_reduceMotion) { obj.textContent = '💧'; return; }
    obj.style.transition = 'font-size 2s ease-in';
    obj.style.fontSize   = '0.8rem';
    setTimeout(() => { obj.textContent = '💧'; obj.style.fontSize = '3rem'; obj.style.transition = 'font-size 0.3s'; }, 2000);
  }

  // ── Magnet Field (idle canvas loop) ──────────────────────────────────────────
  function _startMagnetField(sceneEl, canvas) {
    const magnetEl = document.getElementById('ph-magnet');
    if (!magnetEl || !canvas) return;
    const sr  = sceneEl.getBoundingClientRect();
    const mr  = magnetEl.getBoundingClientRect();
    const mx  = mr.left - sr.left + mr.width  / 2;
    const my  = mr.top  - sr.top  + mr.height / 2;
    const ctx = canvas.getContext('2d');
    _magnetActive = true;
    _loopMagnetField(ctx, mx, my, canvas);
  }

  function _loopMagnetField(ctx, mx, my, canvas) {
    if (!_magnetActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + (Date.now() * 0.0005);
      const x = mx + Math.cos(angle) * 70;
      const y = my + Math.sin(angle) * 40;
      ctx.globalAlpha = 0.12 + Math.sin(angle * 3) * 0.06;
      ctx.fillStyle   = '#555';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
    _magnetRAF = requestAnimationFrame(() => _loopMagnetField(ctx, mx, my, canvas));
  }

  function _cancelMagnetField() {
    _magnetActive = false;
    if (_magnetRAF) { cancelAnimationFrame(_magnetRAF); _magnetRAF = null; }
  }

  // ── Canvas Effects ────────────────────────────────────────────────────────────
  function _drawImpactDust(ctx, x, y) {
    if (!ctx || _reduceMotion) return;
    const pts = Array.from({length: 7}, () => ({
      x, y, vx: (Math.random()-0.5)*4, vy: -(Math.random()*3+1),
      alpha: 1, r: Math.random()*4+2, color: '#C8A97E'
    }));
    let f = 0;
    (function tick() {
      if (f++ > 20) return;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.alpha -= 0.05;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    })();
  }

  function _drawSplash(ctx, x, waterY) {
    if (!ctx || _reduceMotion) return;
    const drops = Array.from({length: 5}, (_, i) => {
      const ang = Math.PI * 0.3 + i * Math.PI * 0.1;
      const spd = Math.random() * 3 + 2;
      return { x, y: waterY, vx: Math.cos(ang)*spd*(i%2?-1:1), vy: -Math.sin(ang)*spd, alpha: 1, r: Math.random()*3+2 };
    });
    let f = 0;
    (function tick() {
      if (f++ > 18) return;
      drops.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.vy += 0.3; d.alpha -= 0.055;
        ctx.globalAlpha = Math.max(0, d.alpha);
        ctx.fillStyle   = '#7EC8E3';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    })();
  }

  function _drawBubbles(ctx, x, bottomY) {
    if (!ctx || _reduceMotion) return;
    const bubs = Array.from({length: 4}, () => ({
      x: x + (Math.random()-0.5)*20, y: bottomY,
      vy: -(Math.random()*1.5+0.8), alpha: 0.7, r: Math.random()*4+2
    }));
    let f = 0;
    (function tick() {
      if (f++ > 40) return;
      bubs.forEach(b => {
        b.y += b.vy; b.x += Math.sin(f*0.2)*0.5; b.alpha -= 0.017;
        ctx.globalAlpha  = Math.max(0, b.alpha);
        ctx.strokeStyle  = '#7EC8E3';
        ctx.lineWidth    = 1.5;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    })();
  }

  function _drawSoundWaves(ctx, sx, sy) {
    const waves = [{ r: 10, alpha: 0.6 }];
    let f = 0;
    (function tick() {
      if (f > 80) return;
      if (f % 20 === 0 && f > 0) waves.push({ r: 10, alpha: 0.6 });
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      waves.forEach(w => {
        w.r += 2; w.alpha -= 0.008;
        ctx.globalAlpha = Math.max(0, w.alpha);
        ctx.strokeStyle = '#FFD166'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy, w.r, 0, Math.PI*2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      f++;
      requestAnimationFrame(tick);
    })();
  }

  // ── Web Audio ─────────────────────────────────────────────────────────────────
  function _playThud() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.frequency.setValueAtTime(80, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(30, a.currentTime + 0.15);
      g.gain.setValueAtTime(0.3, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.2);
      o.start(); o.stop(a.currentTime + 0.2);
    } catch(e) {}
  }

  function _playSplash() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine';
      o.connect(g); g.connect(a.destination);
      o.frequency.setValueAtTime(800, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, a.currentTime + 0.25);
      g.gain.setValueAtTime(0.15, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.3);
      o.start(); o.stop(a.currentTime + 0.3);
    } catch(e) {}
  }

  function _playMagnetSnap() {
    try {
      const a   = new (window.AudioContext || window.webkitAudioContext)();
      const buf = a.createBuffer(1, a.sampleRate * 0.05, a.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1-i/d.length);
      const src = a.createBufferSource(), g = a.createGain();
      src.buffer = buf; src.connect(g); g.connect(a.destination);
      g.gain.value = 0.2;
      src.start();
    } catch(e) {}
  }

  // ── Feedback ──────────────────────────────────────────────────────────────────
  function _showTryAgain(q) {
    const isHe  = Lang.isHe();
    const msg   = isHe ? 'מעניין... בוא ננסה שוב! 🔄' : 'Interesting... try again! 🔄';
    const prompt = document.getElementById('physics-prompt');
    const orig   = prompt.textContent;

    Speech.speak(isHe ? 'מעניין... בוא ננסה שוב' : "Interesting, let's try again");
    prompt.textContent = msg;
    prompt.classList.add('ph-try-again');

    setTimeout(() => {
      prompt.textContent = orig;
      prompt.classList.remove('ph-try-again');
      document.querySelectorAll('#physics-choices .ph-choice').forEach(b => {
        b.classList.remove('selected', 'reveal-wrong', 'reveal-correct');
        b.disabled = false;
      });
      _selectedChoice = null;
      const checkBtn = document.getElementById('physics-check-btn');
      if (checkBtn) { checkBtn.disabled = true; }
      _hesitationStart = Date.now();
      _startHesitation(q);
    }, 1200);
  }

  function _showFactCard(q, isCorrect) {
    _cancelMagnetField();
    _clearHesitation();
    const isHe = Lang.isHe();

    if (isCorrect) {
      App.addStar();
      if (typeof Confetti !== 'undefined') Confetti.burst();
      Speech.speak(isHe ? 'צדקת!' : 'Correct!');
    } else {
      // Reveal correct answer visually
      if (q.choices) {
        document.querySelectorAll('#physics-choices .ph-choice').forEach(b => {
          b.classList.toggle('reveal-correct', b.dataset.id === q.correctId);
          b.classList.toggle('reveal-wrong',   b.dataset.id !== q.correctId && b.classList.contains('selected'));
        });
      }
      Speech.speak(isHe ? 'כך זה עובד:' : "Here's how it works:");
    }

    // Show fact
    const factCard = document.getElementById('physics-fact-card');
    const factText = document.getElementById('physics-fact-text');
    if (factCard) factCard.style.display = '';
    if (factText) factText.textContent = isHe ? q.factHe : q.factEn;
    setTimeout(() => Speech.speak(isHe ? q.factHe : q.factEn, { rate: 0.85 }), 600);

    // Parent prompt (Band B + correct)
    if (_band === 'B' && isCorrect && q.parentPromptHe) {
      const parentCard = document.getElementById('physics-parent-prompt');
      const parentText = document.getElementById('physics-parent-text');
      if (parentCard) parentCard.style.display = '';
      if (parentText) parentText.textContent = isHe ? q.parentPromptHe : q.parentPromptEn;
    }

    // Next button
    const nextBtn = document.getElementById('physics-next-btn');
    if (nextBtn) {
      nextBtn.textContent = isHe ? 'השאלה הבאה ◀' : '▶ Next';
      nextBtn.onclick = _advance;
    }
  }

  function _advance() {
    _hideOverlays();
    _cancelMagnetField();
    Journey.advance();
    _qIdx++;
    if (_qIdx < _pool.length) {
      _renderQuestion(_pool[_qIdx]);
    }
    // If last step: Journey.advance() calls _journeyDone → App.show('physics-hub') → Physics.init()
  }

  function _hideOverlays() {
    ['physics-fact-card','physics-parent-prompt','physics-hint-bubble'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  // ── Hesitation Timer ──────────────────────────────────────────────────────────
  function _startHesitation(q) {
    _clearHesitation();
    _hesitationTimer = setTimeout(() => {
      if (_attempts === 0) {
        const isHe = Lang.isHe();
        Speech.speak(isHe ? q.promptRepeatHe : q.promptRepeatEn, { rate: 0.8 });
        _hesitationStart = Date.now();
        _startHesitation(q); // reset
      }
    }, 8000);
  }

  function _clearHesitation() {
    if (_hesitationTimer) { clearTimeout(_hesitationTimer); _hesitationTimer = null; }
  }

  // ── Nikud / Label ─────────────────────────────────────────────────────────────
  function _getLabel(concept) {
    if (!concept) return '';
    if (!Lang.isHe()) return concept.labelEn;
    return (_getConceptAccuracy(concept.id) < 0.8) ? concept.labelHeNikud : concept.labelHe;
  }

  // ── Adaptive helper ───────────────────────────────────────────────────────────
  function _logAdaptive(isCorrect, hesMs) {
    if (typeof Adaptive !== 'undefined' && Adaptive.logAttempt) {
      Adaptive.logAttempt('physics', _concept.id, isCorrect, { hesitationMs: hesMs });
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  function cleanup() {
    _clearHesitation();
    _cancelMagnetField();
    _postHint = false;
  }

  return { init, cleanup };
})();
