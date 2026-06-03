"""
Base class for two-phase placement→movement games (Games 6-10).

Converted from js/games/PlacementMovementBase.js
"""
from engine.game_base import GameBase

ALL_WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]


class PlacementMovementBase(GameBase):
    """Base for games with a placement phase followed by a movement phase."""

    @property
    def pieces_per_player(self) -> int:
        """Number of pieces each player places before movement starts."""
        return 3

    @property
    def interaction_mode(self) -> str:
        return "placement"

    def get_interaction_mode(self, state: dict) -> str:
        """Returns current phase: 'placement' or 'movement'."""
        return state["phase"]

    @property
    def board_config(self) -> dict:
        return {"type": "tapatan", "size": 3}

    def get_initial_state(self) -> dict:
        return {
            "board": [0] * 9,
            "current_player": 1,
            "phase": "placement",
            "placed": {1: 0, 2: 0},
            "move_count": 0,
        }

    def get_valid_moves(self, state: dict) -> list:
        if state["phase"] == "placement":
            return [i for i, v in enumerate(state["board"]) if v == 0]

        moves = []
        for from_pos in range(9):
            if state["board"][from_pos] != state["current_player"]:
                continue
            for to_pos in self.get_destinations(from_pos, state):
                if state["board"][to_pos] == 0:
                    moves.append({"from": from_pos, "to": to_pos})
        return moves

    def apply_move(self, state: dict, move) -> dict:
        if state["phase"] == "placement":
            # move is an int (cell index) during placement
            cell = move if isinstance(move, int) else move["to"]
            state["board"][cell] = state["current_player"]
            state["placed"][state["current_player"]] += 1
            state["current_player"] = 3 - state["current_player"]
            if (state["placed"][1] >= self.pieces_per_player
                    and state["placed"][2] >= self.pieces_per_player):
                state["phase"] = "movement"
        else:
            state["board"][move["to"]] = state["board"][move["from"]]
            state["board"][move["from"]] = 0
            state["current_player"] = 3 - state["current_player"]
            state["move_count"] += 1
        return state

    def check_result(self, state: dict) -> dict:
        board = state["board"]
        for a, b, c in self.get_win_lines():
            v = board[a]
            if v != 0 and v == board[b] == board[c]:
                return {"over": True, "winner": v, "line": [a, b, c]}
        if state["phase"] == "movement" and state["move_count"] >= 120:
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

    def get_win_lines(self) -> list:
        """Subclasses can override to restrict which lines count as wins."""
        return ALL_WIN_LINES

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Subclasses must implement movement destinations."""
        raise NotImplementedError("get_destinations() must be implemented by subclass")
