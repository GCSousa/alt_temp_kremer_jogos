"""
Base class for Amazonas games (Games 14-17).
"""
from abc import abstractmethod
from engine.game_base import GameBase


class AmazonasBase(GameBase):
    @property
    def board_config(self) -> dict:
        return {"type": "amazonas", "size": 3}

    @property
    @abstractmethod
    def pieces_per_player(self) -> int:
        pass

    def get_interaction_mode(self, state: dict) -> str:
        return state["phase"]

    def get_queen_moves(self, pos: int, board: list[int]) -> list[int]:
        RAYS = {
            0: [[1, 2], [3, 6], [4, 8]],
            1: [[0], [2], [4, 7]],
            2: [[1, 0], [5, 8], [4, 6]],
            3: [[0], [6], [4, 5]],
            4: [[3], [5], [1], [7], [0], [8], [2], [6]],
            5: [[4, 3], [2], [8]],
            6: [[7, 8], [3, 0], [4, 2]],
            7: [[6], [8], [4, 1]],
            8: [[7, 6], [5, 2], [4, 0]]
        }
        
        moves = []
        for ray in RAYS.get(pos, []):
            for dest in ray:
                if board[dest] == 0:
                    moves.append(dest)
                else:
                    break
        return moves

    def get_valid_moves(self, state: dict) -> list:
        if state["phase"] == "placement":
            return [i for i, v in enumerate(state["board"]) if v == 0]
            
        moves = []
        board = state["board"]
        current_player = state["current_player"]
        for from_pos in range(9):
            if board[from_pos] == current_player:
                dests = self.get_queen_moves(from_pos, board)
                for to_pos in dests:
                    temp_board = list(board)
                    temp_board[from_pos] = 0
                    temp_board[to_pos] = current_player
                    
                    arrows = self.get_queen_moves(to_pos, temp_board)
                    for arrow_pos in arrows:
                        moves.append({
                            "piece": from_pos,
                            "to": to_pos,
                            "arrowTo": arrow_pos
                        })
        return moves

    def apply_move(self, state: dict, move) -> dict:
        if state["phase"] == "placement":
            cell = move if isinstance(move, int) else move["to"]
            state["board"][cell] = state["current_player"]
            state["placed"][state["current_player"]] += 1
            state["current_player"] = 3 - state["current_player"]
            if (state["placed"][1] >= self.pieces_per_player
                    and state["placed"][2] >= self.pieces_per_player):
                state["phase"] = "movement"
        else:
            from_pos = move["piece"]
            to_pos = move["to"]
            arrow_pos = move["arrowTo"]
            
            state["board"][to_pos] = state["board"][from_pos]
            state["board"][from_pos] = 0
            state["board"][arrow_pos] = 3
            
            state["current_player"] = 3 - state["current_player"]
            state["move_count"] += 1
        return state

    def check_result(self, state: dict) -> dict:
        if state["phase"] == "placement":
            return {"over": False, "winner": None, "line": None}
            
        valid = self.get_valid_moves(state)
        if len(valid) == 0:
            winner = 3 - state["current_player"]
            return {"over": True, "winner": winner, "line": None}
            
        if state["move_count"] >= 120:
            return {"over": True, "winner": 0, "line": None}
            
        return {"over": False, "winner": None, "line": None}

    def evaluate(self, state: dict) -> int:
        result = self.check_result(state)
        if result["over"]:
            if result["winner"] == 1:
                return 1000
            elif result["winner"] == 2:
                return -1000
            else:
                return 0
                
        p1_moves = 0
        p2_moves = 0
        board = state["board"]
        for pos in range(9):
            if board[pos] == 1:
                p1_moves += len(self.get_queen_moves(pos, board))
            elif board[pos] == 2:
                p2_moves += len(self.get_queen_moves(pos, board))
        return (p1_moves - p2_moves) * 10
