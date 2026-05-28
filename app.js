const SYMBOL_GROUPS = [
  { name: 'Punctuation & Brackets', scale: 1.2, symbols: ['$','#','@','%','&','*','+','~','ʌ','!','?','<','>','§','Ω','»','Ʒ','«','¿','£','=','¢'] },
  { name: 'Math & Logic', scale: 1.2, symbols: ['\u222f','\u222e','\u2200','\u2203','\u00b1','\u22c2','\u22c3','\u2264','\u2265','\u221e','\u221a','\u2211','\u220f','\u222b','\u2202','\u2206','\u2207','\u2208','\u2209','\u2205','\u2282','\u2283','\u2227','\u2228'] },
  { name: 'Currency & Commerce', scale: 1.25, symbols: ['$','\u00a2','\u00a3','\u00a5','\u20ac','\u20b9','\u20bd','\u20bf','\u00a4','%','\u2030','#','&','@','\u00a7','\u00b6','\u00a9','\u00ae','\u211e','\u2021'] },
  { name: 'Arrows', scale: 1.5, symbols: ['\u2190','\u2192','\u2191','\u2193','\u2194','\u2195','\u2196','\u2197','\u2198','\u2199','\u21d0','\u21d2','\u21d1','\u21d3','\u21d4','\u21d5','\u21a9','\u21aa','\u21bb','\u21ba','\u21e0','\u21e2'] },
  { name: 'Shapes & Cards', scale: 1.2, symbols: ['\u2660','\u2663','\u2665','\u2666','\u2664','\u2667','\u2661','\u2662','\u2605','\u2606','\u25cf','\u25cb','\u25c6','\u25c7','\u25a0','\u25a1','\u25b2','\u25b3','\u25bc','\u25bd','\u25c9','\u25ce'] },
  { name: 'Musical & Misc', scale: 1.35, symbols: ['\u2669','\u266a','\u266b','\u266c','\u266d','\u266e','\u266f','\u2713','\u2717','\u2726','\u2727','\u2736','\u2739','\u273b','\u273d','\u2756','\u26a1','\u2600','\u2601','\u2602','\u2603','\u2744'] },
  { name: 'Greek Letters', scale: 1.2, symbols: ['\u03b1','\u03b2','\u03b3','\u03b4','\u03b5','\u03b6','\u03b7','\u03b8','\u03bb','\u03bc','\u03bd','\u03be','\u03c0','\u03c1','\u03c3','\u03c4','\u03c6','\u03c7','\u03c8','\u03c9','\u0393','\u0394','\u0398','\u039b','\u03a3','\u03a6','\u03a8','\u03a9'] },
  { name: 'Chess & Dice', scale: 1.35, symbols: ['\u2654','\u2655','\u2656','\u2657','\u2658','\u2659','\u2680','\u2681','\u2682','\u2683','\u2684','\u2685','\u2690','\u2691','\u2694','\u2696','\u26c0','\u26c2','\u2617'] },
  { name: 'Dingbats', scale: 1.2, symbols: ['\u2708','\u2709','\u270e','\u270f','\u2710','\u2711','\u2712','\u2714','\u2715','\u2716','\u273e','\u2740','\u2742','\u2748','\u274b','\u2722','\u2723','\u2724','\u2725','\u2727','\u2729','\u272a'] },
  { name: 'Planets & Alchemy', scale: 1.3, symbols: ['\u2609','\u263d','\u263f','\u2640','\u2641','\u2642','\u2643','\u2644','\u2645','\u2646','\u2647','\u26b6','\u26b7','\u26b8','\u26b9','\u26ba','\u26bb','\u26bc','\u260a','\u260b','\u260c','\u260d'] },
  { name: 'Misc Symbols', scale: 1.2, symbols: ['\u2696','\u2623','\u2693','\u2692','\u2699','\u269b','\u269c','\u262e','\u262f','\u2638','\u2695','\u269a','\u2624','\u2698','\u2697','\u262c','\u262b','\u2627','\u269e','\u269f','\u269d'] },
  { name: 'Runes', scale: 1.2, symbols: ['\u16a0','\u16a1','\u16a2','\u16a3','\u16a4','\u16a5','\u16a6','\u16a7','\u16a8','\u16a9','\u16aa','\u16ab','\u16ac','\u16ad','\u16ae','\u16af','\u16b0','\u16b1','\u16b2','\u16b3','\u16b4','\u16b5'] },
];
let currentSymbols = null;
const STARTER_PHRASE_IDS = [97,174,191,199,219,257,270,315,349,361];
const IS_MOBILE_CUSTOM_KB = window.matchMedia('(pointer: coarse)').matches;

// --- Game variant config ---
// The default page (index.html) uses the values below. Other pages
// (e.g. /potter-puzzles/) override these by setting window.GAME_CONFIG
// before this script loads. To remove a variant entirely, delete its
// HTML/JSON files and any menu entry that links to it.
const POTTER_PUZZLES_ENABLED = true;
function hasPlayedPotter() {
  const raw = localStorage.getItem('phraisins_potter_marathon_stats');
  if (!raw) return false;
  try { const p = JSON.parse(raw); return !!(p && p.games && p.games.length); }
  catch { return false; }
}
const GAME_CONFIG = Object.assign({
  phrasesFile: 'phrases.json',
  storagePrefix: 'phraisins_',
  marathonSize: null,        // null = daily mode (DAILY_GAME_LIMIT/day); number = marathon mode (no daily limit, roundup after N games)
  roundupTitle: 'Marathon complete!',
  riddlesEnabled: true
}, (typeof window !== 'undefined' && window.GAME_CONFIG) || {});
const PHRASES_FILE = GAME_CONFIG.phrasesFile;
const STORAGE_PREFIX = GAME_CONFIG.storagePrefix;
const MARATHON_SIZE = GAME_CONFIG.marathonSize;
const IS_MARATHON_MODE = MARATHON_SIZE !== null;
function lsKey(name) { return STORAGE_PREFIX + name; }

let PHRASES = [];
let RIDDLES = [];

// --- State ---
let game = null;
let lastLevelUp = null;
let scrambleTimer = null;
const MAX_TRIES = 4;
const MAX_HINTS = 3;
const RAISIN_REWARDS = { 1: 4, 2: 4, 3: 5, 4: 5, 5: 6 };
const DEFAULT_REWARD = 4;
const LEGACY_MAX_RAISINS = 5; // fallback for stored stats/history written before variable rewards
function maxRaisinsForRank(rank) {
  return RAISIN_REWARDS[rank] || DEFAULT_REWARD;
}
const DAILY_GAME_LIMIT = 3;

const WIN_PHRASES = GAME_CONFIG.winPhrases || {
  6: ["Wine-some!"],
  5: ["Suntastic!"],
  4: ["Juicy!"],
  3: ["Sweet!"],
  2: ["Just ripe!"],
  1: ["Grape save!"]
};

function pickWinPhrase(won) {
  const list = WIN_PHRASES[won] || WIN_PHRASES[1];
  return list[Math.floor(Math.random() * list.length)];
}

const REWARD_LEVELS = GAME_CONFIG.rewardLevels || [
  { threshold: 15,  phrase: "Raise a toast!",                            label: "Raisin Toaster" },
  { threshold: 30,  phrase: "I dub thee, Sir/Madam Raisin",              label: "Sir/Madam Raisin" },
  { threshold: 50,  phrase: "You are my raison d'\u00eatre",             label: "Raison d'\u00eatre" },
  { threshold: 75,  phrase: "You've really raisined the stakes!",        label: "Stake Raiser" },
  { threshold: 100, phrase: "Raisin for Celebration!!",                  label: "Celebrator" },
  { threshold: 150, phrase: "You're an Amazin Raisin!",                  label: "Amazin Raisin" },
  { threshold: 200, phrase: "You have totally raised the bar!",          label: "Bar Raiser" },
  { threshold: 300, phrase: "You really raise and shine!",               label: "Raisin Shine" },
  { threshold: 400, phrase: "You're really, really raisy today!",        label: "Really Raisy" },
  { threshold: 500, phrase: "Hip hip hurraisin!",                        label: "Hurraisin" },
  { threshold: 750, phrase: "You've reached the edge of raisin!",        label: "Edge of Raisin" },
  { threshold: 1000, phrase: "I pronounce you, Dr. Bran Raisin!",        label: "Dr. Bran Raisin" },
];

function getCurrentLevel(total) {
  let current = null;
  for (const level of REWARD_LEVELS) {
    if (total >= level.threshold) current = level;
  }
  return current;
}
function getNextLevel(total) {
  for (const level of REWARD_LEVELS) {
    if (total < level.threshold) return level;
  }
  return null;
}
function checkLevelUp(before, after) {
  let newLevel = null;
  for (const level of REWARD_LEVELS) {
    if (before < level.threshold && after >= level.threshold) newLevel = level;
  }
  return newLevel;
}

