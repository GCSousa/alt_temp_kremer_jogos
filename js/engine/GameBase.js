/**
 * Abstract base class for all board games.
 * Every game must extend this and implement the required methods.
 */
export class GameBase {
  /** @returns {string} Human-readable game name */
  get name() { throw new Error('Not implemented: name'); }

  /** @returns {string} Brief game description in Portuguese */
  get description() { throw new Error('Not implemented: description'); }

  /** @returns {string|null} Country/culture of origin */
  get origin() { return null; }

  /**
   * Board configuration used by the renderer.
   * Must return an object with at least { type: string }.
   */
  get boardConfig() { throw new Error('Not implemented: boardConfig'); }

  /**
   * Returns the initial game state object.
   * State must always include { currentPlayer: 1|2 }.
   */
  getInitialState() { throw new Error('Not implemented: getInitialState'); }

  /**
   * Returns an array of valid moves for the current state.
   * A "move" can be any serializable value (index, object, etc.)
   */
  getValidMoves(state) { throw new Error('Not implemented: getValidMoves'); }

  /**
   * Applies a move to a state and returns the new state.
   * IMPORTANT: mutates and returns the given state object.
   * Callers should cloneState() first if they need immutability.
   */
  applyMove(state, move) { throw new Error('Not implemented: applyMove'); }

  /**
   * Checks the game result.
   * @returns {{ over: boolean, winner: 1|2|0|null, line: any }}
   *   winner: 1=P1 wins, 2=P2 wins, 0=draw, null=game ongoing
   *   line: winning line data for rendering (game-specific), or null
   */
  checkResult(state) { throw new Error('Not implemented: checkResult'); }

  /**
   * Heuristic evaluation of a state for minimax.
   * Positive scores favor player 1, negative favor player 2.
   * Terminal states should return large values (e.g., ±1000).
   */
  evaluate(state) { throw new Error('Not implemented: evaluate'); }

  /**
   * Deep clone a state. Override for performance if needed.
   */
  cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }
}
