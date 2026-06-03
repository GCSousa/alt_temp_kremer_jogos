"""
Game 13 — Mu Torere (V3 — Original)
Original position. First 2 moves of each player can't go to center.

Converted from js/games/Game13.js
"""
from games.blocking_game_base import BlockingGameBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]

# P1 (white) forms Γ on right: 2,5,7,8 — P2 (dark) forms L on left: 0,1,3,6
INITIAL_BOARD = [2, 2, 1, 2, 0, 1, 2, 1, 1]


class MuTorereV3(BlockingGameBase):
    @property
    def name(self) -> str:
        return "Mu Torere (V3)"

    @property
    def description(self) -> str:
        return (
            "Posição inicial original. Nos primeiros 2 movimentos de cada "
            "jogador, não é permitido mover para o centro (b2). "
            "Quem não conseguir mover perde."
        )

    @property
    def origin(self) -> str:
        return "Nova Zelândia (Maori)"

    def get_initial_state(self) -> dict:
        return {
            "board": list(INITIAL_BOARD),
            "current_player": 1,
            "move_count": 0,
            "moves_p1": 0,
            "moves_p2": 0,
        }

    def apply_move(self, state: dict, move: dict) -> dict:
        if state["current_player"] == 1:
            state["moves_p1"] += 1
        else:
            state["moves_p2"] += 1
        state["board"][move["to"]] = state["board"][move["from"]]
        state["board"][move["from"]] = 0
        state["current_player"] = 3 - state["current_player"]
        state["move_count"] += 1
        return state

    def get_valid_moves(self, state: dict) -> list:
        player_moves = (state["moves_p1"] if state["current_player"] == 1
                        else state["moves_p2"])
        can_go_center = player_moves >= 2
        moves = []
        for from_pos in range(9):
            if state["board"][from_pos] != state["current_player"]:
                continue
            for to_pos in ADJACENCY[from_pos]:
                if state["board"][to_pos] != 0:
                    continue
                if not can_go_center and to_pos == 4:
                    continue
                moves.append({"from": from_pos, "to": to_pos})
        return moves