// --- localStorage helpers ---
function getUsed() {
  try { return JSON.parse(localStorage.getItem(lsKey('used'))) || []; }
  catch { return []; }
}
function saveUsed(used) { localStorage.setItem(lsKey('used'), JSON.stringify(used)); }
function getTotalRaisins() { return parseInt(localStorage.getItem(lsKey('total_raisins'))) || 0; }
function saveTotalRaisins(total) { localStorage.setItem(lsKey('total_raisins'), JSON.stringify(total)); }
function getStreak() { return parseInt(localStorage.getItem(lsKey('streak'))) || 0; }
function saveStreak(n) { localStorage.setItem(lsKey('streak'), n); }
function getPerfectStreak() { return parseInt(localStorage.getItem(lsKey('perfect_streak'))) || 0; }
function savePerfectStreak(n) { localStorage.setItem(lsKey('perfect_streak'), n); }
function getLossStreak() { return parseInt(localStorage.getItem(lsKey('loss_streak'))) || 0; }
function saveLossStreak(n) { localStorage.setItem(lsKey('loss_streak'), n); }
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function getDailyStats() {
  if (IS_MARATHON_MODE) {
    try {
      const raw = JSON.parse(localStorage.getItem(lsKey('marathon_stats')));
      if (raw && Array.isArray(raw.games)) return raw;
    } catch {}
    return { games: [] };
  }
  const today = getTodayKey();
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey('daily_stats')));
    if (raw && raw.date === today && Array.isArray(raw.games)) return raw;
  } catch {}
  return { date: today, games: [] };
}
function saveDailyStats(stats) {
  const key = IS_MARATHON_MODE ? lsKey('marathon_stats') : lsKey('daily_stats');
  localStorage.setItem(key, JSON.stringify(stats));
}
function recordDailyGame(result) {
  const stats = getDailyStats();
  stats.games.push(result);
  saveDailyStats(stats);
}
function isDailyLimitReached() {
  const limit = IS_MARATHON_MODE ? MARATHON_SIZE : DAILY_GAME_LIMIT;
  return getDailyStats().games.length >= limit;
}
const HISTORY_LIMIT = 200;
function getHistory() {
  try { return JSON.parse(localStorage.getItem(lsKey('history'))) || []; }
  catch { return []; }
}
function recordHistory(entry) {
  const history = getHistory();
  history.push({ ts: Date.now(), ...entry });
  if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);
  try { localStorage.setItem(lsKey('history'), JSON.stringify(history)); } catch {}
}
function saveInProgressGame() {
  if (!game || game.isOver || !game.phraseId) return;
  const data = {
    date: getTodayKey(),
    phraseId: game.phraseId,
    symbols: currentSymbols,
    scale: game.symScale,
    revealedSymbols: game.revealedHints.map(h => h.symbol),
    cellLetters: game.cells.map(c => c.isLocked ? '' : (c.userLetter || '')),
    raisins: game.raisins,
    maxRaisins: game.maxRaisins,
    triesLeft: game.triesLeft,
    guessCount: game.guessCount,
    hintsUsed: game.hintsUsed
  };
  try { localStorage.setItem(lsKey('in_progress'), JSON.stringify(data)); } catch {}
}
function clearInProgressGame() {
  try { localStorage.removeItem(lsKey('in_progress')); } catch {}
}
function loadInProgressGame() {
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey('in_progress')));
    if (!raw || !raw.date || !Array.isArray(raw.symbols)) {
      if (raw) clearInProgressGame();
      return null;
    }
    const stored = new Date(raw.date + 'T00:00:00');
    const today = new Date(getTodayKey() + 'T00:00:00');
    const dayDiff = Math.round((today - stored) / 86400000);
    if (!Number.isFinite(dayDiff) || dayDiff < 0 || dayDiff > 7) {
      clearInProgressGame();
      return null;
    }
    return raw;
  } catch { return null; }
}
function getLastPlayedPhrase() {
  const used = getUsed();
  if (!used.length || !PHRASES.length) return null;
  const lastId = used[used.length - 1];
  return PHRASES.find(p => p.id === lastId) || null;
}
function computeLenScale(phrase) {
  const wordCount = phrase.trim().split(/\s+/).length;
  if (wordCount > 4) return 1;
  const charCount = phrase.replace(/\s+/g, '').length;
  if (charCount <= 8) return 1.3;
  if (charCount <= 12) return 1.2;
  if (charCount <= 16) return 1.1;
  return 1;
}
function paintSolvedCipher(phraseObj) {
  const phrase = phraseObj.phrase;
  cipherEl.style.setProperty('--sym-scale', 1);
  cipherEl.style.setProperty('--len-scale', computeLenScale(phrase));
  setCipherText(cipherEl, phrase.toLowerCase().replace(/ /g, '  '));
  cipherEl.querySelectorAll('.cipher-char').forEach(span => {
    if (span.textContent && span.textContent !== ' ') span.classList.add('revealed');
  });
  cipherEl.classList.add('game-over');
  clueEl.textContent = phraseObj.clue || '';
}
function buildDailySummaryHTML() {
  if (IS_MARATHON_MODE) return buildMarathonRoundupHTML();
  const stats = getDailyStats();
  const games = stats.games;
  const totalToday = games.reduce((sum, g) => sum + (g.won || 0), 0);
  let html = '<div class="daily-summary"><div class="daily-summary-title">Today’s recap</div>';
  games.forEach((g, i) => {
    const won = g.won || 0;
    const max = g.max || LEGACY_MAX_RAISINS;
    const filled = '\u{1F347}'.repeat(won);
    const empty = '⚫'.repeat(Math.max(0, max - won));
    html += '<div class="daily-summary-row"><span class="daily-summary-label">Game ' + (i + 1) + '</span><span class="daily-summary-pips">' + filled + empty + '</span><span class="daily-summary-score">' + won + '/' + max + '</span></div>';
  });
  html += '<div class="daily-summary-total">' + totalToday + ' raisin' + (totalToday !== 1 ? 's' : '') + ' earned today</div>';
  html += '<div class="daily-summary-message">Come back tomorrow to play again!</div>';
  html += '</div>';
  return html;
}

function getRoundupTitle() {
  const games = getDailyStats().games;
  const correct = games.filter(g => (g.won || 0) > 0).length;
  const tiers = GAME_CONFIG.roundupTitles;
  if (Array.isArray(tiers) && tiers.length) {
    const sorted = tiers.slice().sort((a, b) => (b.minScore || 0) - (a.minScore || 0));
    const pick = sorted.find(t => correct >= (t.minScore || 0));
    if (pick && pick.title) return pick.title;
  }
  return GAME_CONFIG.roundupTitle || 'Marathon complete!';
}

function buildMarathonRoundupHTML() {
  const games = getDailyStats().games;
  const correct = games.filter(g => (g.won || 0) > 0).length;
  const total = MARATHON_SIZE;
  const raisinsThisRun = games.reduce((sum, g) => sum + (g.won || 0), 0);
  const pips = games.map(g => (g.won || 0) > 0 ? '\u{1F347}' : '⚫').join('');
  let html = '<div class="daily-summary marathon-roundup">';
  if (GAME_CONFIG.roundupIconHTML) html += GAME_CONFIG.roundupIconHTML;
  html += '<div class="marathon-roundup-title">' + getRoundupTitle() + '</div>';
  html += '<div class="marathon-score">' + correct + ' / ' + total + ' correct</div>';
  html += '<div class="marathon-pips">' + pips + '</div>';
  html += '<div class="daily-summary-total">' + raisinsThisRun + ' raisin' + (raisinsThisRun !== 1 ? 's' : '') + ' earned this run</div>';
  html += '</div>';
  return html;
}

// --- Encoding ---
function encode(phrase) {
  const letters = [...new Set(phrase.toLowerCase().replace(/[^a-z]/g, '').split(''))].sort();
  const mapping = {};
  letters.forEach((letter, i) => { mapping[letter] = currentSymbols[i]; });
  const encoded = phrase.toLowerCase().split('').map(ch => {
    if (ch === ' ') return '  ';
    return mapping[ch] || ch;
  }).join('');
  return { encoded, mapping };
}

// --- Phrase selection ---
function selectPhrase() {
  let used = getUsed();
  const isStarterGame = used.length === 0 && getTotalRaisins() <= 5;
  if (used.length >= PHRASES.length) { used = []; saveUsed(used); }
  const unused = PHRASES.filter(p => !used.includes(p.id));
  let available = unused.filter(p => p.rank !== 5);
  if (isStarterGame) {
    const starters = available.filter(p => STARTER_PHRASE_IDS.includes(p.id));
    if (starters.length > 0) {
      available = starters;
    } else {
      const rank1 = available.filter(p => p.rank === 1);
      if (rank1.length > 0) available = rank1;
    }
  } else if (getStreak() >= 4) {
    const expert = unused.filter(p => p.rank === 5);
    if (expert.length > 0) available = expert;
  } else if (getStreak() >= 2) {
    const hard = available.filter(p => p.rank >= 3);
    if (hard.length > 0) available = hard;
  } else if (getLossStreak() >= 2) {
    const easy = available.filter(p => p.rank <= 2);
    if (easy.length > 0) available = easy;
  }
  if (available.length === 0) available = unused;
  const pick = available[Math.floor(Math.random() * available.length)];
  used.push(pick.id);
  saveUsed(used);
  return pick;
}

// --- DOM refs ---
const cipherEl = document.getElementById('cipher-display');
const clueEl = document.getElementById('clue-display');
const hintsEl = document.getElementById('hints-area');
const feedbackEl = document.getElementById('feedback');
const answerAreaEl = document.getElementById('answer-area');
const submitBtn = document.getElementById('submit-btn');
const hintBtn = document.getElementById('hint-btn');
const giveupBtn = document.getElementById('giveup-btn');
const newgameBtn = document.getElementById('newgame-btn');
const marathonEndBtn = document.getElementById('marathon-end-btn');
const buttonsEl = document.getElementById('buttons');
const resultEl = document.getElementById('result');
const resultFeedbackEl = document.getElementById('result-feedback');
const resultRaisinsEl = document.getElementById('result-raisins');
const shareBtn = document.getElementById('share-btn');
const riddleBtn = document.getElementById('riddle-btn');
const resultCloseBtn = document.getElementById('result-close');
const reopenResultBtn = document.getElementById('reopen-result-btn');
const newgameOuterBtn = document.getElementById('newgame-outer-btn');
const shareToast = document.getElementById('share-toast');
const subtitleEl = document.getElementById('subtitle');
const totalRaisinsEl = document.getElementById('total-raisins');
const stakeRaisinsEl = document.getElementById('stake-raisins');
const currentLevelEl = document.getElementById('current-level');

const STAKE_RAISIN_SVG = '<svg class="stake-raisin" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M26 8c-6-1-12 2-16 8-3 5-4 11-2 16 2 6 7 10 14 11 3 0 6 0 9-2 5-3 9-8 10-14 1-5-1-10-4-14-3-3-7-5-11-5z" fill="#542a78"/>' +
  '<path d="M14 16c3 4 5 8 4 13" stroke="#381855" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.7"/>' +
  '<path d="M19 12c1 6-1 13-2 18" stroke="#381855" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.6"/>' +
  '<path d="M26 10c0 7-2 14-4 20" stroke="#381855" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.65"/>' +
  '<path d="M32 13c-1 5-3 10-5 15" stroke="#381855" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55"/>' +
  '<path d="M20 13c2 5 1 11-1 17" stroke="#703ca0" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.5"/>' +
  '<path d="M26 8c0-3 1-5 3-7" stroke="#6b8a3a" stroke-width="2" stroke-linecap="round"/>' +
  '</svg>';

if (getTotalRaisins() > 0) {
  subtitleEl.classList.add('hidden-mobile');
}

// --- Cipher display ---
function setCipherText(el, text) {
  el.innerHTML = text.split(/  +/).map(w =>
    '<span class="cipher-word">' +
    [...w].map(ch => {
      const escaped = ch.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<span class="cipher-char" data-symbol="' + escaped + '">' + escaped + '︎</span>';
    }).join('') +
    '</span>'
  ).join(' ');
}

function updateCipherDisplay() {
  const charSpans = cipherEl.querySelectorAll('.cipher-char');
  charSpans.forEach(span => {
    const sym = span.getAttribute('data-symbol');
    const hint = game.revealedHints.find(h => h.symbol === sym);
    if (hint) {
      span.textContent = hint.letter;
      span.classList.add('revealed');
    }
  });
}

function animateCipherScramble(encoded, targetEl) {
  if (scrambleTimer) clearInterval(scrambleTimer);
  const chars = [...encoded];
  const totalIterations = 15;
  const symbolSet = new Set(currentSymbols);
  const isSymbolPos = chars.map(ch => symbolSet.has(ch));
  const settleIteration = chars.map((ch, i) => {
    if (!isSymbolPos[i]) return 0;
    const base = Math.floor(6 + (i / chars.length) * (totalIterations - 8));
    return Math.min(base + Math.floor(Math.random() * 3), totalIterations);
  });
  setCipherText(targetEl, encoded);
  const finalHeight = targetEl.offsetHeight;
  let iteration = 0;
  setCipherText(targetEl, chars.map((ch, i) =>
    isSymbolPos[i] ? currentSymbols[Math.floor(Math.random() * currentSymbols.length)] : ch
  ).join(''));
  const scrambleHeight = targetEl.offsetHeight;
  targetEl.style.height = Math.max(finalHeight, scrambleHeight) + 'px';
  targetEl.style.overflow = 'hidden';
  scrambleTimer = setInterval(() => {
    iteration++;
    let result = '';
    for (let i = 0; i < chars.length; i++) {
      if (iteration >= settleIteration[i]) {
        result += chars[i];
      } else {
        result += currentSymbols[Math.floor(Math.random() * currentSymbols.length)];
      }
    }
    setCipherText(targetEl, result);
    if (iteration >= totalIterations) {
      clearInterval(scrambleTimer);
      scrambleTimer = null;
      setCipherText(targetEl, encoded);
      targetEl.style.height = '';
      targetEl.style.overflow = '';
    }
  }, 110);
}

function spawnConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#e8b87a', '#f5d4a0', '#e2c4ff', '#f0deff', '#7cc88a', '#a8b4f0'];
  const shapes = ['50%', '2px'];
  const raisinSvg = '<svg viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<path d="M26 8c-6-1-12 2-16 8-3 5-4 11-2 16 2 6 7 10 14 11 3 0 6 0 9-2 5-3 9-8 10-14 1-5-1-10-4-14-3-3-7-5-11-5z" fill="#542a78"/>'
    + '<path d="M14 16c3 4 5 8 4 13" stroke="#381855" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.7"/>'
    + '<path d="M19 12c1 6-1 13-2 18" stroke="#381855" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.6"/>'
    + '<path d="M26 10c0 7-2 14-4 20" stroke="#381855" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.65"/>'
    + '<path d="M32 13c-1 5-3 10-5 15" stroke="#381855" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55"/>'
    + '<path d="M26 8c0-3 1-5 3-7" stroke="#6b8a3a" stroke-width="2" stroke-linecap="round"/>'
    + '</svg>';
  for (let i = 0; i < 40; i++) {
    const isRaisin = i < 8;
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.left = (15 + Math.random() * 70) + '%';
    p.style.top = (-5 - Math.random() * 10) + '%';
    p.style.setProperty('--fall-duration', (2 + Math.random() * 1.5) + 's');
    p.style.setProperty('--delay', (Math.random() * 0.4) + 's');
    p.style.setProperty('--rotation', (360 + Math.random() * 720) + 'deg');
    if (isRaisin) {
      const size = 24 + Math.random() * 16;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = 'none';
      p.style.borderRadius = '0';
      p.innerHTML = raisinSvg;
    } else {
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 5 + Math.random() * 7;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
    }
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 4500);
}

function spawnMiniConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const anchor = document.getElementById('result-card');
  let originLeftPct = 50;
  let originTopPct = 30;
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    originLeftPct = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    originTopPct = Math.max(0, (rect.top / window.innerHeight) * 100 - 4);
  }
  const colors = ['#e8b87a', '#f5d4a0', '#e2c4ff', '#f0deff', '#7cc88a', '#a8b4f0'];
  const shapes = ['50%', '2px'];
  const raisinSvg = '<svg viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<path d="M26 8c-6-1-12 2-16 8-3 5-4 11-2 16 2 6 7 10 14 11 3 0 6 0 9-2 5-3 9-8 10-14 1-5-1-10-4-14-3-3-7-5-11-5z" fill="#542a78"/>'
    + '<path d="M14 16c3 4 5 8 4 13" stroke="#381855" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.7"/>'
    + '<path d="M19 12c1 6-1 13-2 18" stroke="#381855" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.6"/>'
    + '<path d="M26 10c0 7-2 14-4 20" stroke="#381855" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.65"/>'
    + '<path d="M32 13c-1 5-3 10-5 15" stroke="#381855" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55"/>'
    + '<path d="M26 8c0-3 1-5 3-7" stroke="#6b8a3a" stroke-width="2" stroke-linecap="round"/>'
    + '</svg>';
  for (let i = 0; i < 10; i++) {
    const isRaisin = i < 3;
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.left = (originLeftPct - 12 + Math.random() * 24) + '%';
    p.style.top = (originTopPct - 6 + Math.random() * 4) + '%';
    p.style.setProperty('--fall-duration', (1.2 + Math.random() * 0.6) + 's');
    p.style.setProperty('--delay', (Math.random() * 0.15) + 's');
    p.style.setProperty('--rotation', (180 + Math.random() * 360) + 'deg');
    if (isRaisin) {
      const size = 14 + Math.random() * 6;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = 'none';
      p.style.borderRadius = '0';
      p.innerHTML = raisinSvg;
    } else {
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 4 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
    }
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 2500);
}

// --- Raisin display ---
function ensureStakeRaisinChips() {
  const target = (game && game.maxRaisins) || DEFAULT_REWARD;
  if (stakeRaisinsEl.children.length === target) return;
  stakeRaisinsEl.innerHTML = '';
  for (let i = 0; i < target; i++) {
    const tmp = document.createElement('span');
    tmp.innerHTML = STAKE_RAISIN_SVG;
    stakeRaisinsEl.appendChild(tmp.firstElementChild);
  }
}

function updateRaisinDisplay() {
  const total = getTotalRaisins();
  totalRaisinsEl.innerHTML = '<span class="total-prefix">Total </span>Raisins: ' + total;
  ensureStakeRaisinChips();
  if (game) {
    Array.from(stakeRaisinsEl.children).forEach((el, i) => {
      el.classList.toggle('spent', i >= game.raisins);
    });
  } else {
    Array.from(stakeRaisinsEl.children).forEach(el => el.classList.remove('spent'));
  }
  hintBtn.disabled = game && (game.raisins <= 1 || game.triesLeft <= 1 || game.hintsUsed >= MAX_HINTS);
  const level = getCurrentLevel(total);
  const next = getNextLevel(total);
  if (level) {
    currentLevelEl.textContent = level.label;
    currentLevelEl.classList.remove('next-preview');
  } else if (next) {
    currentLevelEl.textContent = 'Goal: ' + next.threshold;
    currentLevelEl.classList.add('next-preview');
  } else {
    currentLevelEl.textContent = '';
    currentLevelEl.classList.remove('next-preview');
  }
}

function spendRaisin() {
  game.raisins--;
  updateRaisinDisplay();
  if (game.raisins <= 0) {
    showLoss();
    return true;
  }
  saveInProgressGame();
  return false;
}

// --- Answer area: build dash inputs ---
function buildAnswerArea() {
  answerAreaEl.innerHTML = '';
  const label = document.createElement('div');
  label.id = 'answer-label';
  label.textContent = 'Your answer:';
  answerAreaEl.appendChild(label);

  const words = game.phrase.split(' ');
  game.cells = [];
  game.symbolToPositions = {};
  game.symbolToUserLetter = {};

  let globalIndex = 0;

  words.forEach((word) => {
    const wordGroup = document.createElement('div');
    wordGroup.className = 'answer-word';

    [...word].forEach(ch => {
      const lowerCh = ch.toLowerCase();
      const symbol = game.mapping[lowerCh];

      game.cells.push({
        index: globalIndex,
        char: lowerCh,
        symbol: symbol,
        isLocked: false,
        userLetter: ''
      });

      if (!game.symbolToPositions[symbol]) {
        game.symbolToPositions[symbol] = [];
      }
      game.symbolToPositions[symbol].push(globalIndex);

      const cellDiv = document.createElement('div');
      cellDiv.className = 'answer-cell';
      cellDiv.dataset.index = globalIndex;
      cellDiv.dataset.symbol = symbol;

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.autocomplete = 'off';
      input.dataset.index = globalIndex;
      input.setAttribute('autocapitalize', 'off');
      if (IS_MOBILE_CUSTOM_KB) input.setAttribute('inputmode', 'none');

      cellDiv.appendChild(input);
      wordGroup.appendChild(cellDiv);
      globalIndex++;
    });

    answerAreaEl.appendChild(wordGroup);
  });

  applyWordWrapHyphens();
}

// Mark the last cell of a wrapped line with a class that renders a trailing
// hyphen, so a word split across two rows reads as one continuous word.
function applyWordWrapHyphens() {
  answerAreaEl.querySelectorAll('.answer-word').forEach(word => {
    const cells = word.querySelectorAll('.answer-cell');
    cells.forEach(c => c.classList.remove('wrap-hyphen'));
    for (let i = 0; i < cells.length - 1; i++) {
      if (Math.abs(cells[i].offsetTop - cells[i + 1].offsetTop) > 1) {
        cells[i].classList.add('wrap-hyphen');
      }
    }
  });
}

// --- Auto-propagation ---
// Hint-revealed letters are locked in forever; re-assigning one to another
// symbol would put the player in an unwinnable state, so we gray them out
// on the keyboard and reject them here.
function getDisabledLetters() {
  const disabled = new Set();
  if (!game) return disabled;
  (game.revealedHints || []).forEach(h => disabled.add(h.letter));
  return disabled;
}

function updateKeyboardDisabledState() {
  const kb = document.getElementById('mobile-keyboard');
  if (!kb) return;
  const disabled = getDisabledLetters();
  kb.querySelectorAll('.kb-key').forEach(keyEl => {
    const k = keyEl.dataset.key;
    if (!k || k === 'ENTER' || k === 'BACKSPACE') return;
    keyEl.classList.toggle('kb-disabled', disabled.has(k.toLowerCase()));
  });
}

function handleCellInput(index, letter) {
  const cell = game.cells[index];
  if (!cell || cell.isLocked || game.isOver) return false;

  const symbol = cell.symbol;
  const normalized = (letter || '').toLowerCase().replace(/[^a-z]/g, '');

  if (normalized && game.symbolToUserLetter[symbol] !== normalized) {
    if (getDisabledLetters().has(normalized)) return false;
  }

  game.symbolToUserLetter[symbol] = normalized;

  const positions = game.symbolToPositions[symbol] || [];
  positions.forEach(pos => {
    const c = game.cells[pos];
    if (c.isLocked) return;
    c.userLetter = normalized;
    const inputEl = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"] input');
    if (inputEl) inputEl.value = normalized;
  });
  updateVirtualCaret();
  saveInProgressGame();
  return true;
}

// --- Navigation helpers ---
function findNextEmptyCell(fromIndex) {
  for (let i = fromIndex + 1; i < game.cells.length; i++) {
    if (!game.cells[i].isLocked && !game.cells[i].userLetter) return i;
  }
  for (let i = 0; i < fromIndex; i++) {
    if (!game.cells[i].isLocked && !game.cells[i].userLetter) return i;
  }
  return -1;
}
function findNextCell(fromIndex) {
  for (let i = fromIndex + 1; i < game.cells.length; i++) {
    if (!game.cells[i].isLocked) return i;
  }
  return -1;
}
function findPrevCell(fromIndex) {
  for (let i = fromIndex - 1; i >= 0; i--) {
    if (!game.cells[i].isLocked) return i;
  }
  return -1;
}
function focusCell(index) {
  const input = answerAreaEl.querySelector('.answer-cell[data-index="' + index + '"] input');
  if (input) { input.removeAttribute('readonly'); input.focus(); input.select(); }
}
// Tags the first empty editable cell so CSS can paint a blinking caret there
// on touch devices. No-op if we don't need it (e.g. desktop) — the CSS is
// scoped to `pointer: coarse`, but leaving the class off avoids stray DOM.
function updateVirtualCaret() {
  if (!IS_MOBILE_CUSTOM_KB) return;
  const prev = answerAreaEl.querySelector('.answer-cell.has-virtual-caret');
  if (prev) prev.classList.remove('has-virtual-caret');
  if (!game || game.isOver) return;
  const idx = getFirstEditableEmptyIndex();
  if (idx === -1) return;
  const cell = answerAreaEl.querySelector('.answer-cell[data-index="' + idx + '"]');
  if (cell) cell.classList.add('has-virtual-caret');
}
// readonly suppresses the mobile keyboard; we drop it on first tap so typing still works.
function focusCellQuietly(index) {
  const input = answerAreaEl.querySelector('.answer-cell[data-index="' + index + '"] input');
  if (!input) return;
  input.setAttribute('readonly', 'readonly');
  input.focus();
  const unlock = () => {
    input.removeAttribute('readonly');
    input.removeEventListener('touchstart', unlock);
    input.removeEventListener('mousedown', unlock);
    // The tap that unlocks readonly is what triggers the keyboard, and no
    // fresh focus event will fire — so lift here too.
    liftAppAboveKeyboard();
  };
  input.addEventListener('touchstart', unlock);
  input.addEventListener('mousedown', unlock);
}

