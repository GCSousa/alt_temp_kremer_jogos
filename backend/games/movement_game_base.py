"""
Base class for movement-only games (Games 2-5).
Pieces are pre-positioned. No placement phase.

Converted from js/games/MovementGameBase.js
"""
from engine.game_base import GameBase

WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]

# P1 at b3(1), a1(6), c1(8); P2 at a3(0), c3(2), b1(7); empty: a2(3), b2(4), c2(5)
INITIAL_BOARD = [2, 1, 2, 0, 0, 0, 1, 2, 1]

MAX_MOVES = 120


class MovementGameBase(GameBase):
    """Base for games where pieces are pre-positioned and only move."""

    @property
    def interaction_mode(self) -> str:
        return "movement"

    @property
    def board_config(self) -> dict:
        return {"type": "tapatan", "size": 3}

    def get_initial_state(self) -> dict:
        return {
            "board": list(INITIAL_BOARD),
            "current_player": 1,
            "move_count": 0,
        }

    def get_valid_moves(self, state: dict) -> list:
        moves = []
        for from_pos in range(9):
            if state["board"][from_pos] != state["current_player"]:
                continue
            for to_pos in self.get_destinations(from_pos, state):
                if state["board"][to_pos] == 0:
                    moves.append({"from": from_pos, "to": to_pos})
        return moves

    def apply_move(self, state: dict, move: dict) -> dict:
        from_pos = move["from"]
        to_pos = move["to"]
        state["board"][to_pos] = state["board"][from_pos]
        state["board"][from_pos] = 0
        state["current_player"] = 2 if state["current_player"] == 1 else 1
        state["move_count"] += 1
        return state

    def check_result(self, state: dict) -> dict:
        board = state["board"]
        for a, b, c in WIN_LINES:
            v = board[a]
            if v != 0 and v == board[b] == board[c]:
                return {"over": True, "winner": v, "line": [a, b, c]}
        if state["move_count"] >= MAX_MOVES:
            return {"over": True, "winner": 0, "line": None}
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        result = self.check_result(state)
        if not result["over"]:
            return 0
        if result["winner"] == 1:
            return 1000
        if result["winner"] == 2:
            return -1000
        return 0

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Subclasses must implement: return list of reachable position indices."""
        raise NotImplementedError("get_destinations() must be implemented by subclass")
