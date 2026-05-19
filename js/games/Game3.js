import { MovementGameBase } from './MovementGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

// Neighbors reachable in one step along the 8 board lines.
// Lines: rows [0-1-2],[3-4-5],[6-7-8]; cols [0-3-6],[1-4-7],[2-5-8]; diags [0-4-8],[2-4-6]
const ADJACENCY = [
  [1, 3, 4],                   // 0: top-left
  [0, 2, 4],                   // 1: top-center
  [1, 4, 5],                   // 2: top-right
  [0, 4, 6],                   // 3: mid-left
  [0, 1, 2, 3, 5, 6, 7, 8],   // 4: center (connects to all)
  [2, 4, 8],                   // 5: mid-right
  [3, 4, 7],                   // 6: bot-left
  [4, 6, 8],                   // 7: bot-center
  [4, 5, 7],                   // 8: bot-right
];

export class Tapatan extends MovementGameBase {
  get name() { return 'Tapatan'; }
  get description() {
    return 'As peças já estão posicionadas. Cada peça pode mover apenas para posições vizinhas conectadas pelas linhas do tabuleiro.';
  }
  get origin() { return 'Indonésia / Filipinas'; }

  // Only adjacent positions (along board lines) are reachable
  getDestinations(pos, state) {
    return ADJACENCY[pos];
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { Tapatan as GameClass };