// Facebook/Messenger/Instagram in-app browsers don't shrink the viewport
// when the keyboard opens, and #app is sized to 100dvh on mobile so the
// document has no scroll room either. Under those UAs we temporarily add
// bottom padding (body.kb-pad) to create scroll room, then scroll so the
// #buttons row sits just above the keyboard. Answer cells land above the
// buttons naturally and the user can scroll up to see the cipher.
function isInAppKbQuirkBrowser() {
  return /FBAN|FBAV|FB_IAB|FB4A|Instagram/i.test(navigator.userAgent || '');
}

let kbLiftTimers = [];
let kbPadReleaseTimer = null;

function liftAppAboveKeyboard() {
  if (!isInAppKbQuirkBrowser()) return;
  // Re-focusing an input within a pending release window: cancel the release
  // so the pad keeps hanging on.
  if (kbPadReleaseTimer) { clearTimeout(kbPadReleaseTimer); kbPadReleaseTimer = null; }
  document.body.classList.add('kb-pad');
  const scroll = () => {
    const buttonsEl = document.getElementById('buttons');
    if (!buttonsEl) return;
    const rect = buttonsEl.getBoundingClientRect();
    // FB IAB keeps innerHeight constant across keyboard state. Estimate the
    // keyboard + suggestion row at ~50% of the viewport.
    const safeBottom = window.innerHeight * 0.5;
    const margin = 16;
    const delta = rect.bottom - (safeBottom - margin);
    if (delta > 0) window.scrollBy(0, delta);
  };
  kbLiftTimers.forEach(clearTimeout);
  // IMPORTANT: delay the scroll — scrolling synchronously in focusin shifts
  // the layout before click dispatches, so a tap on an answer cell can land
  // on #buttons and fire GIVE UP by accident. Body padding added above is
  // safe because it sits BELOW the content and doesn't shift anything.
  kbLiftTimers = [
    setTimeout(scroll, 150),
    setTimeout(scroll, 450),
    setTimeout(scroll, 900),
  ];
}

function releaseAppLift() {
  kbLiftTimers.forEach(clearTimeout);
  kbLiftTimers = [];
  if (kbPadReleaseTimer) clearTimeout(kbPadReleaseTimer);
  // Defer removal. Removing kb-pad synchronously during focusout shrinks
  // the document, clamps scrollTop to 0, and shifts HINT/NEXT PUZZLE/GUESS out
  // of the touched coord before the click dispatches — so the first tap
  // misses and the user has to tap again.
  kbPadReleaseTimer = setTimeout(() => {
    kbPadReleaseTimer = null;
    document.body.classList.remove('kb-pad');
  }, 350);
}

function highlightSameSymbol(symbol) {
  clearHighlights();
  (game.symbolToPositions[symbol] || []).forEach(pos => {
    const el = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"]');
    if (el) el.classList.add('same-sym');
  });
}
function clearHighlights() {
  answerAreaEl.querySelectorAll('.same-sym').forEach(el => el.classList.remove('same-sym'));
}

function setupAnswerNavigation() {
  answerAreaEl.addEventListener('keydown', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    const index = parseInt(e.target.dataset.index);

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!game.cells[index].userLetter) {
        const prev = findPrevCell(index);
        if (prev !== -1) {
          handleCellInput(prev, '');
          focusCell(prev);
        }
      } else {
        handleCellInput(index, '');
      }
      return;
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      handleCellInput(index, '');
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = findPrevCell(index);
      if (prev !== -1) focusCell(prev);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = findNextCell(index);
      if (next !== -1) focusCell(next);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.shiftKey ? findPrevCell(index) : findNextCell(index);
      if (target !== -1) focusCell(target);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGuess();
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      if (handleCellInput(index, e.key)) {
        const next = findNextEmptyCell(index);
        const target = next !== -1 ? next : findNextCell(index);
        if (target !== -1) focusCell(target);
      }
    }
  });

  // Fallback for mobile (input event)
  answerAreaEl.addEventListener('input', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    const index = parseInt(e.target.dataset.index);
    const value = e.target.value;
    if (value) {
      if (handleCellInput(index, value.slice(-1))) {
        const next = findNextEmptyCell(index);
        const target = next !== -1 ? next : findNextCell(index);
        if (target !== -1) focusCell(target);
      } else {
        // Browser already wrote the blocked character into the field; revert it.
        e.target.value = game.cells[index].userLetter || '';
      }
    } else {
      handleCellInput(index, '');
    }
  });

  answerAreaEl.addEventListener('focusin', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    const index = parseInt(e.target.dataset.index);
    highlightSameSymbol(game.cells[index].symbol);
    if (IS_MOBILE_CUSTOM_KB) {
      showMobileKeyboard();
    } else if (!e.target.hasAttribute('readonly')) {
      liftAppAboveKeyboard();
    }
  });
  answerAreaEl.addEventListener('focusout', (e) => {
    clearHighlights();
    // Drop the lift when focus leaves the answer area entirely — moving
    // between cells shouldn't bounce #app.
    if (!answerAreaEl.contains(e.relatedTarget)) {
      if (IS_MOBILE_CUSTOM_KB) hideMobileKeyboard();
      else releaseAppLift();
    }
  });
}

// --- Mobile on-screen keyboard ---
function buildMobileKeyboard() {
  if (document.getElementById('mobile-keyboard')) return;
  const kb = document.createElement('div');
  kb.id = 'mobile-keyboard';
  kb.setAttribute('role', 'group');
  kb.setAttribute('aria-label', 'On-screen keyboard');
  const rows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
  ];
  const BACKSPACE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.52.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>'
    + '</svg>';
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    row.forEach(k => {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'kb-key';
      key.tabIndex = -1;
      if (k === 'ENTER') {
        key.classList.add('kb-wide');
        key.dataset.key = 'ENTER';
        key.textContent = 'ENTER';
        key.setAttribute('aria-label', 'Submit guess');
      } else if (k === 'BACKSPACE') {
        key.classList.add('kb-wide');
        key.dataset.key = 'BACKSPACE';
        key.innerHTML = BACKSPACE_SVG;
        key.setAttribute('aria-label', 'Backspace');
      } else {
        key.dataset.key = k;
        key.textContent = k;
      }
      rowEl.appendChild(key);
    });
    kb.appendChild(rowEl);
  });
  // Inside #app so the desktop static-positioned variant sits within the
  // centered game container; mobile's position:fixed ignores the parent.
  document.getElementById('app').appendChild(kb);

  // Prevent the key from stealing focus from the active answer cell.
  kb.addEventListener('mousedown', (e) => {
    if (e.target.closest('.kb-key')) e.preventDefault();
  });
  kb.addEventListener('click', (e) => {
    const keyEl = e.target.closest('.kb-key');
    if (!keyEl) return;
    if (keyEl.classList.contains('kb-disabled')) return;
    handleKeyboardKey(keyEl.dataset.key);
  });
}

function getFocusedCellIndex() {
  const inputEl = answerAreaEl.querySelector('.answer-cell input:focus');
  if (!inputEl) return -1;
  const idx = parseInt(inputEl.dataset.index);
  return isNaN(idx) ? -1 : idx;
}
function getFirstEditableEmptyIndex() {
  for (let i = 0; i < game.cells.length; i++) {
    if (!game.cells[i].isLocked && !game.cells[i].userLetter) return i;
  }
  return -1;
}
function getLastFilledEditableIndex() {
  for (let i = game.cells.length - 1; i >= 0; i--) {
    if (!game.cells[i].isLocked && game.cells[i].userLetter) return i;
  }
  return -1;
}

function handleKeyboardKey(k) {
  if (!game || game.isOver) return;
  if (k === 'ENTER') { handleGuess(); return; }
  if (k === 'BACKSPACE') {
    let index = getFocusedCellIndex();
    if (index === -1 || game.cells[index].isLocked) {
      index = getLastFilledEditableIndex();
      if (index === -1) return;
    }
    const cell = game.cells[index];
    if (cell && !cell.userLetter) {
      const prev = findPrevCell(index);
      if (prev !== -1) {
        handleCellInput(prev, '');
        focusCell(prev);
      }
    } else {
      handleCellInput(index, '');
      focusCell(index);
    }
    return;
  }
  if (/^[A-Z]$/.test(k)) {
    let index = getFocusedCellIndex();
    if (index === -1 || game.cells[index].isLocked) {
      index = getFirstEditableEmptyIndex();
      if (index === -1) return;
    }
    if (handleCellInput(index, k.toLowerCase())) {
      const next = findNextEmptyCell(index);
      const target = next !== -1 ? next : findNextCell(index);
      focusCell(target !== -1 ? target : index);
    }
  }
}

let mobileKbReleaseTimer = null;

function showMobileKeyboard() {
  if (!IS_MOBILE_CUSTOM_KB) return;
  const kb = document.getElementById('mobile-keyboard');
  if (!kb || (game && game.isOver)) return;
  if (mobileKbReleaseTimer) { clearTimeout(mobileKbReleaseTimer); mobileKbReleaseTimer = null; }
  kb.classList.add('active');
  document.body.classList.add('mobile-kb-active');
  requestAnimationFrame(() => {
    const rect = answerAreaEl.getBoundingClientRect();
    const kbTop = window.innerHeight - kb.offsetHeight;
    if (rect.bottom > kbTop - 10) {
      window.scrollBy({ top: rect.bottom - (kbTop - 16), behavior: 'smooth' });
    }
  });
}

// Defer removal so the pending click on HINT/GIVE UP/GUESS/NEXT PUZZLE doesn't
// miss: synchronous focusout → layout shrink would clamp scroll and pull the
// button out from under the tap, forcing a second tap. If focus lands back in
// an answer cell, showMobileKeyboard cancels this timer and the keyboard
// never visually blinks. Once a click handler has run, it can call the
// Immediate variant to skip the delay (the click has already dispatched so
// layout shift no longer matters).
function hideMobileKeyboard() {
  const kb = document.getElementById('mobile-keyboard');
  if (!kb) return;
  if (mobileKbReleaseTimer) clearTimeout(mobileKbReleaseTimer);
  mobileKbReleaseTimer = setTimeout(() => {
    mobileKbReleaseTimer = null;
    kb.classList.remove('active');
    document.body.classList.remove('mobile-kb-active');
  }, 350);
}

