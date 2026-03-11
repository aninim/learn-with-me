// ============================================================
// PROFILES ENGINE — Phase 10
// Multi-child support. Each child has a profile object + separate progress key.
// Profiles list  → localStorage['ylmd_profiles']      (JSON array)
// Active profile → localStorage['ylmd_active_profile'] (profile id string)
// Child progress → localStorage['ylmd_profile_{id}']  (same schema as old ylmd_progress)
// ============================================================
const Profiles = (() => {
  const PROFILES_KEY = 'ylmd_profiles';
  const ACTIVE_KEY   = 'ylmd_active_profile';
  const MAX_PROFILES = 6;
  const AVATARS = ['🦁','🐸','🚀','🐶','🐰','🦊','🐯','🦄','🐼','🐨','🦋','⭐'];

  function _uuid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function _all() {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []; }
    catch { return []; }
  }

  function _saveAll(list) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
  }

  function getAll() { return _all(); }

  function activeId() {
    return localStorage.getItem(ACTIVE_KEY) || null;
  }

  function current() {
    const id = activeId();
    return _all().find(p => p.id === id) || null;
  }

  // localStorage key for a profile's progress data
  function progressKey(id) {
    return 'ylmd_profile_' + (id || activeId() || 'default');
  }

  // Create a new profile. Returns the profile object, or null if max reached.
  function create(name, avatar, ageGroup) {
    const list = _all();
    if (list.length >= MAX_PROFILES) return null;
    const theme = (typeof Theme !== 'undefined') ? Theme.getCurrent() : 'dino';
    const lang  = (typeof Lang  !== 'undefined') ? (Lang.isHe() ? 'he' : 'en') : 'he';
    const profile = {
      id:        _uuid(),
      name:      name   || 'ילד',
      avatar:    avatar || AVATARS[list.length % AVATARS.length],
      ageGroup:  ageGroup || '3-4',
      theme,
      language:  lang,
      createdAt: new Date().toISOString(),
    };
    list.push(profile);
    _saveAll(list);
    return profile;
  }

  // Make a profile active and restore its settings (age, theme, language)
  function select(id) {
    localStorage.setItem(ACTIVE_KEY, id);
    const p = _all().find(pr => pr.id === id);
    if (!p) return;
    localStorage.setItem('ylmd_age', p.ageGroup === '5-6' ? '1' : '0');
    if (typeof Theme !== 'undefined') Theme.apply(p.theme || 'dino');
    if (typeof Lang  !== 'undefined') {
      Lang.set(p.language || 'he');
      document.documentElement.dir = (p.language || 'he') === 'he' ? 'rtl' : 'ltr';
    }
  }

  // Update profile metadata fields (name, avatar, ageGroup, theme, language)
  function update(id, fields) {
    const list = _all();
    const idx  = list.findIndex(p => p.id === id);
    if (idx === -1) return;
    list[idx] = Object.assign({}, list[idx], fields);
    _saveAll(list);
  }

  // Persist in-app changes (theme toggle, language toggle) to the active profile
  function syncCurrent(fields) {
    const id = activeId();
    if (id) update(id, fields);
  }

  // Delete a profile and its progress data
  function remove(id) {
    _saveAll(_all().filter(p => p.id !== id));
    localStorage.removeItem('ylmd_profile_' + id);
    if (activeId() === id) localStorage.removeItem(ACTIVE_KEY);
  }

  // Welcome-back tier based on how long since this profile last played
  function welcomeTier(id) {
    try {
      const data = JSON.parse(localStorage.getItem(progressKey(id))) || {};
      if (!data.lastPlayed) return 'new';
      const days = (Date.now() - data.lastPlayed) / 86400000;
      if (days < 1)  return 'sameDay';
      if (days < 3)  return 'recent';
      if (days < 7)  return 'gap';
      return 'long';
    } catch { return 'new'; }
  }

  // One-time migration: wrap existing single-profile data into a named profile
  function migrate() {
    if (_all().length > 0) return; // already migrated
    const hasAge = localStorage.getItem('ylmd_age') !== null;
    const old    = localStorage.getItem('ylmd_progress');
    if (!hasAge && !old) return; // genuine first launch — let onboarding run
    // Existing user upgrading to Phase 10
    const age   = localStorage.getItem('ylmd_age') || '0';
    const theme = (typeof Theme !== 'undefined') ? Theme.getCurrent() : 'dino';
    const lang  = (typeof Lang  !== 'undefined') ? (Lang.isHe() ? 'he' : 'en') : 'he';
    const profile = {
      id:        _uuid(),
      name:      'ילד 1',
      avatar:    '🦁',
      ageGroup:  age === '1' ? '5-6' : '3-4',
      theme,
      language:  lang,
      createdAt: new Date().toISOString(),
    };
    _saveAll([profile]);
    localStorage.setItem(ACTIVE_KEY, profile.id);
    if (old) {
      localStorage.setItem(progressKey(profile.id), old);
      localStorage.removeItem('ylmd_progress');
    }
  }

  return {
    getAll, activeId, current, progressKey,
    create, select, update, syncCurrent, remove,
    welcomeTier, migrate,
    AVATARS, MAX_PROFILES,
  };
})();
