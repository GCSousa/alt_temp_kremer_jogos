"""
Game 8 — Achi (3 peças)
Placement then adjacent movement. 3 pieces per player.

Converted from js/games/Game8.js
"""
from games.placement_movement_base import PlacementMovementBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]


class Achi3(PlacementMovementBase):
    @property
    def name(self) -> str:
        return "Achi (3 peças)"

    @property
    def description(self) -> str:
        return (
            "Versão do Achi com 3 peças por jogador. Fase de colocação livre, "
            "depois movimentação pelas linhas do tabuleiro para posições vizinhas."
        )

    @property
    def origin(self) -> str:
        return "Gana"

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        return ADJACENCY[pos]
