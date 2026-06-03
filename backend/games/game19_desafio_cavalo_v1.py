"""
Game 19 — Desafio: Cavalo (1)
"""
from engine.game_base import GameBase


class DesafioCavaloV1(GameBase):
    KNIGHT_ADJACENCY = {
        0: [5, 7],
        1: [6, 8],
        2: [3, 7],
        3: [2, 8],
        4: [],
        5: [0, 6],
        6: [1, 5],
        7: [0, 2],
        8: [1, 3],
    }

    @property
    def name(self) -> str:
        return "Desafio: Cavalo (1)"

    @property
    def description(self) -> str:
        return (
            "Troque as posições das duas peças usando o movimento do Cavalo do Xadrez. "
            "O centro do tabuleiro é inacessível para o cavalo."
        )

    @property
    def board_config(self) -> dict:
        return {"type": "tapatan", "size": 3}

    def get_interaction_mode(self, state: dict) -> str:
        return "movement"

    def get_initial_state(self) -> dict:
        return {
            "board": [1, 0, 0, 0, 0, 0, 0, 0, 2],  # P1 at 0, P2 at 8
            "current_player": 1,
            "phase": "movement",
            "move_count": 0,
        }

    def get_valid_moves(self, state: dict) -> list:
        moves = []
        board = state["board"]
        for from_pos in range(9):
            if board[from_pos] != 0:
                for to_pos in self.KNIGHT_ADJACENCY[from_pos]:
                    if board[to_pos] == 0:
                        moves.append({"from": from_pos, "to": to_pos})
        return moves

    def apply_move(self, state: dict, move) -> dict:
        from_pos = move["from"]
        to_pos = move["to"]
        state["board"][to_pos] = state["board"][from_pos]
        state["board"][from_pos] = 0
        state["move_count"] += 1
        state["current_player"] = 1
        return state

    def check_result(self, state: dict) -> dict:
        if state["board"] == [2, 0, 0, 0, 0, 0, 0, 0, 1]:
            return {"over": True, "winner": 1, "line": None}
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        return 0
