"""
Game 5 — Tsoro Yematatu
Adjacent moves + jump moves over occupied cells.

Converted from js/games/Game5.js
"""
from games.movement_game_base import MovementGameBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]

# JUMPS[i] = list of (intermediate, landing) pairs for position i
# Built from the 8 board lines: from each endpoint, jump over middle to far end
BOARD_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]

JUMPS: list[list[tuple[int, int]]] = [[] for _ in range(9)]
for _a, _b, _c in BOARD_LINES:
    JUMPS[_a].append((_b, _c))
    JUMPS[_c].append((_b, _a))
    # middle (_b) has no jump along this line


class TsoroYematatu(MovementGameBase):
    @property
    def name(self) -> str:
        return "Tsoro Yematatu"

    @property
    def description(self) -> str:
        return (
            "Além de mover para posições vizinhas, a peça pode saltar sobre "
            "qualquer peça adjacente (em linha), pousando na posição vazia seguinte."
        )

    @property
    def origin(self) -> str:
        return "Zimbábue"

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        dests = set()
        board = state["board"]
        # Adjacent moves (Tapatan-style)
        for adj in ADJACENCY[pos]:
            if board[adj] == 0:
                dests.add(adj)
        # Jump moves: over an occupied cell to an empty landing
        for mid, land in JUMPS[pos]:
            if board[mid] != 0 and board[land] == 0:
                dests.add(land)
        return list(dests)
