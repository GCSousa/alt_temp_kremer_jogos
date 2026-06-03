"""
Game 6 — Colocação + Livre
Placement phase then free movement to any empty position.

Converted from js/games/Game6.js
"""
from games.placement_movement_base import PlacementMovementBase


class ColMaisLivre(PlacementMovementBase):
    @property
    def name(self) -> str:
        return "Colocação + Livre"

    @property
    def description(self) -> str:
        return (
            "Fase de colocação (3 peças cada), depois qualquer peça pode "
            "mover para qualquer posição vazia."
        )

    @property
    def origin(self) -> str | None:
        return None

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        return [i for i, v in enumerate(state["board"]) if v == 0]
