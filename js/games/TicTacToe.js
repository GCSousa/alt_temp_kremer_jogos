import { GameBase } from '../engine/GameBase.js';

/**
 * Win-line combinations for a 3×3 grid.
 * Indices: 0 1 2 / 3 4 5 / 6 7 8
 */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export class TicTacToe extends GameBase {
  get name() { return 'Jogo da Velha'; }
  get description() {
    return 'O clássico! Dois jogadores colocam peças alternadamente no tabuleiro 3×3. O primeiro a alinhar três peças em linha, coluna ou diagonal vence.';
  }
  get origin() { return 'Tradicional mundial'; }

  get boardConfig() {
    return { type: 'grid3x3', size: 3 };
  }

  getInitialState() {
    return {
      board: Array(9).fill(0), // 0=empty, 1=P1, 2=P2
      currentPlayer: 1,
    };
  }

  getValidMoves(state) {
    return state.board.reduce((acc, val, i) => {
      if (val === 0) acc.push(i);
      return acc;
    }, []);
  }

  applyMove(state, cellIndex) {
    state.board[cellIndex] = state.currentPlayer;
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    return state;
  }

  checkResult(state) {
    for (const [a, b, c] of WIN_LINES) {
      const v = state.board[a];
      if (v !== 0 && v === state.board[b] && v === state.board[c]) {
        return { over: true, winner: v, line: [a, b, c] };
      }
    }
    if (state.board.every(c => c !== 0)) {
      return { over: true, winner: 0, line: null }; // draw
    }
    return { over: false, winner: null, line: null };
  }

  evaluate(state) {
    const result = this.checkResult(state);
    if (!result.over) return 0;
    if (result.winner === 1) return 1000;
    if (result.winner === 2) return -1000;
    return 0; // draw
  }
}

/**
 * Renders the TicTacToe board as an inline SVG element.
 * Returns the SVG string; the caller inserts it into the DOM.
 *
 * @param {object} state    - current game state
 * @param {object} result   - result from checkResult()
 * @param {boolean} isP1Human - whether player 1 is human
 * @param {boolean} isP2Human - whether player 2 is human
 * @returns {SVGSVGElement}
 */
