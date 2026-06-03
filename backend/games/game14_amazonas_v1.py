"""
Game 14 — Amazonas (V1)
"""
from games.amazonas_base import AmazonasBase


class AmazonasV1(AmazonasBase):
    @property
    def name(self) -> str:
        return "Amazonas (V1)"

    @property
    def description(self) -> str:
        return (
            "Cada jogador tem 1 peça (rainha) no tabuleiro. Mova sua peça em linha reta "
            "por qualquer distância e, de onde parar, atire uma flecha para bloquear "
            "permanentemente qualquer casa livre. Quem não puder se mover perde."
        )

    @property
    def pieces_per_player(self) -> int:
        return 1

    def get_initial_state(self) -> dict:
        return {
            "board": [1, 0, 0, 0, 0, 0, 0, 0, 2],  # P1 at 0, P2 at 8
            "current_player": 1,
            "phase": "movement",
            "placed": {1: 1, 2: 1},
            "move_count": 0,
        }
