import { GAMES } from './games/registry.js';

// ── Code generation ───────────────────────────────────────────
const SALT  = 'JL21T9K';
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCode(level) {
  const s = SALT + level + SALT.split('').reverse().join('') + (level * 37);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  let n = (h + level * 7919) >>> 0;
  let code = '';
  for (let i = 0; i < 4; i++) { code += CHARS[n % CHARS.length]; n = (n / CHARS.length) >>> 0; }
  return code;
}

export function verifyCode(raw) {
  const c = raw.replace(/[-\s]/g, '').toUpperCase();
  if (c.length !== 4) return null;
  for (let lv = 1; lv <= 21; lv++) {
    if (generateCode(lv) === c) return lv;
  }
  return null;
}

// ── Progress (localStorage) ───────────────────────────────────
const LS_KEY = 'story_v1';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || fresh(); }
  catch { return fresh(); }
}
function fresh() { return { unlockedUpTo: 1, completedMedium: [], completedEasy: [] }; }
function saveProgress(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

export function getProgress() { return loadProgress(); }

export function markCompleted(level, difficulty) {
  const p = loadProgress();
  const key = difficulty === 'medium' ? 'completedMedium' : 'completedEasy';
  if (!p[key].includes(level)) p[key].push(level);
  if (difficulty === 'medium' && level >= p.unlockedUpTo)
    p.unlockedUpTo = Math.min(level + 1, 21);
  saveProgress(p);
  return p;
}

export function applyCode(raw) {
  const lv = verifyCode(raw);
  if (!lv) return null;
  const p = loadProgress();
  if (lv + 1 > p.unlockedUpTo) { p.unlockedUpTo = Math.min(lv + 1, 21); saveProgress(p); }
  return lv;
}

// ── Brief rules shown in the level popup ─────────────────────
const LEVEL_RULES = {
  1:  'Coloque peças em qualquer célula vazia, alternando turnos. Quem alinhar 3 em linha, coluna ou diagonal vence. Peças não se movem.',
  2:  'As 6 peças já estão posicionadas. Em cada turno, mova qualquer peça sua para qualquer posição vazia do tabuleiro.',
  3:  'As 6 peças já estão posicionadas. Mova uma peça para uma posição vizinha vazia, seguindo as linhas desenhadas no tabuleiro.',
  4:  'Mesmo movimento do Tapatan, mas só vale alinhamento que passe pelo centro (posição b2). Alinhar nas bordas não conta.',
  5:  'Como Tapatan, com uma opção extra: você também pode saltar sobre uma peça adjacente em linha reta pousando na posição seguinte, se estiver vazia.',
  6:  'Fase 1 — Colocação: cada jogador posiciona 3 peças alternadamente. Fase 2 — Movimento: mova qualquer peça sua para qualquer posição vazia.',
  7:  'Fase 1: cada jogador coloca 4 peças. Com 8 peças em 9 posições, quase não há espaço para mover — cada decisão é crítica.',
  8:  'Fase 1: coloque 3 peças livremente. Fase 2: mova para posição vizinha pelas linhas — como Tapatan, mas você escolheu onde começar.',
  9:  'Fase 1: coloque 3 peças. Fase 2: mova para qualquer vazio. Mas atenção: só conta alinhamento que passe pelo centro do tabuleiro.',
  10: 'Fase 1: coloque 3 peças. Fase 2: mova para vizinhos ou salte sobre peças em linha reta — combinando as regras do Achi com as do Tsoro.',
  11: 'Peças alternadas no tabuleiro. Mova uma peça para posição adjacente vazia. Quem não conseguir mover perde. Não há alinhamento.',
  12: 'Fase 1: posicione 4 peças livremente. Fase 2: mova pelas linhas adjacentes. Quem não conseguir mover perde.',
  13: 'Posição inicial em L. Regra especial: nas 2 primeiras jogadas de cada jogador, é proibido mover ao centro do tabuleiro.',
};

// ── Module-level callbacks (injetados por app.js) ─────────────
let _onPlayLevel = null;
let _showScreen  = null;
let _currentGame = null;
let _playAsDark  = false;

export function initStory({ onPlayLevel, showScreen }) {
  _onPlayLevel = onPlayLevel;
  _showScreen  = showScreen;
  _bindButtons();
}

// ── Ponto de entrada público ──────────────────────────────────
export function showStoryScreen() {
  if (!localStorage.getItem('story_intro_seen')) {
    _openModal('modal-story-intro');
  } else {
    _renderMap();
    _showScreen('screen-story');
    requestAnimationFrame(_drawPath);
  }
}

// ── Renderização do mapa ──────────────────────────────────────
function _renderMap() {
  const p = loadProgress();
  const container = document.getElementById('story-map');
  container.innerHTML = '';

  const storyGames = GAMES.filter(g => g.num >= 1 && g.num <= 21)
                          .sort((a, b) => a.num - b.num);

  storyGames.forEach((game, i) => {
    const lv        = game.num;
    const unlocked  = lv <= p.unlockedUpTo;
    const medDone   = p.completedMedium.includes(lv);
    const easyDone  = p.completedEasy.includes(lv);
    const isCurrent = unlocked && !medDone && lv === p.unlockedUpTo;

    // Item wrapper (alternates left/right for zigzag feel)
    const item = document.createElement('div');
    item.className = 'story-item ' + (i % 2 === 0 ? 'item-left' : 'item-right');

    // Node button
    const node = document.createElement('button');
    node.className = 'story-node ' + (
      !unlocked  ? 'node-locked'   :
      medDone    ? 'node-done'     :
      isCurrent  ? 'node-current'  : 'node-unlocked'
    );
    node.disabled = !unlocked;

    const starHtml = medDone  ? '<span class="node-star">★</span>'
                  : easyDone ? '<span class="node-star star-outline">☆</span>'
                  : '';

    node.innerHTML = !unlocked
      ? `<span class="node-icon">🔒</span><span class="node-num-sm">${lv}</span>`
      : `<span class="node-num">${lv}</span>${starHtml}`;

    if (unlocked && game.available) {
      node.addEventListener('click', () => _openLevelDetail(game));
    } else if (unlocked && !game.available) {
      node.title = 'Em breve';
      node.style.opacity = '0.55';
      node.disabled = true;
    }

    // Label
    const label = document.createElement('div');
    label.className = 'story-label' + (!unlocked ? ' label-locked' : '');
    label.textContent = game.name;
    if (!game.available && unlocked) {
      const badge = document.createElement('span');
      badge.className = 'story-soon-badge';
      badge.textContent = 'Em breve';
      label.appendChild(badge);
    }

    item.appendChild(node);
    item.appendChild(label);
    container.appendChild(item);

    // Connector between items (not after last)
    if (i < storyGames.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'story-connector' + (unlocked ? ' connector-active' : '');
      container.appendChild(conn);
    }
  });
}

// ── Modal: detalhe do nível ───────────────────────────────────
function _openLevelDetail(game) {
  _currentGame = game;
  _playAsDark  = false;

  const p       = loadProgress();
  const medDone  = p.completedMedium.includes(game.num);
  const easyDone = p.completedEasy.includes(game.num);

  document.getElementById('modal-lv-num').textContent    = game.num;
  document.getElementById('modal-lv-title').textContent  = game.name;
  document.getElementById('modal-lv-origin').textContent = game.origin ? `📍 ${game.origin}` : '';
  document.getElementById('modal-lv-desc').textContent   = game.description;
  document.getElementById('modal-lv-rules').textContent  = LEVEL_RULES[game.num] || '';

  const statusEl = document.getElementById('modal-lv-status');
  statusEl.innerHTML = medDone  ? '<span class="lv-badge badge-done">★ Concluído</span>'
                    : easyDone ? '<span class="lv-badge badge-easy">☆ Praticado</span>'
                    : '';

  // Reset piece choice to default (light)
  document.getElementById('piece-btn-light').classList.add('active');
  document.getElementById('piece-btn-dark').classList.remove('active');

  _openModal('modal-level-detail');
}

// ── Modal: inserir código ─────────────────────────────────────
function _openCodeModal() {
  document.getElementById('code-input').value = '';
  document.getElementById('code-error').style.display = 'none';
  _openModal('modal-code-entry');
}

// ── Helpers de modal ──────────────────────────────────────────
function _openModal(id) {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('visible'));
}

