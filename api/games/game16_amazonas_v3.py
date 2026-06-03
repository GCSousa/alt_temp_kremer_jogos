"""
Game 16 — Amazonas (V3)
"""
from games.amazonas_base import AmazonasBase


class AmazonasV3(AmazonasBase):
    @property
    def name(self) -> str:
        return "Amazonas (V3)"

    @property
    def description(self) -> str:
        return (
            "Comece com o tabuleiro vazio. No primeiro turno, cada jogador coloca "
            "sua única peça em qualquer casa vazia. A partir do segundo turno, jogue "
            "movendo e bloqueando normalmente."
        )

    @property
    def pieces_per_player(self) -> int:
        return 1

    def get_initial_state(self) -> dict:
        return {
            "board": [0] * 9,
            "current_player": 1,
            "phase": "placement",
            "placed": {1: 0, 2: 0},
            "move_count": 0,
        }
