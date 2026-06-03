"""
Game 15 — Amazonas (V2)
"""
from games.amazonas_base import AmazonasBase


class AmazonasV2(AmazonasBase):
    @property
    def name(self) -> str:
        return "Amazonas (V2)"

    @property
    def description(self) -> str:
        return (
            "Cada jogador começa com 2 peças pré-posicionadas. Escolha qual de suas "
            "duas peças mover e, em seguida, atire a flecha para bloquear uma casa livre. "
            "Quem não puder mover nenhuma de suas rainhas perde."
        )

    @property
    def pieces_per_player(self) -> int:
        return 2

    def get_initial_state(self) -> dict:
        return {
            "board": [1, 0, 1, 0, 0, 0, 2, 0, 2],  # P1 at 0 and 2, P2 at 6 and 8
            "current_player": 1,
            "phase": "movement",
            "placed": {1: 2, 2: 2},
            "move_count": 0,
        }
