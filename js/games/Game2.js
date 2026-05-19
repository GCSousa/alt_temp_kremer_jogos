import { MovementGameBase } from './MovementGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

export class MovimentoLivre extends MovementGameBase {
  get name() { return 'Movimento Livre'; }
  get description() {
    return 'As peças já estão posicionadas. Em cada turno, mova qualquer uma das suas três peças para qualquer posição vazia do tabuleiro.';
  }
  get origin() { return null; }

  // Any empty cell is a valid destination
  getDestinations(pos, state) {
    return state.board.reduce((acc, v, i) => {
      if (v === 0) acc.push(i);
      return acc;
    }, []);
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { MovimentoLivre as GameClass };
