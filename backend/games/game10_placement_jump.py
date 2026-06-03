"""
Game 10 — Colocação + Salto
Placement then Tsoro-style movement (adjacent + jump).

Converted from js/games/Game10.js
"""
from games.placement_movement_base import PlacementMovementBase

ADJACENCY = [
    [1, 3, 4], [0, 2, 4], [1, 4, 5],
    [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
    [3, 4, 7], [4, 6, 8], [4, 5, 7],
]

# JUMPS[i] = [(mid, land), ...] — from i, jump over mid to land
BOARD_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]
JUMPS: list[list[tuple[int, int]]] = [[] for _ in range(9)]
for _a, _b, _c in BOARD_LINES:
    JUMPS[_a].append((_b, _c))
    JUMPS[_c].append((_b, _a))


class ColMaisSalto(PlacementMovementBase):
    @property
    def name(self) -> str:
        return "Colocação + Salto"

    @property
    def description(self) -> str:
        return (
            "Fase de colocação (3 peças cada), depois movimentação estilo "
            "Tsoro: mova para posição vizinha ou salte sobre qualquer peça "
            "para a posição vazia atrás dela."
        )

    @property
    def origin(self) -> str:
        return "Zimbábue"

    def get_destinations(self, pos: int, state: dict) -> list[int]:
        dests = set()
        board = state["board"]
        for adj in ADJACENCY[pos]:
            if board[adj] == 0:
                dests.add(adj)
        for mid, land in JUMPS[pos]:
            if board[mid] != 0 and board[land] == 0:
                dests.add(land)
        return list(dests)