function hideMobileKeyboardImmediate() {
  const kb = document.getElementById('mobile-keyboard');
  if (!kb) return;
  if (mobileKbReleaseTimer) { clearTimeout(mobileKbReleaseTimer); mobileKbReleaseTimer = null; }
  kb.classList.remove('active');
  document.body.classList.remove('mobile-kb-active');
}

// --- Hints ---
function revealHint() {
  if (game.unrevealedLetters.length === 0) return;
  if (scrambleTimer) {
    clearInterval(scrambleTimer);
    scrambleTimer = null;
    setCipherText(cipherEl, game.encoded);
    cipherEl.style.height = '';
    cipherEl.style.overflow = '';
  }
  const letter = game.unrevealedLetters.pop();
  const symbol = game.mapping[letter];
  game.revealedHints.push({ symbol, letter });
  updateCipherDisplay();

  // Fill and lock answer cells for this symbol
  game.symbolToUserLetter[symbol] = letter;
  (game.symbolToPositions[symbol] || []).forEach(pos => {
    const cell = game.cells[pos];
    cell.userLetter = letter;
    cell.isLocked = true;
    const cellDiv = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"]');
    const inputEl = cellDiv && cellDiv.querySelector('input');
    if (inputEl) { inputEl.value = letter; inputEl.disabled = true; }
    if (cellDiv) cellDiv.classList.add('locked');
  });
  updateVirtualCaret();
  updateKeyboardDisabledState();
  saveInProgressGame();
}

// --- Game logic ---
function startGame({ fromNewGame = false, seed = null, restored = null } = {}) {
  let phraseObj, symScale;
  if (restored) {
    const found = PHRASES.find(p => p.id === restored.phraseId);
    if (!found) {
      clearInProgressGame();
      return startGame({ fromNewGame });
    }
    phraseObj = found;
    currentSymbols = restored.symbols;
    symScale = restored.scale || 1;
  } else {
    const used = getUsed();
    const isStarterGame = seed ? true : (used.length === 0 && getTotalRaisins() <= 5);
    const group = isStarterGame ? SYMBOL_GROUPS[0] : SYMBOL_GROUPS[Math.floor(Math.random() * SYMBOL_GROUPS.length)];
    currentSymbols = [...group.symbols];
    for (let i = currentSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentSymbols[i], currentSymbols[j]] = [currentSymbols[j], currentSymbols[i]];
    }
    symScale = group.scale || 1;
    phraseObj = seed || selectPhrase();
  }
  cipherEl.style.setProperty('--sym-scale', symScale);
  cipherEl.style.setProperty('--len-scale', computeLenScale(phraseObj.phrase));
  const { encoded, mapping } = encode(phraseObj.phrase);
  const reverseMapping = {};
  for (const [letter, symbol] of Object.entries(mapping)) {
    reverseMapping[symbol] = letter;
  }
  const letters = Object.keys(mapping);
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const puzzleMax = maxRaisinsForRank(phraseObj.rank);
  game = {
    phraseId: phraseObj.id || null,
    rank: phraseObj.rank,
    symScale,
    phrase: phraseObj.phrase,
    clue: phraseObj.clue,
    encoded,
    mapping,
    reverseMapping,
    unrevealedLetters: letters,
    revealedHints: [],
    maxRaisins: puzzleMax,
    raisins: puzzleMax,
    triesLeft: MAX_TRIES,
    isOver: false,
    guessCount: 0,
    hintsUsed: 0,
    cells: [],
    symbolToPositions: {},
    symbolToUserLetter: {}
  };
  updateRaisinDisplay();
  clueEl.textContent = game.clue;
  hintsEl.innerHTML = '';
  hintsEl.classList.remove('hidden');
  cipherEl.classList.remove('game-over');
  feedbackEl.textContent = '';
  feedbackEl.className = '';
  resultFeedbackEl.textContent = '';
  resultFeedbackEl.className = '';
  resultEl.style.display = 'none';
  answerAreaEl.classList.remove('hidden');
  submitBtn.disabled = false;
  submitBtn.classList.remove('hidden');
  hintBtn.classList.remove('hidden');
  giveupBtn.classList.remove('hidden');
  newgameBtn.classList.add('hidden');
  reopenResultBtn.classList.add('hidden');
  newgameOuterBtn.classList.add('hidden');

  buildAnswerArea();

  if (restored) {
    (restored.revealedSymbols || []).forEach(sym => {
      const letter = game.reverseMapping[sym];
      if (!letter) return;
      const idx = game.unrevealedLetters.indexOf(letter);
      if (idx !== -1) game.unrevealedLetters.splice(idx, 1);
      game.revealedHints.push({ symbol: sym, letter });
      game.symbolToUserLetter[sym] = letter;
      (game.symbolToPositions[sym] || []).forEach(pos => {
        const cell = game.cells[pos];
        cell.userLetter = letter;
        cell.isLocked = true;
        const cellDiv = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"]');
        const inputEl = cellDiv && cellDiv.querySelector('input');
        if (inputEl) { inputEl.value = letter; inputEl.disabled = true; }
        if (cellDiv) cellDiv.classList.add('locked');
      });
    });
    (restored.cellLetters || []).forEach((letter, idx) => {
      if (!letter) return;
      const cell = game.cells[idx];
      if (!cell || cell.isLocked) return;
      handleCellInput(idx, letter);
    });
    if (typeof restored.maxRaisins === 'number') game.maxRaisins = restored.maxRaisins;
    game.raisins = typeof restored.raisins === 'number' ? restored.raisins : game.maxRaisins;
    game.triesLeft = typeof restored.triesLeft === 'number' ? restored.triesLeft : MAX_TRIES;
    game.guessCount = restored.guessCount || 0;
    game.hintsUsed = typeof restored.hintsUsed === 'number' ? restored.hintsUsed : 0;
    updateRaisinDisplay();
  }

  updateVirtualCaret();
  if (seed || restored) {
    setCipherText(cipherEl, encoded);
    if (restored) updateCipherDisplay();
  } else {
    animateCipherScramble(encoded, cipherEl);
  }

  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  setTimeout(() => {
    if (seed) return;
    if (IS_MOBILE_CUSTOM_KB) return; // wait for user tap before showing keyboard
    if (isMobile) {
      if (fromNewGame) focusCellQuietly(0);
      return;
    }
    // Desktop: focus the first empty editable cell so the native caret blinks.
    const idx = getFirstEditableEmptyIndex();
    focusCell(idx === -1 ? 0 : idx);
  }, 100);

  // Append keyboard once content has been laid out so the static-positioned
  // desktop variant doesn't briefly render above its final spot.
  buildMobileKeyboard();
  updateKeyboardDisabledState();
  document.body.classList.remove('app-loading');
  saveInProgressGame();
}

function handleGuess() {
  if (game.isOver) return;

  const allFilled = game.cells.every(c => c.isLocked || c.userLetter);
  if (!allFilled) {
    feedbackEl.textContent = 'Fill in all letters first.';
    feedbackEl.className = 'feedback-wrong';
    const firstEmpty = game.cells.findIndex(c => !c.isLocked && !c.userLetter);
    if (firstEmpty !== -1) focusCell(firstEmpty);
    return;
  }

  game.guessCount++;

  let allCorrect = true;
  const incorrectPositions = [];
  game.cells.forEach(c => {
    if (c.userLetter !== c.char) {
      allCorrect = false;
      incorrectPositions.push(c.index);
    }
  });

  if (allCorrect) {
    showWin();
  } else {
    incorrectPositions.forEach(pos => {
      const cellDiv = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"]');
      if (cellDiv) {
        cellDiv.classList.add('cell-incorrect');
        setTimeout(() => cellDiv.classList.remove('cell-incorrect'), 1200);
      }
    });
    feedbackEl.textContent = 'Not quite right.';
    feedbackEl.className = 'feedback-wrong';
    game.triesLeft = Math.max(0, (game.triesLeft || 0) - 1);
    game.raisins--;
    updateRaisinDisplay();
    if (game.raisins <= 0 || game.triesLeft <= 0) {
      showLoss();
      return;
    }
    revealHint();
    saveInProgressGame();
  }
}

function showWin() {
  game.isOver = true;
  clearInProgressGame();
  updateVirtualCaret();
  const won = game.raisins;
  const totalBefore = getTotalRaisins();
  saveTotalRaisins(totalBefore + won);
  updateRaisinDisplay();
  subtitleEl.classList.add('hidden-mobile');
  feedbackEl.textContent = '';

  game.cells.forEach((c, i) => {
    const cellDiv = answerAreaEl.querySelector('.answer-cell[data-index="' + i + '"]');
    if (cellDiv) setTimeout(() => cellDiv.classList.add('cell-correct'), i * 30);
  });

  resultFeedbackEl.textContent = pickWinPhrase(won);
  resultFeedbackEl.className = 'feedback-correct';
  const raisinLabel = 'You won ' + won + ' raisin' + (won !== 1 ? 's' : '');
  const safePhrase = game.phrase.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let raisinText = '<div class="solved-phrase">' + safePhrase + '</div>';
  raisinText += '<div id="raisin-trophies" role="img" aria-label="' + raisinLabel + '">';
  for (let i = 0; i < won; i++) {
    raisinText += '<span class="raisin-trophy" style="animation-delay:' + (i * 80) + 'ms">' + STAKE_RAISIN_SVG + '</span>';
  }
  raisinText += '</div>';
  raisinText += '<div class="won-caption">' + raisinLabel + '</div>';
  lastLevelUp = checkLevelUp(totalBefore, totalBefore + won);
  const levelUp = lastLevelUp;
  if (levelUp) {
    raisinText += '<div id="level-up-message">' + levelUp.phrase + '</div>';
  }
  const newStreak = getStreak() + 1;
  saveStreak(newStreak);
  saveLossStreak(0);
  const isPerfect = (won === game.maxRaisins);
  const newPerfectStreak = isPerfect ? getPerfectStreak() + 1 : 0;
  savePerfectStreak(newPerfectStreak);
  game.streak = newStreak;
  game.perfectStreak = newPerfectStreak;
  if (newPerfectStreak >= 3 && [3, 6, 10].includes(newPerfectStreak)) {
    raisinText += '<div class="streak-message">Perfect streak!<br><span class="nowrap">' + newPerfectStreak + ' in a row</span></div>';
  } else if ([3, 6, 10].includes(newStreak)) {
    raisinText += '<div class="streak-message">You\'re on a hot streak!<br><span class="nowrap">' + newStreak + ' in a row</span></div>';
  }
  recordDailyGame({ won, max: game.maxRaisins, perfect: isPerfect, lost: false });
  if (game.phraseId) {
    recordHistory({ date: getTodayKey(), phrase: game.phrase, won, max: game.maxRaisins, perfect: isPerfect, lost: false });
  }
  if (isDailyLimitReached()) {
    raisinText += buildDailySummaryHTML();
  }
  resultRaisinsEl.innerHTML = raisinText;
  const shouldCelebrate = !!levelUp ||
    (newPerfectStreak >= 3 && [3, 6, 10].includes(newPerfectStreak)) ||
    [3, 6, 10].includes(newStreak);
  showResult(1250);
  setTimeout(() => {
    if (shouldCelebrate) spawnConfetti();
    else spawnMiniConfetti();
  }, 1250);
}

