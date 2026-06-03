"""
Game 3 — Tapatan
Move to adjacent positions along board lines.

Converted from js/games/Game3.js
"""
from games.movement_game_base import MovementGameBase

ADJACENCY = [
    [1, 3, 4],                    # 0: top-left
    [0, 2, 4],                    # 1: top-center
    [1, 4, 5],                    # 2: top-right
    [0, 4, 6],                    # 3: mid-left
    [0, 1, 2, 3, 5, 6, 7, 8],    # 4: center (connects to all)
    [2, 4, 8],                    # 5: mid-right
    [3, 4, 7],                    # 6: bot-left
    [4, 6, 8],                    # 7: bot-center
    [4, 5, 7],                    # 8: bot-right
]


class Tapatan(MovementGameBase):
    @property
    def name(self) -> str:
        return "Tapatan"

    @property
    def description(self) -> str:
        return (
            "As peças já estão posicionadas. Cada peça pode mover apenas "
            "para posições vizinhas conectadas pelas linhas do tabuleiro."
        )

    @property
    def origin(self) -> str:
        return "Indonésia / Filipinas"

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Only adjacent positions (along board lines) are reachable."""
        return ADJACENCY[pos]