// ── Bind de botões ────────────────────────────────────────────
function _bindButtons() {
  // Intro: aceitar e entrar
  document.getElementById('btn-story-intro-ok').addEventListener('click', () => {
    localStorage.setItem('story_intro_seen', '1');
    closeAllModals();
    _renderMap();
    _showScreen('screen-story');
    requestAnimationFrame(_drawPath);
  });

  // Story screen: voltar à home
  document.getElementById('btn-story-back').addEventListener('click', () => {
    _showScreen('screen-home');
  });

  // Story screen: botão de código (cadeado)
  document.getElementById('btn-story-code').addEventListener('click', _openCodeModal);

  // Detalhe do nível: jogar fácil
  document.getElementById('btn-lv-easy').addEventListener('click', () => {
    if (!_currentGame) return;
    closeAllModals();
    _onPlayLevel(_currentGame, 'easy', _playAsDark);
  });

  // Detalhe do nível: jogar médio
  document.getElementById('btn-lv-medium').addEventListener('click', () => {
    if (!_currentGame) return;
    closeAllModals();
    _onPlayLevel(_currentGame, 'medium', _playAsDark);
  });

  document.getElementById('btn-lv-cancel').addEventListener('click', closeAllModals);

  // Escolha de peças
  document.getElementById('piece-btn-light').addEventListener('click', () => {
    _playAsDark = false;
    document.getElementById('piece-btn-light').classList.add('active');
    document.getElementById('piece-btn-dark').classList.remove('active');
  });
  document.getElementById('piece-btn-dark').addEventListener('click', () => {
    _playAsDark = true;
    document.getElementById('piece-btn-dark').classList.add('active');
    document.getElementById('piece-btn-light').classList.remove('active');
  });

  // Inserir código: confirmar
  document.getElementById('btn-code-submit').addEventListener('click', () => {
    const raw = document.getElementById('code-input').value;
    const lv  = applyCode(raw);
    if (lv === null) {
      document.getElementById('code-error').style.display = 'block';
    } else {
      closeAllModals();
      _renderMap();
      requestAnimationFrame(_drawPath);
      _flashMessage(`✓ Progresso até o nível ${lv} restaurado!`);
    }
  });

  document.getElementById('btn-code-cancel').addEventListener('click', closeAllModals);

  // Input de código: só letras/números, 4 chars
  document.getElementById('code-input').addEventListener('input', e => {
    const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
    e.target.value = v;
    document.getElementById('code-error').style.display = 'none';
  });
}

