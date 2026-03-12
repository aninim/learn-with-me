// Progress engine — localStorage adapter
// Key schema: { letters:{}, numbers:{}, letters_trace:{}, sessions:0, totalStars:0, lastPlayed:0, streak:0, moduleCompletions:{} }
// Phase 10: key is per-profile (ylmd_profile_{id}) instead of the old global ylmd_progress
const Progress = (() => {
  function _key() {
    return (typeof Profiles !== 'undefined') ? Profiles.progressKey() : 'ylmd_progress';
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(_key())) || _empty();
    } catch {
      return _empty();
    }
  }

  function _empty() {
    return { letters: {}, numbers: {}, letters_trace: {}, sessions: 0, totalStars: 0, lastPlayed: 0, streak: 0, moduleCompletions: {} };
  }

  function save(data) {
    localStorage.setItem(_key(), JSON.stringify(data));
  }

  // Record one attempt for a category (e.g. 'letters') and a key (e.g. 'א')
  function record(category, key, correct) {
    const d = load();
    if (!d[category]) d[category] = {};
    if (!d[category][key]) d[category][key] = { attempts: 0, correct: 0, lastSeen: 0 };
    d[category][key].attempts++;
    if (correct) d[category][key].correct++;
    d[category][key].lastSeen = Date.now();
    if (correct) d.totalStars = (d.totalStars || 0) + 1;
    d.lastPlayed = Date.now();
    save(d);
    return d;
  }

  function getAccuracy(category, key) {
    const item = load()[category]?.[key];
    if (!item || item.attempts === 0) return 0.5;
    return item.correct / item.attempts;
  }

  function getTotalStars() {
    return load().totalStars || 0;
  }

  function getSessions() {
    return load().sessions || 0;
  }

  function getStreak() {
    return load().streak || 0;
  }

  // Returns how many times a module journey was completed (0–N)
  function getModuleCompletions(module) {
    return (load().moduleCompletions || {})[module] || 0;
  }

  function recordModuleCompletion(module) {
    const d = load();
    if (!d.moduleCompletions) d.moduleCompletions = {};
    d.moduleCompletions[module] = (d.moduleCompletions[module] || 0) + 1;
    save(d);
  }

  function startSession() {
    const d = load();
    const now = Date.now();
    // Streak: count consecutive days with at least one session
    if (d.lastPlayed) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysSince = Math.floor((now - d.lastPlayed) / msPerDay);
      if (daysSince === 1) {
        d.streak = (d.streak || 0) + 1; // consecutive day
      } else if (daysSince > 1) {
        d.streak = 1; // streak broken — restart at 1
      }
      // daysSince === 0 → same day, keep streak as-is
    } else {
      d.streak = 1; // first ever session
    }
    d.sessions = (d.sessions || 0) + 1;
    d.lastPlayed = now;
    save(d);
  }

  return { load, record, getAccuracy, getTotalStars, getSessions, getStreak, getModuleCompletions, recordModuleCompletion, startSession };
})();