function showLoss() {
  game.isOver = true;
  clearInProgressGame();
  updateVirtualCaret();
  game.raisins = 0;
  saveStreak(0);
  savePerfectStreak(0);
  saveLossStreak(getLossStreak() + 1);
  game.streak = 0;
  game.perfectStreak = 0;
  lastLevelUp = null;
  updateRaisinDisplay();
  subtitleEl.classList.add('hidden-mobile');
  feedbackEl.textContent = '';
  resultFeedbackEl.textContent = game.guessCount > 0 ? 'Nice try!' : 'Better luck next time!';
  resultFeedbackEl.className = 'feedback-wrong';
  const safePhrase = game.phrase.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  recordDailyGame({ won: 0, max: game.maxRaisins, perfect: false, lost: true });
  if (game.phraseId) {
    recordHistory({ date: getTodayKey(), phrase: game.phrase, won: 0, max: game.maxRaisins, perfect: false, lost: true });
  }
  let lossHTML =
    '<div class="solved-phrase"><span class="answer-label">Answer:</span>' + safePhrase + '</div>' +
    '<div class="won-caption">You got 0 raisins.</div>';
  if (isDailyLimitReached()) {
    lossHTML += buildDailySummaryHTML();
  }
  resultRaisinsEl.innerHTML = lossHTML;
  showResult();
}

function revealAllLetters() {
  const revealedSymbols = new Set(game.revealedHints.map(h => h.symbol));
  const charSpans = cipherEl.querySelectorAll('.cipher-char');
  const toReveal = [];
  charSpans.forEach(span => {
    const sym = span.getAttribute('data-symbol');
    if (game.reverseMapping[sym] && !revealedSymbols.has(sym) && !span.classList.contains('revealed')) {
      toReveal.push({ span, letter: game.reverseMapping[sym] });
    }
  });
  toReveal.forEach(({ span, letter }, i) => {
    setTimeout(() => {
      span.textContent = letter;
      span.classList.add('revealed');
    }, i * 40);
  });
  game.unrevealedLetters = [];
}

function showResult(delay = 1500) {
  hideMobileKeyboardImmediate();
  feedbackEl.classList.add('hidden');
  hintsEl.classList.add('hidden');
  submitBtn.classList.add('hidden');
  submitBtn.disabled = true;
  hintBtn.classList.add('hidden');
  giveupBtn.classList.add('hidden');
  if (!isDailyLimitReached()) newgameBtn.classList.remove('hidden');
  else newgameBtn.classList.add('hidden');
  if (!IS_MARATHON_MODE && isDailyLimitReached() && RIDDLES.length) riddleBtn.classList.remove('hidden');
  else riddleBtn.classList.add('hidden');
  if (marathonEndBtn) {
    if (IS_MARATHON_MODE && isDailyLimitReached()) marathonEndBtn.classList.remove('hidden');
    else marathonEndBtn.classList.add('hidden');
  }

  answerAreaEl.querySelectorAll('input').forEach(input => { input.disabled = true; });

  if (scrambleTimer) {
    clearInterval(scrambleTimer);
    scrambleTimer = null;
  }
  setCipherText(cipherEl, game.encoded);
  cipherEl.style.height = '';
  cipherEl.style.overflow = '';
  updateCipherDisplay();
  cipherEl.classList.add('game-over');
  revealAllLetters();

  setTimeout(() => { resultEl.style.display = 'flex'; }, delay);
}

// --- Share ---
function buildDailyShareText() {
  const stats = getDailyStats();
  const games = stats.games;
  const total = getTotalRaisins();
  const todayRaisins = games.reduce((sum, g) => sum + (g.won || 0), 0);
  if (IS_MARATHON_MODE) {
    const correct = games.filter(g => (g.won || 0) > 0).length;
    const lead = GAME_CONFIG.shareLead || '';
    const url = GAME_CONFIG.shareUrl || 'phraisins.com';
    const header = GAME_CONFIG.shareHeader || 'PHRAISINS';
    let mText = (lead ? lead + ' ' : '') + header + '\n';
    mText += '✨ ' + getRoundupTitle() + '\n';
    mText += correct + '/' + MARATHON_SIZE + ' correct\n';
    mText += '\u{1F347} ' + todayRaisins + ' raisin' + (todayRaisins !== 1 ? 's' : '') + ' earned\n';
    mText += url;
    return mText;
  }
  let text = 'PHRAISINS — daily recap\n';
  games.forEach(g => {
    const won = g.won || 0;
    const max = g.max || LEGACY_MAX_RAISINS;
    const filled = '\u{1F347}'.repeat(won);
    const empty = '⚫'.repeat(Math.max(0, max - won));
    text += filled + empty + ' (' + won + '/' + max + ')\n';
  });
  text += 'Today: ' + todayRaisins + ' raisin' + (todayRaisins !== 1 ? 's' : '') + '\n';
  const level = getCurrentLevel(total);
  text += 'Total: ' + total + ' raisins';
  if (level) text += ' — ' + level.label;
  text += '\nphraisins.com';
  return text;
}

function buildShareText() {
  if (isDailyLimitReached()) return buildDailyShareText();
  const won = game.raisins;
  const max = game.maxRaisins || LEGACY_MAX_RAISINS;
  const total = getTotalRaisins();
  const filled = '\u{1F347}'.repeat(won);
  const empty = '\u26AB'.repeat(Math.max(0, max - won));
  let text = 'PHRAISINS\n';
  text += filled + empty + ' (' + won + '/' + max + ')\n';
  const level = getCurrentLevel(total);
  text += 'Total: ' + total + ' raisins';
  if (level) text += ' \u2014 ' + level.label;
  if (lastLevelUp) text += ' \u{1F389}';
  const streak = game.streak || 0;
  const perfectStreak = game.perfectStreak || 0;
  if (perfectStreak >= 3) text += '\nPerfect Streak: ' + perfectStreak + ' in a row!';
  else if (streak >= 3) text += '\nStreak: ' + streak + ' in a row';
  text += '\nphraisins.com';
  return text;
}

function showToast(msg) {
  shareToast.textContent = msg || 'Copied!';
  shareToast.classList.add('show');
  setTimeout(() => shareToast.classList.remove('show'), 1500);
}

async function shareResult() {
  const text = buildShareText();
  const shareData = { text };
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  if (isMobile && navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try { await navigator.share(shareData); showToast('Shared!'); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); if (!isMobile) showToast('Copied to clipboard!'); return; }
    catch (e) {}
  }
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  if (!isMobile) showToast('Copied to clipboard!');
}

function getSeenRiddleIds() {
  try { return JSON.parse(localStorage.getItem(lsKey('riddles_seen'))) || []; }
  catch { return []; }
}
function saveSeenRiddleIds(ids) {
  try { localStorage.setItem(lsKey('riddles_seen'), JSON.stringify(ids)); } catch {}
}
function rolloverRiddleIfNeeded() {
  const today = getTodayKey();
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey('riddle_today')));
    if (raw && raw.date && raw.date !== today && raw.id != null) {
      localStorage.setItem(lsKey('riddle_yesterday'), JSON.stringify(raw));
    }
  } catch {}
}

function getDailyRiddle() {
  rolloverRiddleIfNeeded();
  const today = getTodayKey();
  const validIds = new Set(RIDDLES.map(r => r.id));
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey('riddle_today')));
    if (raw && raw.date === today && validIds.has(raw.id)) {
      const found = RIDDLES.find(r => r.id === raw.id);
      if (found) return found;
    }
  } catch {}
  let seen = getSeenRiddleIds().filter(id => validIds.has(id));
  if (seen.length >= RIDDLES.length) seen = [];
  const pool = RIDDLES.filter(r => !seen.includes(r.id));
  const riddle = pool[Math.floor(Math.random() * pool.length)];
  seen.push(riddle.id);
  saveSeenRiddleIds(seen);
  try { localStorage.setItem(lsKey('riddle_today'), JSON.stringify({ date: today, id: riddle.id })); } catch {}
  return riddle;
}

function getYesterdayRiddle() {
  if (!RIDDLES.length) return null;
  rolloverRiddleIfNeeded();
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey('riddle_yesterday')));
    if (raw && raw.id != null) {
      const found = RIDDLES.find(r => r.id === raw.id);
      if (found) return found;
    }
  } catch {}
  return null;
}

function showRiddleModal() {
  if (!RIDDLES.length) return;
  const riddle = getDailyRiddle();
  const lines = (riddle && riddle.lines) ? riddle.lines : [];
  const yesterday = getYesterdayRiddle();
  const yesterdayLink = yesterday
    ? '<div class="riddle-yesterday-link"><a href="#" id="riddle-yesterday-link">Answer to yesterday’s riddle</a></div>'
    : '<div class="riddle-yesterday-link riddle-yesterday-note">Answer revealed tomorrow</div>';
  const html = '<div class="riddle-text">' +
    lines.map(line => '<p>' + escapeHTML(line) + '</p>').join('') +
    '</div>' + yesterdayLink;
  openInfoModal('Riddle', html);
  infoModalTitleEl.innerHTML =
    '<span class="riddle-q riddle-q-l" aria-hidden="true">?</span>' +
    'Riddle' +
    '<span class="riddle-q riddle-q-r" aria-hidden="true">?</span>';
  const linkEl = document.getElementById('riddle-yesterday-link');
  if (linkEl) {
    linkEl.addEventListener('click', (e) => {
      e.preventDefault();
      showYesterdayRiddleModal({ returnToToday: true });
    });
  }
}

function showYesterdayRiddleModal(opts) {
  const riddle = getYesterdayRiddle();
  let bodyHtml;
  if (!riddle) {
    bodyHtml = '<div class="riddle-text"><p>No previous riddle yet — check back tomorrow!</p></div>';
  } else {
    const lines = riddle.lines || [];
    const linesHtml = lines.map(line => '<p>' + escapeHTML(line) + '</p>').join('');
    const answerHtml = riddle.answer
      ? '<p class="riddle-answer"><span class="riddle-answer-label">Answer:</span> ' + escapeHTML(riddle.answer) + '</p>'
      : '';
    bodyHtml = '<div class="riddle-text">' + linesHtml + answerHtml + '</div>';
  }
  if (POTTER_PUZZLES_ENABLED && !IS_MARATHON_MODE && !hasPlayedPotter()) {
    bodyHtml += '<div class="riddle-yesterday-link riddle-potter-link">' +
      '<a href="/wizarding-words/">' +
      '<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<line x1="3.5" y1="20.5" x2="13.5" y2="10.5" stroke="#6b4423" stroke-width="2.4" stroke-linecap="round"/>' +
      '<line x1="13" y1="11" x2="16.5" y2="7.5" stroke="#a8794f" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="17" cy="7" r="2.2" fill="#ffe199"/>' +
      '<circle cx="17" cy="7" r="1" fill="#fff8dc"/>' +
      '<path d="M17 1.1v0.7M17 2.6v0.7M16.6 2.2h-0.7M17.4 2.2h0.7M21 2.5v0.7M21 4v0.7M20.6 3.6h-0.7M21.4 3.6h0.7M22.5 5.9v0.7M22.5 7.4v0.7M22.1 7h-0.7M22.9 7h0.7" stroke="#ffd97a" stroke-width="0.9" stroke-linecap="round"/>' +
      '</svg>' +
      '<span>Try Wizarding Words</span>' +
      '</a></div>';
  }
  openInfoModal('Yesterday’s Riddle', bodyHtml);
  if (opts && opts.returnToToday) infoModalReturnTo = showRiddleModal;
}

