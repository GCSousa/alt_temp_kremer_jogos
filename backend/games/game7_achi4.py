"""
Game 7 — Achi (4 peças)
Placement then adjacent movement. 4 pieces per player.

Converted from js/games/Game7.js
"""
from games.placement_movement_base import PlacementMovementBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]


class Achi4(PlacementMovementBase):
    @property
    def name(self) -> str:
        return "Achi (4 peças)"

    @property
    def description(self) -> str:
        return (
            "Cada jogador coloca 4 peças alternadamente, depois move pelas "
            "linhas do tabuleiro para posições vizinhas. Com 8 peças em 9 "
            "posições, cada movimento é muito restrito."
        )

    @property
    def origin(self) -> str:
        return "Gana"

    @property
    def pieces_per_player(self) -> int:
        return 4

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        return ADJACENCY[pos]
