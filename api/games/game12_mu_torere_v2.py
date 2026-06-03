"""
Game 12 — Mu Torere (V2 — Colocação + Movimentação)
Placement phase (4 pieces each), then movement. Blocking victory.

Converted from js/games/Game12.js
"""
from games.blocking_game_base import BlockingGameBase

PIECES_PER_PLAYER = 4


class MuTorereV2(BlockingGameBase):
    @property
    def name(self) -> str:
        return "Mu Torere (V2)"

    @property
    def description(self) -> str:
        return (
            "Fase de colocação: cada jogador posiciona suas 4 peças "
            "alternadamente. Depois, movimentação pelas linhas — "
            "quem não conseguir mover perde."
        )

    @property
    def origin(self) -> str:
        return "Nova Zelândia (Maori)"

    @property
    def interaction_mode(self) -> str:
        return "placement"

    def get_interaction_mode(self, state: dict) -> str:
        return state.get("phase", "movement")

    def get_initial_state(self) -> dict:
        return {
            "board": [0] * 9,
            "current_player": 1,
            "phase": "placement",
            "placed": {1: 0, 2: 0},
            "move_count": 0,
        }

    def get_valid_moves(self, state: dict) -> list:
        if state.get("phase") == "placement":
            return [i for i, v in enumerate(state["board"]) if v == 0]
        return super().get_valid_moves(state)

    def apply_move(self, state: dict, move) -> dict:
        if state.get("phase") == "placement":
            cell = move if isinstance(move, int) else move
            state["board"][cell] = state["current_player"]
            state["placed"][state["current_player"]] += 1
            state["current_player"] = 3 - state["current_player"]
            if (state["placed"][1] >= PIECES_PER_PLAYER
                    and state["placed"][2] >= PIECES_PER_PLAYER):
                state["phase"] = "movement"
            return state
        return super().apply_move(state, move)
