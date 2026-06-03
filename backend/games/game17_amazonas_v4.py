"""
Game 17 — Amazonas (V4)
"""
from games.amazonas_base import AmazonasBase


class AmazonasV4(AmazonasBase):
    @property
    def name(self) -> str:
        return "Amazonas (V4)"

    @property
    def description(self) -> str:
        return (
            "Comece com o tabuleiro vazio. Cada jogador coloca suas 2 peças "
            "alternadamente nas primeiras 4 jogadas. Depois, o jogo segue as "
            "regras normais de movimentação e bloqueio de Amazonas."
        )

    @property
    def pieces_per_player(self) -> int:
        return 2

    def get_initial_state(self) -> dict:
        return {
            "board": [0] * 9,
            "current_player": 1,
            "phase": "placement",
            "placed": {1: 0, 2: 0},
            "move_count": 0,
        }