// --- Events ---
shareBtn.addEventListener('click', shareResult);
riddleBtn.addEventListener('click', showRiddleModal);
submitBtn.addEventListener('click', handleGuess);
hintBtn.addEventListener('click', () => {
  if (game.isOver) return;
  if (game.hintsUsed >= MAX_HINTS) return;
  if (game.triesLeft <= 1) return;
  feedbackEl.textContent = '';
  game.hintsUsed++;
  game.triesLeft = Math.max(0, (game.triesLeft || 0) - 1);
  if (spendRaisin()) return;
  revealHint();
  const next = findNextEmptyCell(-1);
  if (next !== -1) {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (IS_MOBILE_CUSTOM_KB) hideMobileKeyboardImmediate();
    else if (isMobile) focusCellQuietly(next);
    else focusCell(next);
  } else if (IS_MOBILE_CUSTOM_KB) {
    hideMobileKeyboardImmediate();
  }
});
giveupBtn.addEventListener('click', () => { if (!game.isOver) showLoss(); });
newgameBtn.addEventListener('click', () => startGame({ fromNewGame: true }));
resultCloseBtn.addEventListener('click', () => {
  resultEl.style.display = 'none';
  if ((game && game.isOver) || isDailyLimitReached()) {
    reopenResultBtn.classList.remove('hidden');
    if (!isDailyLimitReached()) newgameOuterBtn.classList.remove('hidden');
  }
});
resultEl.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'marathon-end-btn') { window.location.href = '/'; return; }
  if (e.target === resultEl) resultCloseBtn.click();
});
reopenResultBtn.addEventListener('click', () => {
  resultEl.style.display = 'flex';
  reopenResultBtn.classList.add('hidden');
  newgameOuterBtn.classList.add('hidden');
});
function showDailyLimitScreen() {
  document.body.classList.remove('app-loading');
  hideMobileKeyboardImmediate();
  feedbackEl.classList.add('hidden');
  hintsEl.classList.add('hidden');
  submitBtn.classList.add('hidden');
  submitBtn.disabled = true;
  hintBtn.classList.add('hidden');
  giveupBtn.classList.add('hidden');
  newgameBtn.classList.add('hidden');
  newgameOuterBtn.classList.add('hidden');
  reopenResultBtn.classList.add('hidden');
  answerAreaEl.classList.add('hidden');
  if (!IS_MARATHON_MODE && RIDDLES.length) riddleBtn.classList.remove('hidden');
  else riddleBtn.classList.add('hidden');
  const lastPhrase = getLastPlayedPhrase();
  if (lastPhrase) {
    paintSolvedCipher(lastPhrase);
    const dailyGames = getDailyStats().games;
    const lastGame = dailyGames[dailyGames.length - 1];
    const lastMax = (lastGame && lastGame.max) || maxRaisinsForRank(lastPhrase.rank);
    const lastWon = lastGame ? lastGame.won : lastMax;
    stakeRaisinsEl.innerHTML = '';
    for (let i = 0; i < lastMax; i++) {
      const tmp = document.createElement('span');
      tmp.innerHTML = STAKE_RAISIN_SVG;
      const chip = tmp.firstElementChild;
      if (i >= lastWon) chip.classList.add('spent');
      stakeRaisinsEl.appendChild(chip);
    }
  } else {
    cipherEl.textContent = '';
    clueEl.textContent = '';
  }
  if (IS_MARATHON_MODE) {
    const dailyGames = getDailyStats().games;
    const lastGame = dailyGames[dailyGames.length - 1];
    if (lastGame && (lastGame.won || 0) > 0) {
      resultFeedbackEl.textContent = pickWinPhrase(lastGame.won);
      resultFeedbackEl.className = 'feedback-correct';
    } else if (lastGame) {
      resultFeedbackEl.textContent = 'Nice try!';
      resultFeedbackEl.className = 'feedback-wrong';
    } else {
      resultFeedbackEl.textContent = '';
      resultFeedbackEl.className = '';
    }
  } else {
    resultFeedbackEl.textContent = 'That’s a wrap for today!';
    resultFeedbackEl.className = 'feedback-correct';
  }
  resultRaisinsEl.innerHTML = buildDailySummaryHTML();
  if (marathonEndBtn && IS_MARATHON_MODE) marathonEndBtn.classList.remove('hidden');
  resultEl.style.display = 'flex';
}
newgameOuterBtn.addEventListener('click', () => startGame({ fromNewGame: true }));
setupAnswerNavigation();

// --- First-time tutorial ---
const TUTORIAL_SEED = {
  phrase: 'better late than never',
  clue: "When showing up eventually beats not showing up at all."
};
const TUTORIAL_STEPS = [
  { targets: ['#cipher-display'],              title: 'The puzzle',               body: 'Each symbol represents a letter that makes up a common phrase.' },
  { targets: ['#clue-display'],                title: 'The clue',                 body: "Solve it with the help of the clue.", calloutGap: 27 },
  { targets: ['#hint-btn', '#cipher-display'], title: 'Stuck? Use a hint',       body: "Hints reveal a letter but will cost you a raisin.", placement: 'between', onEnter: tutorialDemoHint },
  { targets: ['#answer-area', '#score-area'], title: 'Answer and win', body: "Guess the phrase and win raisins! You can't eat them, but it will be fun.", placement: 'between', cta: 'Start Game', onEnter: tutorialDemoSolve }
];

function getTutorialSeen() { return localStorage.getItem(lsKey('tutorial_seen')) === 'true'; }
function saveTutorialSeen() { localStorage.setItem(lsKey('tutorial_seen'), 'true'); }

let tutorialStepIndex = 0;
let tutorialSpotlightEls = [];
let tutorialTimers = [];
const tutorialOverlayEl = document.getElementById('tutorial-overlay');
const tutorialCalloutEl = document.getElementById('tutorial-callout');
const tutorialTitleEl = document.getElementById('tutorial-title');
const tutorialBodyEl = document.getElementById('tutorial-body');
const tutorialDotsEl = document.getElementById('tutorial-dots');
const tutorialNextBtn = document.getElementById('tutorial-next');

function clearTutorialTimers() {
  tutorialTimers.forEach(t => clearTimeout(t));
  tutorialTimers = [];
}

function tutorialDemoHint() {
  tutorialTimers.push(setTimeout(() => {
    if (game && game.unrevealedLetters && game.unrevealedLetters.length > 0) {
      revealHint();
    }
  }, 700));
}

function tutorialDemoSolve() {
  if (!game) return;
  const uniqueLetters = [...new Set(game.phrase.toLowerCase().replace(/[^a-z]/g, '').split(''))];
  let delay = 500;
  uniqueLetters.forEach(letter => {
    const symbol = game.mapping[letter];
    if (!symbol) return;
    if (game.revealedHints.some(h => h.symbol === symbol)) return;
    tutorialTimers.push(setTimeout(() => {
      if (game.revealedHints.some(h => h.symbol === symbol)) return;
      game.revealedHints.push({ symbol, letter });
      updateCipherDisplay();
      game.symbolToUserLetter[symbol] = letter;
      (game.symbolToPositions[symbol] || []).forEach(pos => {
        const cell = game.cells[pos];
        if (!cell || cell.isLocked) return;
        cell.userLetter = letter;
        const inputEl = answerAreaEl.querySelector('.answer-cell[data-index="' + pos + '"] input');
        if (inputEl) inputEl.value = letter;
      });
    }, delay));
    delay += 280;
  });
}

function positionTutorialCallout() {
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const callout = tutorialCalloutEl;
  const ch = callout.offsetHeight;
  const cw = callout.offsetWidth;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const margin = 16;
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  const gap = (step && typeof step.calloutGap === 'number') ? step.calloutGap : 18;

  let anchorEls = tutorialSpotlightEls;
  if (step && step.positionAnchor) {
    const anchorEl = document.querySelector(step.positionAnchor);
    if (anchorEl) anchorEls = [anchorEl];
  }
  let top = null;

  if (step && step.placement === 'over' && anchorEls.length >= 1) {
    const rect = anchorEls[0].getBoundingClientRect();
    top = rect.top + (rect.height - ch) / 2;
  } else if (step && step.placement === 'between' && anchorEls.length >= 2) {
    const rects = anchorEls
      .map(el => el.getBoundingClientRect())
      .filter(r => r.bottom >= 0 && r.top <= vh)
      .sort((a, b) => a.top - b.top);
    for (let i = 0; i < rects.length - 1; i++) {
      const gapStart = rects[i].bottom;
      const gapEnd = rects[i + 1].top;
      if (gapEnd - gapStart >= ch + 2 * gap) {
        top = gapStart + (gapEnd - gapStart - ch) / 2;
        break;
      }
    }
  }

  let topBound = null, botBound = null;
  anchorEls.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    topBound = topBound === null ? r.top : Math.min(topBound, r.top);
    botBound = botBound === null ? r.bottom : Math.max(botBound, r.bottom);
  });

  if (top === null) {
    if (topBound !== null) {
      const spaceAbove = topBound;
      const spaceBelow = vh - botBound;
      const needed = ch + gap + margin;
      if (spaceBelow >= needed && spaceBelow >= spaceAbove) {
        top = botBound + gap;
      } else if (spaceAbove >= needed) {
        top = topBound - ch - gap;
      } else if (spaceBelow >= needed) {
        top = botBound + gap;
      } else {
        top = margin;
      }
    } else {
      top = Math.max(margin, (vh - ch) / 2);
    }
  }
  if (step && typeof step.calloutOffset === 'number') {
    top += step.calloutOffset;
  }
  top = Math.max(margin, Math.min(top, vh - ch - margin));
  callout.style.top = top + 'px';
  if (isMobile) {
    callout.style.left = '';
  } else {
    callout.style.left = Math.max(margin, (vw - cw) / 2) + 'px';
  }
}

function clearTutorialSpotlights() {
  tutorialSpotlightEls.forEach(el => el.classList.remove('tutorial-spotlight'));
  tutorialSpotlightEls = [];
}

function renderTutorialStep(i) {
  const step = TUTORIAL_STEPS[i];
  clearTutorialTimers();
  clearTutorialSpotlights();
  const targets = step.targets || [];
  targets.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add('tutorial-spotlight');
      tutorialSpotlightEls.push(el);
    }
  });
  const primary = tutorialSpotlightEls[0] || null;
  if (primary) primary.scrollIntoView({ behavior: 'smooth', block: 'center' });
  tutorialTitleEl.textContent = step.title || '';
  tutorialBodyEl.textContent = step.body;
  tutorialDotsEl.innerHTML = TUTORIAL_STEPS.map((_, idx) =>
    '<span class="tutorial-dot' + (idx === i ? ' active' : '') + '"></span>'
  ).join('');
  tutorialNextBtn.textContent = step.cta || 'Next';
  tutorialNextBtn.classList.toggle('tutorial-cta', !!step.cta);
  requestAnimationFrame(() => positionTutorialCallout());
  if (typeof step.onEnter === 'function') step.onEnter();
}

