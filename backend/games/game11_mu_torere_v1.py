"""
Game 11 — Mu Torere (V1 — Alternado)
Pieces alternate around the board. Move to adjacent empty position.

Converted from js/games/Game11.js
"""
from games.blocking_game_base import BlockingGameBase

# P1 at corners (0,2,6,8), P2 at edges (1,3,5,7), center empty
INITIAL_BOARD = [1, 2, 1, 2, 0, 2, 1, 2, 1]


class MuTorereV1(BlockingGameBase):
    @property
    def name(self) -> str:
        return "Mu Torere (V1)"

    @property
    def description(self) -> str:
        return (
            "Peças alternadas nos 8 pontos externos. Mova para posição "
            "vizinha vazia. Quem não conseguir mover perde."
        )

    @property
    def origin(self) -> str:
        return "Nova Zelândia (Maori)"

    def get_initial_state(self) -> dict:
        return {
            "board": list(INITIAL_BOARD),
            "current_player": 1,
            "move_count": 0,
        }
