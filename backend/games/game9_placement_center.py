"""
Game 9 — Colocação + Centro
Placement then free movement, but only center-passing alignments win.

Converted from js/games/Game9.js
"""
from games.placement_movement_base import PlacementMovementBase

# Only lines through the center (b2 = index 4) count as wins
CENTER_WIN_LINES = [
    [3, 4, 5], [1, 4, 7],
    [0, 4, 8], [2, 4, 6],
]


class ColMaisCentro(PlacementMovementBase):
    @property
    def name(self) -> str:
        return "Colocação + Centro"

    @property
    def description(self) -> str:
        return (
            "Fase de colocação (3 peças cada), depois movimentação livre — "
            "mas o alinhamento vencedor deve passar pelo centro do tabuleiro (b2)."
        )

    @property
    def origin(self) -> str | None:
        return None

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Free movement — any empty position."""
        return [i for i, v in enumerate(state["board"]) if v == 0]

    def get_win_lines(self) -> list:
        return CENTER_WIN_LINES
