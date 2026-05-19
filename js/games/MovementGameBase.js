import { GameBase } from '../engine/GameBase.js';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// P1 at b3(1), a1(6), c1(8); P2 at a3(0), c3(2), b1(7); empty: a2(3), b2(4), c2(5)
const INITIAL_BOARD = [2, 1, 2, 0, 0, 0, 1, 2, 1];

const MAX_MOVES = 120;

export class MovementGameBase extends GameBase {
  get interactionMode() { return 'movement'; }

  get boardConfig() { return { type: 'tapatan', size: 3 }; }

  getInitialState() {
    return {
      board: [...INITIAL_BOARD],
      currentPlayer: 1,
      moveCount: 0,
    };
  }

  getValidMoves(state) {
    const moves = [];
    for (let from = 0; from < 9; from++) {
      if (state.board[from] !== state.currentPlayer) continue;
      for (const to of this.getDestinations(from, state)) {
        if (state.board[to] === 0) moves.push({ from, to });
      }
    }
    return moves;
  }

  applyMove(state, { from, to }) {
    state.board[to] = state.board[from];
    state.board[from] = 0;
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    state.moveCount++;
    return state;
  }

  checkResult(state) {
    for (const [a, b, c] of WIN_LINES) {
      const v = state.board[a];
      if (v !== 0 && v === state.board[b] && v === state.board[c]) {
        return { over: true, winner: v, line: [a, b, c] };
      }
    }
    if (state.moveCount >= MAX_MOVES) {
      return { over: true, winner: 0, line: null };
    }
    return { over: false, winner: null, line: null };
  }

  evaluate(state) {
    const result = this.checkResult(state);
    if (!result.over) return 0;
    if (result.winner === 1) return 1000;
    if (result.winner === 2) return -1000;
    return 0;
  }

  // Subclasses implement: return array of position indices this piece can reach
  getDestinations(pos, state) {
    throw new Error('getDestinations() must be implemented by subclass');
  }
}