export function renderTicTacToeBoard(state, result, onCellClick) {
  const NS = 'http://www.w3.org/2000/svg';
  const SIZE = 300;
  const CELL = SIZE / 3;
  const PAD = 18;
  const PIECE_SCALE = 0.55; // ratio of piece size to cell

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('class', 'ttt-board');
  svg.setAttribute('xmlns', NS);

  // --- Background ---
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', SIZE);
  bg.setAttribute('height', SIZE);
  bg.setAttribute('fill', 'url(#woodGrad)');
  bg.setAttribute('rx', '16');

  // --- Defs (gradients, filters) ---
  const defs = document.createElementNS(NS, 'defs');

  // Wood gradient
  const grad = document.createElementNS(NS, 'linearGradient');
  grad.setAttribute('id', 'woodGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
  const s1 = document.createElementNS(NS, 'stop');
  s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#d4a568');
  const s2 = document.createElementNS(NS, 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#b8843c');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);

  // P1 gradient
  const g1 = document.createElementNS(NS, 'linearGradient');
  g1.setAttribute('id', 'p1Grad');
  g1.setAttribute('x1', '0%'); g1.setAttribute('y1', '0%');
  g1.setAttribute('x2', '100%'); g1.setAttribute('y2', '100%');
  const g1s1 = document.createElementNS(NS, 'stop');
  g1s1.setAttribute('offset', '0%'); g1s1.setAttribute('stop-color', '#f5f5f5');
  const g1s2 = document.createElementNS(NS, 'stop');
  g1s2.setAttribute('offset', '100%'); g1s2.setAttribute('stop-color', '#c0c0c0');
  g1.appendChild(g1s1); g1.appendChild(g1s2);
  defs.appendChild(g1);

  // P2 gradient
  const g2 = document.createElementNS(NS, 'linearGradient');
  g2.setAttribute('id', 'p2Grad');
  g2.setAttribute('x1', '0%'); g2.setAttribute('y1', '0%');
  g2.setAttribute('x2', '100%'); g2.setAttribute('y2', '100%');
  const g2s1 = document.createElementNS(NS, 'stop');
  g2s1.setAttribute('offset', '0%'); g2s1.setAttribute('stop-color', '#585858');
  const g2s2 = document.createElementNS(NS, 'stop');
  g2s2.setAttribute('offset', '100%'); g2s2.setAttribute('stop-color', '#1c1c1c');
  g2.appendChild(g2s1); g2.appendChild(g2s2);
  defs.appendChild(g2);

  // Drop shadow filter
  const filter = document.createElementNS(NS, 'filter');
  filter.setAttribute('id', 'shadow');
  filter.setAttribute('x', '-20%'); filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%'); filter.setAttribute('height', '140%');
  const fe = document.createElementNS(NS, 'feDropShadow');
  fe.setAttribute('dx', '0'); fe.setAttribute('dy', '3');
  fe.setAttribute('stdDeviation', '3');
  fe.setAttribute('flood-color', 'rgba(0,0,0,0.4)');
  filter.appendChild(fe);
  defs.appendChild(filter);

  svg.appendChild(defs);
  svg.appendChild(bg);

  // --- Win cell highlights ---
  if (result.over && result.line) {
    const colors = { 1: 'rgba(220,220,220,0.2)', 2: 'rgba(60,60,60,0.35)' };
    for (const idx of result.line) {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const hl = document.createElementNS(NS, 'rect');
      hl.setAttribute('x', col * CELL);
      hl.setAttribute('y', row * CELL);
      hl.setAttribute('width', CELL);
      hl.setAttribute('height', CELL);
      hl.setAttribute('fill', colors[result.winner] || 'rgba(245,166,35,0.2)');
      hl.setAttribute('class', 'cell-win-glow');
      svg.appendChild(hl);
    }
  }

  // --- Board lines ---
  const lineColor = '#5c3217';
  const lineW = 5;
  const capR = 'round';

  for (let i = 1; i < 3; i++) {
    // Vertical
    const vl = document.createElementNS(NS, 'line');
    vl.setAttribute('x1', i * CELL); vl.setAttribute('y1', PAD);
    vl.setAttribute('x2', i * CELL); vl.setAttribute('y2', SIZE - PAD);
    vl.setAttribute('stroke', lineColor);
    vl.setAttribute('stroke-width', lineW);
    vl.setAttribute('stroke-linecap', capR);
    svg.appendChild(vl);

    // Horizontal
    const hl = document.createElementNS(NS, 'line');
    hl.setAttribute('x1', PAD);     hl.setAttribute('y1', i * CELL);
    hl.setAttribute('x2', SIZE - PAD); hl.setAttribute('y2', i * CELL);
    hl.setAttribute('stroke', lineColor);
    hl.setAttribute('stroke-width', lineW);
    hl.setAttribute('stroke-linecap', capR);
    svg.appendChild(hl);
  }

  // --- Pieces ---
  const pieceR = CELL * PIECE_SCALE;
  const strokeW = 8;

  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = col * CELL + CELL / 2;
    const cy = row * CELL + CELL / 2;
    const v = state.board[i];

    if (v === 1) {
      // X piece
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'piece-x');
      g.setAttribute('filter', 'url(#shadow)');

      const arm = pieceR * 0.42;
      const l1 = document.createElementNS(NS, 'line');
      l1.setAttribute('x1', cx - arm); l1.setAttribute('y1', cy - arm);
      l1.setAttribute('x2', cx + arm); l1.setAttribute('y2', cy + arm);
      l1.setAttribute('stroke', 'url(#p1Grad)');
      l1.setAttribute('stroke-width', strokeW);
      l1.setAttribute('stroke-linecap', 'round');

      const l2 = document.createElementNS(NS, 'line');
      l2.setAttribute('x1', cx + arm); l2.setAttribute('y1', cy - arm);
      l2.setAttribute('x2', cx - arm); l2.setAttribute('y2', cy + arm);
      l2.setAttribute('stroke', 'url(#p1Grad)');
      l2.setAttribute('stroke-width', strokeW);
      l2.setAttribute('stroke-linecap', 'round');

      g.appendChild(l1); g.appendChild(l2);
      svg.appendChild(g);

    } else if (v === 2) {
      // O piece
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'piece-o');
      g.setAttribute('filter', 'url(#shadow)');

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
      circle.setAttribute('r', pieceR * 0.40);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'url(#p2Grad)');
      circle.setAttribute('stroke-width', strokeW);

      g.appendChild(circle);
      svg.appendChild(g);

    } else if (!result.over && onCellClick) {
      // Clickable empty cell — single rect with JS hover
      const cellRect = document.createElementNS(NS, 'rect');
      cellRect.setAttribute('x', col * CELL + 4);
      cellRect.setAttribute('y', row * CELL + 4);
      cellRect.setAttribute('width', CELL - 8);
      cellRect.setAttribute('height', CELL - 8);
      cellRect.setAttribute('fill', 'rgba(0,0,0,0)');
      cellRect.setAttribute('rx', '10');
      cellRect.setAttribute('pointer-events', 'all');
      cellRect.style.cursor = 'pointer';
      cellRect.style.transition = 'fill 0.15s';

      cellRect.addEventListener('mouseenter', () => {
        cellRect.setAttribute('fill', 'rgba(255,255,255,0.09)');
      });
      cellRect.addEventListener('mouseleave', () => {
        cellRect.setAttribute('fill', 'rgba(0,0,0,0)');
      });
      cellRect.addEventListener('click', () => onCellClick(i));

      svg.appendChild(cellRect);
    }
  }

  // --- Win line overlay ---
  if (result.over && result.line) {
    const [a, b, c] = result.line;
    const getCenter = idx => ({
      x: (idx % 3) * CELL + CELL / 2,
      y: Math.floor(idx / 3) * CELL + CELL / 2,
    });
    const pa = getCenter(a);
    const pc = getCenter(c);

    const wl = document.createElementNS(NS, 'line');
    wl.setAttribute('x1', pa.x); wl.setAttribute('y1', pa.y);
    wl.setAttribute('x2', pc.x); wl.setAttribute('y2', pc.y);
    wl.setAttribute('stroke', result.winner === 1 ? '#f0f0f0' : '#888888');
    wl.setAttribute('stroke-width', '6');
    wl.setAttribute('stroke-linecap', 'round');
    wl.setAttribute('class', 'win-line');
    wl.setAttribute('opacity', '0.85');
    svg.appendChild(wl);
  }

  return svg;
}

// Named exports expected by app.js
export { TicTacToe as GameClass, renderTicTacToeBoard as renderBoard };
