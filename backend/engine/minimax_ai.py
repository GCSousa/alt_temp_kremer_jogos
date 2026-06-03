"""
Generic Minimax AI with Alpha-Beta pruning.
Works with any GameBase implementation.

Converted from js/engine/MinimaxAI.js
"""
import math
import random
from typing import Any

from engine.game_base import GameBase


# Difficulty presets
DIFFICULTY = {
    "easy":   {"depth": 1, "label": "Fácil",   "icon": "🌱", "randomize": True},
    "medium": {"depth": 3, "label": "Médio",   "icon": "⚡", "randomize": True},
    "hard":   {"depth": 9, "label": "Difícil", "icon": "💀", "randomize": False},
}


class MinimaxAI:
    """
    Alpha-beta minimax AI that works with any GameBase subclass.
    Player 1 maximizes, Player 2 minimizes.
    """

    def __init__(self, game: GameBase, max_depth: int, randomize: bool = True):
        self.game = game
        self.max_depth = max_depth
        self.randomize = randomize

    def get_best_move(self, state: dict) -> Any | None:
        """Returns the best move for the current player in the given state."""
        player = state["current_player"]
        maximizing = player == 1

        best_move = None
        best_score = -math.inf if maximizing else math.inf

        moves = self.game.get_valid_moves(state)
        if not moves:
            return None

        # Shuffle for variety (avoids always playing the same game at low depths)
        if self.randomize:
            moves = moves[:]
            random.shuffle(moves)

        for move in moves:
            next_state = self.game.apply_move(self.game.clone_state(state), move)
            score = self._minimax(
                next_state, self.max_depth - 1,
                -math.inf, math.inf,
                not maximizing,
            )

            if maximizing:
                if score > best_score:
                    best_score = score
                    best_move = move
            else:
                if score < best_score:
                    best_score = score
                    best_move = move

        return best_move

    def _minimax(
        self, state: dict, depth: int,
        alpha: float, beta: float, maximizing: bool,
    ) -> float:
        result = self.game.check_result(state)
        if result["over"] or depth == 0:
            return self.game.evaluate(state)

        moves = self.game.get_valid_moves(state)

        if maximizing:
            best = -math.inf
            for move in moves:
                next_state = self.game.apply_move(self.game.clone_state(state), move)
                best = max(best, self._minimax(next_state, depth - 1, alpha, beta, False))
                alpha = max(alpha, best)
                if beta <= alpha:
                    break  # beta cut-off
            return best
        else:
            best = math.inf
            for move in moves:
                next_state = self.game.apply_move(self.game.clone_state(state), move)
                best = min(best, self._minimax(next_state, depth - 1, alpha, beta, True))
                beta = min(beta, best)
                if beta <= alpha:
                    break  # alpha cut-off
            return best
