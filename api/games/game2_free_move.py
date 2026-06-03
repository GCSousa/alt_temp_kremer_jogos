"""
Game 2 — Movimento Livre (Free Movement)
Any piece can move to any empty position.

Converted from js/games/Game2.js
"""
from games.movement_game_base import MovementGameBase


class FreeMove(MovementGameBase):
    @property
    def name(self) -> str:
        return "Movimento Livre"

    @property
    def description(self) -> str:
        return (
            "As peças já estão posicionadas. Em cada turno, mova qualquer "
            "uma das suas três peças para qualquer posição vazia do tabuleiro."
        )

    @property
    def origin(self) -> str | None:
        return None

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        """Any empty cell is a valid destination."""
        return [i for i, v in enumerate(state["board"]) if v == 0]
