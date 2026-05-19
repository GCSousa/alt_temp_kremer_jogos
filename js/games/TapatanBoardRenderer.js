const NS = 'http://www.w3.org/2000/svg';
const SIZE = 300;
const MARGIN = 45;
const STEP = (SIZE - 2 * MARGIN) / 2; // 105

// Point [x, y] for each of the 9 board positions (row-major: a3..c1)
const PTS = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    PTS.push([MARGIN + c * STEP, MARGIN + r * STEP]);
  }
}

const BOARD_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // cols
  [0, 4, 8], [2, 4, 6],               // diagonals
];

const PIECE_R = 22;
const HIT_R   = 32;

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/**
 * Renders the Tapatan/movement board as an inline SVG element.
 *
 * @param {object} state          - game state { board, currentPlayer, moveCount }
 * @param {object} result         - { over, winner, line }
 * @param {function|null} onPositionClick - called with position index on click
 * @param {object} uiState        - { selectedPiece: number|null, validDests: number[] }
 * @returns {SVGSVGElement}
 */
export function renderTapatanBoard(state, result, onPositionClick, uiState = {}) {
  const { selectedPiece = null, validDests = [] } = uiState;

  const svg = el('svg', {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    class: 'ttt-board',
    xmlns: NS,
  });

  // ── Defs ──────────────────────────────────────────────────────
  const defs = document.createElementNS(NS, 'defs');

  const woodGrad = el('linearGradient', { id: 'tpWood', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  woodGrad.appendChild(Object.assign(el('stop', { offset: '0%' }), { }));
  woodGrad.children[0].setAttribute('stop-color', '#d4a568');
  const ws2 = el('stop', { offset: '100%' }); ws2.setAttribute('stop-color', '#b8843c');
  woodGrad.appendChild(ws2);
  defs.appendChild(woodGrad);

  const p1Grad = el('linearGradient', { id: 'tpP1', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  const p1s1 = el('stop', { offset: '0%' }); p1s1.setAttribute('stop-color', '#f8f8f8');
  const p1s2 = el('stop', { offset: '100%' }); p1s2.setAttribute('stop-color', '#c8c8c8');
  p1Grad.appendChild(p1s1); p1Grad.appendChild(p1s2);
  defs.appendChild(p1Grad);

  const p2Grad = el('linearGradient', { id: 'tpP2', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  const p2s1 = el('stop', { offset: '0%' }); p2s1.setAttribute('stop-color', '#484848');
  const p2s2 = el('stop', { offset: '100%' }); p2s2.setAttribute('stop-color', '#141414');
  p2Grad.appendChild(p2s1); p2Grad.appendChild(p2s2);
  defs.appendChild(p2Grad);

  const shadow = el('filter', { id: 'tpShadow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  const fds = el('feDropShadow', { dx: '0', dy: '2', stdDeviation: '3' });
  fds.setAttribute('flood-color', 'rgba(0,0,0,0.5)');
  shadow.appendChild(fds);
  defs.appendChild(shadow);

  svg.appendChild(defs);

  // ── Background ────────────────────────────────────────────────
  svg.appendChild(el('rect', { width: SIZE, height: SIZE, fill: 'url(#tpWood)', rx: '16' }));

  // ── Win-position highlights ───────────────────────────────────
  if (result.over && result.line) {
    const hlColor = result.winner === 1 ? 'rgba(220,220,220,0.22)' : 'rgba(50,50,50,0.38)';
    for (const idx of result.line) {
      const [cx, cy] = PTS[idx];
      svg.appendChild(el('circle', { cx, cy, r: PIECE_R + 12, fill: hlColor, class: 'cell-win-glow' }));
    }
  }

  // ── Board lines ───────────────────────────────────────────────
  for (const line of BOARD_LINES) {
    const [a, , c] = line;
    const [x1, y1] = PTS[a];
    const [x2, y2] = PTS[c];
    svg.appendChild(el('line', {
      x1, y1, x2, y2,
      stroke: '#5c3217',
      'stroke-width': '4',
      'stroke-linecap': 'round',
    }));
  }

  // ── Valid destination indicators ──────────────────────────────
  for (const idx of validDests) {
    const [cx, cy] = PTS[idx];
    svg.appendChild(el('circle', {
      cx, cy, r: 9,
      fill: 'rgba(255,255,255,0.25)',
      stroke: 'rgba(255,255,255,0.5)',
      'stroke-width': '2',
    }));
  }

  // ── Pieces ────────────────────────────────────────────────────
  for (let i = 0; i < 9; i++) {
    const v = state.board[i];
    if (v === 0) continue;
    const [cx, cy] = PTS[i];
    const isSelected = i === selectedPiece;
    const isWinner = result.over && result.line && result.line.includes(i);

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('filter', 'url(#tpShadow)');

    if (isSelected) {
      g.appendChild(el('circle', {
        cx, cy,
        r: PIECE_R + 7,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.6)',
        'stroke-width': '2.5',
        'stroke-dasharray': '5 3',
      }));
    }

    g.appendChild(el('circle', {
      cx, cy, r: PIECE_R,
      fill: v === 1 ? 'url(#tpP1)' : 'url(#tpP2)',
      stroke: v === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)',
      'stroke-width': '1.5',
    }));

    svg.appendChild(g);
  }

  // ── Win line ──────────────────────────────────────────────────
  if (result.over && result.line) {
    const [a, , c] = result.line;
    const [x1, y1] = PTS[a];
    const [x2, y2] = PTS[c];
    const wl = el('line', {
      x1, y1, x2, y2,
      stroke: result.winner === 1 ? '#f0f0f0' : '#888888',
      'stroke-width': '5',
      'stroke-linecap': 'round',
      class: 'win-line',
      opacity: '0.9',
    });
    svg.appendChild(wl);
  }

  // ── Click hit areas ───────────────────────────────────────────
  if (onPositionClick && !result.over) {
    for (let i = 0; i < 9; i++) {
      const [cx, cy] = PTS[i];
      const v = state.board[i];
      const isValidDest = validDests.includes(i);
      const isOwnPiece  = v === state.currentPlayer;
      const isSelected  = i === selectedPiece;
      const interactive = isOwnPiece || isValidDest || isSelected;

      const hit = el('circle', {
        cx, cy, r: HIT_R,
        fill: 'rgba(0,0,0,0)',
        'pointer-events': 'all',
      });
      hit.style.cursor = interactive ? 'pointer' : 'default';

      if (interactive) {
        hit.addEventListener('mouseenter', () => {
          if (isValidDest) {
            hit.setAttribute('fill', 'rgba(255,255,255,0.12)');
          } else if (isOwnPiece) {
            hit.setAttribute('fill', 'rgba(255,255,255,0.08)');
          }
        });
        hit.addEventListener('mouseleave', () => hit.setAttribute('fill', 'rgba(0,0,0,0)'));
        hit.addEventListener('click', () => onPositionClick(i));
      }

      svg.appendChild(hit);
    }
  }

  return svg;
}
