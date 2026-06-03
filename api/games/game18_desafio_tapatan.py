"""
Game 18 — Desafio: Troca de Lado (Tapatan)
"""
from engine.game_base import GameBase


class DesafioTapatan(GameBase):
    ADJACENCY = {
        0: [1, 3, 4],
        1: [0, 2, 4],
        2: [1, 4, 5],
        3: [0, 4, 6],
        4: [0, 1, 2, 3, 5, 6, 7, 8],
        5: [2, 4, 8],
        6: [3, 4, 7],
        7: [4, 6, 8],
        8: [4, 5, 7],
    }

    @property
    def name(self) -> str:
        return "Desafio: Troca de Lado"

    @property
    def description(self) -> str:
        return (
            "Troque as peças de lado no menor número de movimentos. "
            "Movimentos permitidos pelas linhas do Tapatan."
        )

    @property
    def board_config(self) -> dict:
        return {"type": "tapatan", "size": 3}

    def get_interaction_mode(self, state: dict) -> str:
        return "movement"

    def get_initial_state(self) -> dict:
        return {
            "board": [1, 1, 1, 0, 0, 0, 2, 2, 2],  # P1 at top row, P2 at bottom row
            "current_player": 1,
            "phase": "movement",
            "move_count": 0,
        }

    def get_valid_moves(self, state: dict) -> list:
        moves = []
        board = state["board"]
        for from_pos in range(9):
            if board[from_pos] != 0:
                for to_pos in self.ADJACENCY[from_pos]:
                    if board[to_pos] == 0:
                        moves.append({"from": from_pos, "to": to_pos})
        return moves

    def apply_move(self, state: dict, move) -> dict:
        from_pos = move["from"]
        to_pos = move["to"]
        state["board"][to_pos] = state["board"][from_pos]
        state["board"][from_pos] = 0
        state["move_count"] += 1
        # In a single-player challenge, current_player stays 1
        state["current_player"] = 1
        return state

    def check_result(self, state: dict) -> dict:
        # Win condition: P1 and P2 swapped positions
        if state["board"] == [2, 2, 2, 0, 0, 0, 1, 1, 1]:
            return {"over": True, "winner": 1, "line": None}
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        return 0
