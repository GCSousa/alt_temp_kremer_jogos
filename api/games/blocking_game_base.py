"""
Base class for blocking games (Games 11-13, Mu Torere).
Objective: block the opponent — whoever can't move loses.

Converted from js/games/BlockingGameBase.js
"""
from engine.game_base import GameBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]


class BlockingGameBase(GameBase):
    """Base for blocking games where whoever can't move loses."""

    @property
    def interaction_mode(self) -> str:
        return "movement"

    @property
    def board_config(self) -> dict:
        return {"type": "tapatan", "size": 3}

    def get_initial_state(self) -> dict:
        return {
            # P1 at corners, P2 at edges, center empty
            "board": [1, 2, 1, 2, 0, 2, 1, 2, 1],
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
        state["board"][move["to"]] = state["board"][move["from"]]
        state["board"][move["from"]] = 0
        state["current_player"] = 3 - state["current_player"]
        state["move_count"] += 1
        return state

    def check_result(self, state: dict) -> dict:
        """Whoever has no moves loses."""
        if len(self.get_valid_moves(state)) == 0:
            return {"over": True, "winner": 3 - state["current_player"], "line": None}
        if state["move_count"] >= 200:
            return {"over": True, "winner": 0, "line": None}
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        result = self.check_result(state)
        if result["over"]:
            if result["winner"] == 1:
                return 1000
            if result["winner"] == 2:
                return -1000
            return 0
        # Mobility heuristic: more available moves = better position
        def count_moves(player: int) -> int:
            n = 0
            for from_pos in range(9):
                if state["board"][from_pos] != player:
                    continue
                for to_pos in self.get_destinations(from_pos, state):
                    if state["board"][to_pos] == 0:
                        n += 1
            return n
        return count_moves(1) - count_moves(2)

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Default: Tapatan adjacency. Subclasses may override."""
        return ADJACENCY[pos]
