"""
Game 4 — Shisima
Like Tapatan, but only alignments through center count.

Converted from js/games/Game4.js
"""
from games.movement_game_base import MovementGameBase

# Only lines that pass through the center (b2 = index 4) count as wins
WIN_LINES_SHISIMA = [
    [3, 4, 5], [1, 4, 7],
    [0, 4, 8], [2, 4, 6],
]

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]


class Shisima(MovementGameBase):
    @property
    def name(self) -> str:
        return "Shisima"

    @property
    def description(self) -> str:
        return (
            "Como o Tapatan, mas só conta o alinhamento que passe "
            "pelo centro do tabuleiro (b2)."
        )

    @property
    def origin(self) -> str:
        return "Quênia"

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        return ADJACENCY[pos]

    def check_result(self, state: dict) -> dict:
        board = state["board"]
        for a, b, c in WIN_LINES_SHISIMA:
            v = board[a]
            if v != 0 and v == board[b] == board[c]:
                return {"over": True, "winner": v, "line": [a, b, c]}
        if state["move_count"] >= 120:
            return {"over": True, "winner": 0, "line": None}
        return {"over": False, "winner": None, "line": None}
