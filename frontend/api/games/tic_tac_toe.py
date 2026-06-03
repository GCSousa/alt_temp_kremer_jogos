"""
Game 1 — Jogo da Velha (Tic-Tac-Toe)
Tradicional mundial

Converted from js/games/TicTacToe.js
"""
from engine.game_base import GameBase

WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  # cols
    [0, 4, 8], [2, 4, 6],              # diagonals
]


class TicTacToe(GameBase):
    @property
    def name(self) -> str:
        return "Jogo da Velha"

    @property
    def description(self) -> str:
        return (
            "O clássico! Dois jogadores colocam peças alternadamente no "
            "tabuleiro 3×3. O primeiro a alinhar três peças em linha, "
            "coluna ou diagonal vence."
        )

    @property
    def origin(self) -> str:
        return "Tradicional mundial"

    @property
    def board_config(self) -> dict:
        return {"type": "grid3x3", "size": 3}

    def get_initial_state(self) -> dict:
        return {
            "board": [0] * 9,  # 0=empty, 1=P1, 2=P2
            "current_player": 1,
        }

    def get_valid_moves(self, state: dict) -> list:
        return [i for i, v in enumerate(state["board"]) if v == 0]

    def apply_move(self, state: dict, cell_index: int) -> dict:
        state["board"][cell_index] = state["current_player"]
        state["current_player"] = 2 if state["current_player"] == 1 else 1
        return state

    def check_result(self, state: dict) -> dict:
        board = state["board"]
        for a, b, c in WIN_LINES:
            v = board[a]
            if v != 0 and v == board[b] == board[c]:
                return {"over": True, "winner": v, "line": [a, b, c]}
        if all(c != 0 for c in board):
            return {"over": True, "winner": 0, "line": None}  # draw
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        result = self.check_result(state)
        if not result["over"]:
            return 0
        if result["winner"] == 1:
            return 1000
        if result["winner"] == 2:
            return -1000
        return 0  # draw