function _flashMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'story-flash';
  msg.textContent = text;
  document.getElementById('story-map').prepend(msg);
  setTimeout(() => msg.remove(), 3000);
}

// ── SVG path connecting nodes (Duolingo style) ────────────────
function _drawPath() {
  const scroll  = document.querySelector('.story-map-scroll');
  const mapEl   = document.getElementById('story-map');
  const nodes   = mapEl.querySelectorAll('.story-node');
  if (nodes.length < 2) return;

  // Remove previous SVG path overlay
  const old = mapEl.querySelector('.story-path-svg');
  if (old) old.remove();

  const mapRect   = mapEl.getBoundingClientRect();
  const scrollTop = scroll.scrollTop;

  // Collect node centers relative to story-map's top-left (where SVG top:0 left:0 is)
  const pts = [];
  nodes.forEach(node => {
    const r  = node.getBoundingClientRect();
    const cx = r.left - mapRect.left + r.width  / 2;
    const cy = r.top  - mapRect.top  + scrollTop + r.height / 2;
    const active = !node.classList.contains('node-locked');
    pts.push({ cx, cy, active });
  });

  const totalH = mapEl.scrollHeight;
  const totalW = mapEl.offsetWidth;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  svg.classList.add('story-path-svg');

  // Build a smooth bezier path through all node centers
  let d = `M ${pts[0].cx} ${pts[0].cy}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cy1  = prev.cy + (curr.cy - prev.cy) * 0.5;
    d += ` C ${prev.cx} ${cy1}, ${curr.cx} ${cy1}, ${curr.cx} ${curr.cy}`;
  }

  // Background (gray) path — always drawn full length
  const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathBg.setAttribute('d', d);
  pathBg.setAttribute('fill', 'none');
  pathBg.setAttribute('stroke', 'rgba(255,255,255,0.06)');
  pathBg.setAttribute('stroke-width', '10');
  pathBg.setAttribute('stroke-linecap', 'round');
  pathBg.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pathBg);

  // Active (colored) path — up to last unlocked node
  const lastActive = pts.reduce((acc, p, i) => p.active ? i : acc, -1);
  if (lastActive > 0) {
    let da = `M ${pts[0].cx} ${pts[0].cy}`;
    for (let i = 1; i <= lastActive; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cy1  = prev.cy + (curr.cy - prev.cy) * 0.5;
      da += ` C ${prev.cx} ${cy1}, ${curr.cx} ${cy1}, ${curr.cx} ${curr.cy}`;
    }
    const pathFg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathFg.setAttribute('d', da);
    pathFg.setAttribute('fill', 'none');
    pathFg.setAttribute('stroke', 'url(#pathGrad)');
    pathFg.setAttribute('stroke-width', '10');
    pathFg.setAttribute('stroke-linecap', 'round');
    pathFg.setAttribute('stroke-linejoin', 'round');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'pathGrad');
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
    grad.setAttribute('gradientUnits', 'objectBoundingBox');
    const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s1.setAttribute('offset', '0%');   s1.setAttribute('stop-color', '#7c3aed');
    const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#9d5cf7');
    grad.appendChild(s1); grad.appendChild(s2);
    defs.appendChild(grad);
    svg.insertBefore(defs, svg.firstChild);
    svg.appendChild(pathFg);
  }

  mapEl.insertBefore(svg, mapEl.firstChild);
}