function showTutorial() {
  tutorialStepIndex = 0;
  document.body.classList.add('tutorial-active');
  tutorialOverlayEl.classList.remove('hidden');
  tutorialCalloutEl.classList.remove('hidden');
  tutorialOverlayEl.setAttribute('aria-hidden', 'false');
  renderTutorialStep(0);
}

function endTutorial() {
  clearTutorialTimers();
  clearTutorialSpotlights();
  tutorialOverlayEl.classList.add('hidden');
  tutorialCalloutEl.classList.add('hidden');
  tutorialOverlayEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('tutorial-active');
  saveTutorialSeen();
  if (isDailyLimitReached()) {
    clearInProgressGame();
    showDailyLimitScreen();
  } else {
    const inProgress = loadInProgressGame();
    if (inProgress) startGame({ restored: inProgress });
    else startGame({ fromNewGame: true });
  }
}

function advanceTutorial() {
  if (tutorialStepIndex >= TUTORIAL_STEPS.length - 1) {
    endTutorial();
    return;
  }
  tutorialStepIndex++;
  renderTutorialStep(tutorialStepIndex);
}

tutorialNextBtn.addEventListener('click', advanceTutorial);

const welcomeDialogEl = document.getElementById('welcome-dialog');
const welcomePlayBtn = document.getElementById('welcome-play');
const welcomeHowToBtn = document.getElementById('welcome-how-to');
const welcomeAboutBtn = document.getElementById('welcome-about');
const welcomeCloseBtn = document.getElementById('welcome-close');

function showWelcomeDialog() {
  document.body.classList.add('tutorial-active');
  tutorialOverlayEl.classList.remove('hidden');
  tutorialOverlayEl.setAttribute('aria-hidden', 'false');
  welcomeDialogEl.classList.remove('hidden');
}

function hideWelcomeDialog() {
  welcomeDialogEl.classList.add('hidden');
}

// Desktop only — restores the native caret to the first empty cell after a
// click moves focus away (welcome buttons, tutorial Next). Skipped on touch
// devices since focusing an input pops the on-screen keyboard.
function focusFirstEditableCellIfDesktop() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (IS_MOBILE_CUSTOM_KB) return;
  if (!game || game.isOver) return;
  const idx = getFirstEditableEmptyIndex();
  focusCell(idx === -1 ? 0 : idx);
}

function dismissWelcomeDialog() {
  hideWelcomeDialog();
  tutorialOverlayEl.classList.add('hidden');
  tutorialOverlayEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('tutorial-active');
  saveTutorialSeen();
  focusFirstEditableCellIfDesktop();
}

welcomePlayBtn.addEventListener('click', dismissWelcomeDialog);

if (welcomeCloseBtn) {
  welcomeCloseBtn.addEventListener('click', dismissWelcomeDialog);
}

welcomeHowToBtn.addEventListener('click', () => {
  hideWelcomeDialog();
  startGame({ seed: TUTORIAL_SEED });
  showTutorial();
});

if (welcomeAboutBtn) {
  welcomeAboutBtn.addEventListener('click', () => {
    // Tuck the welcome dialog and its overlay away so the About modal (a lower
    // z-index) is visible, then restore them when the modal is closed.
    hideWelcomeDialog();
    tutorialOverlayEl.classList.add('hidden');
    tutorialOverlayEl.setAttribute('aria-hidden', 'true');
    showAboutModal();
    infoModalReturnTo = () => {
      infoModalEl.classList.remove('show');
      showWelcomeDialog();
    };
  });
}
function repositionActiveCallout() {
  if (tutorialOverlayEl.classList.contains('hidden')) return;
  positionTutorialCallout();
}
window.addEventListener('resize', repositionActiveCallout);
window.addEventListener('resize', applyWordWrapHyphens);
window.addEventListener('scroll', repositionActiveCallout, { passive: true });
// Browser back/forward restores from bfcache without re-running init/startGame,
// so the native caret is lost. Re-focus on desktop when the page is revived.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  if (document.body.classList.contains('tutorial-active')) return;
  focusFirstEditableCellIfDesktop();
});
document.addEventListener('keydown', (e) => {
  if (tutorialCalloutEl.classList.contains('hidden')) return;
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
    e.preventDefault();
    advanceTutorial();
  }
});

// --- Hamburger menu ---
const menuBtnEl = document.getElementById('menu-btn');
const menuDropdownEl = document.getElementById('menu-dropdown');
const infoModalEl = document.getElementById('info-modal');
const infoModalTitleEl = document.getElementById('info-modal-title');
const infoModalBodyEl = document.getElementById('info-modal-body');
const infoModalCloseBtn = document.getElementById('info-modal-close');

function openMenu() {
  menuDropdownEl.classList.remove('hidden');
  menuBtnEl.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  menuDropdownEl.classList.add('hidden');
  menuBtnEl.setAttribute('aria-expanded', 'false');
}
menuBtnEl.addEventListener('click', (e) => {
  e.stopPropagation();
  if (menuDropdownEl.classList.contains('hidden')) openMenu();
  else closeMenu();
});
document.addEventListener('click', (e) => {
  if (menuDropdownEl.classList.contains('hidden')) return;
  if (e.target.closest('#menu-dropdown') || e.target.closest('#menu-btn')) return;
  closeMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!menuDropdownEl.classList.contains('hidden')) closeMenu();
  else if (infoModalEl.classList.contains('show')) closeInfoModal();
});

let infoModalReturnTo = null;
function openInfoModal(title, bodyHTML) {
  infoModalReturnTo = null;
  infoModalTitleEl.textContent = title;
  infoModalBodyEl.innerHTML = bodyHTML;
  infoModalEl.classList.add('show');
}
function closeInfoModal() {
  const ret = infoModalReturnTo;
  infoModalReturnTo = null;
  if (ret) ret();
  else {
    infoModalEl.classList.remove('show');
    focusFirstEditableCellIfDesktop();
  }
}
infoModalCloseBtn.addEventListener('click', closeInfoModal);
infoModalEl.addEventListener('click', (e) => { if (e.target === infoModalEl) closeInfoModal(); });

function escapeHTML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showHistoryModal() {
  const history = getHistory();
  let html;
  if (!history.length) {
    html = '<div class="history-empty">No puzzles yet — go solve one!</div>';
  } else {
    const ordered = history
      .map((h, i) => ({ h, i }))
      .sort((a, b) => (b.h.ts || 0) - (a.h.ts || 0) || b.i - a.i);
    const rows = ordered.map(({ h }) => {
      const won = h.won || 0;
      const max = h.max || LEGACY_MAX_RAISINS;
      const filled = '\u{1F347}'.repeat(won);
      const empty = '⚫'.repeat(Math.max(0, max - won));
      return '<li class="history-row">' +
        '<span class="history-pips">' + filled + empty + '</span>' +
        '<span class="history-phrase">' + escapeHTML(h.phrase || '') + '</span>' +
        '<span class="history-date">' + escapeHTML(h.date || '') + '</span>' +
        '</li>';
    }).join('');
    html = '<ul class="history-list">' + rows + '</ul>';
  }
  openInfoModal('My puzzle history', html);
}

function showAboutModal() {
  let html =
    '<div class="about-text">' +
    '<p>Phraisins is a free word game where players have four tries to guess a hidden phrase with the help of a clue. You can play up to three puzzles a day. Correct guesses win you raisins, unlock riddles, and raise you to new levels of grapeness. The game is designed by Eli&nbsp;Stutz for your pure, fruity enjoyment.</p>' +
    '<p><a href="https://elistutz.wordpress.com/contact-info/" target="_blank" rel="noopener">Contact Eli</a></p>';
  if (document.body.classList.contains('variant-potter')) {
    html +=
      '<p class="about-disclaimer">Wizarding Words is an unofficial fan project. Not affiliated with or endorsed by Warner Bros. or J.K. Rowling.</p>';
  }
  html += '</div>';
  openInfoModal('About', html);
}

function startHowToFromMenu() {
  startGame({ seed: TUTORIAL_SEED });
  showTutorial();
}

document.getElementById('menu-how-to').addEventListener('click', () => { closeMenu(); startHowToFromMenu(); });
document.getElementById('menu-history').addEventListener('click', () => { closeMenu(); showHistoryModal(); });
const menuRiddleBtn = document.getElementById('menu-riddle-answer');
if (menuRiddleBtn) {
  if (IS_MARATHON_MODE || !GAME_CONFIG.riddlesEnabled) menuRiddleBtn.classList.add('hidden');
  else menuRiddleBtn.addEventListener('click', () => { closeMenu(); showYesterdayRiddleModal(); });
}
const menuPotterBtn = document.getElementById('menu-potter-puzzles');
if (menuPotterBtn) {
  // Hide if Potter is disabled, or if we are already on the Potter page.
  if (POTTER_PUZZLES_ENABLED && !IS_MARATHON_MODE) {
    menuPotterBtn.classList.remove('hidden');
    menuPotterBtn.addEventListener('click', () => { window.location.href = '/wizarding-words/'; });
  } else {
    menuPotterBtn.classList.add('hidden');
  }
}
const menuPhraisinsBtn = document.getElementById('menu-phraisins');
if (menuPhraisinsBtn) {
  menuPhraisinsBtn.addEventListener('click', () => { window.location.href = '/'; });
}
document.getElementById('menu-about').addEventListener('click', () => { closeMenu(); showAboutModal(); });

// --- Init ---
async function init() {
  const loadingTimer = setTimeout(() => { clueEl.textContent = 'Loading\u2026'; }, 500);
  try {
    const response = await fetch(PHRASES_FILE);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    PHRASES = await response.json();
  } catch (err) {
    clearTimeout(loadingTimer);
    console.error('Failed to load phrases:', err);
    clueEl.textContent = 'Could not load puzzles. Please refresh.';
    return;
  }
  clearTimeout(loadingTimer);
  if (GAME_CONFIG.riddlesEnabled && !IS_MARATHON_MODE) {
    fetch('riddles.json')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(data => {
        if (Array.isArray(data)) {
          RIDDLES = data;
          if (isDailyLimitReached() && resultEl.style.display === 'flex') {
            riddleBtn.classList.remove('hidden');
          }
        }
      })
      .catch(err => console.error('Failed to load riddles:', err));
  }
  updateRaisinDisplay();
  if (getTotalRaisins() > 0 || getUsed().length > 0) saveTutorialSeen();
  if (isDailyLimitReached()) {
    clearInProgressGame();
    showDailyLimitScreen();
    return;
  }
  const inProgress = loadInProgressGame();
  if (inProgress) {
    saveTutorialSeen();
    startGame({ restored: inProgress });
    return;
  }
  if (!getTutorialSeen()) {
    startGame();
    document.body.classList.add('tutorial-active');
    setTimeout(showWelcomeDialog, 2500);
  } else {
    startGame();
  }
}
init();
