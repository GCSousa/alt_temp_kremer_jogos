"""
Tests for all game implementations.
Verifies that each game's logic produces correct results.
"""
import sys
import os
import pytest

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from games.tic_tac_toe import TicTacToe
from games.game2_free_move import FreeMove
from games.game3_tapatan import Tapatan
from games.game4_shisima import Shisima
from games.game5_tsoro import TsoroYematatu
from games.game6_placement_free import ColMaisLivre
from games.game7_achi4 import Achi4
from games.game8_achi3 import Achi3
from games.game9_placement_center import ColMaisCentro
from games.game10_placement_jump import ColMaisSalto
from games.game11_mu_torere_v1 import MuTorereV1
from games.game12_mu_torere_v2 import MuTorereV2
from games.game13_mu_torere_v3 import MuTorereV3
from games.registry import get_game_class, GAMES
from engine.minimax_ai import MinimaxAI, DIFFICULTY
from utils.codes import generate_code, verify_code


# ─── TicTacToe Tests ──────────────────────────────────────────


class TestTicTacToe:
    def setup_method(self):
        self.game = TicTacToe()

    def test_initial_state(self):
        state = self.game.get_initial_state()
        assert state["board"] == [0] * 9
        assert state["current_player"] == 1

    def test_valid_moves_initial(self):
        state = self.game.get_initial_state()
        moves = self.game.get_valid_moves(state)
        assert len(moves) == 9
        assert set(moves) == set(range(9))

    def test_apply_move(self):
        state = self.game.get_initial_state()
        state = self.game.apply_move(state, 4)  # center
        assert state["board"][4] == 1
        assert state["current_player"] == 2

    def test_win_detection(self):
        state = self.game.get_initial_state()
        # P1 wins with top row
        for move in [0, 3, 1, 4, 2]:  # P1: 0,1,2 — P2: 3,4
            state = self.game.apply_move(self.game.clone_state(state), move)
        result = self.game.check_result(state)
        assert result["over"] is True
        assert result["winner"] == 1
        assert result["line"] == [0, 1, 2]

    def test_draw_detection(self):
        state = self.game.get_initial_state()
        # Classic draw: X O X / X X O / O X O
        moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]
        for m in moves:
            state = self.game.apply_move(self.game.clone_state(state), m)
        result = self.game.check_result(state)
        assert result["over"] is True
        assert result["winner"] == 0

    def test_evaluate_terminal(self):
        state = self.game.get_initial_state()
        for move in [0, 3, 1, 4, 2]:
            state = self.game.apply_move(self.game.clone_state(state), move)
        assert self.game.evaluate(state) == 1000


# ─── Movement Games Tests ─────────────────────────────────────


class TestMovementGames:
    def test_free_move_initial(self):
        game = FreeMove()
        state = game.get_initial_state()
        assert state["board"] == [2, 1, 2, 0, 0, 0, 1, 2, 1]
        moves = game.get_valid_moves(state)
        assert len(moves) > 0
        # P1 pieces are at 1, 6, 8 → each can move to 3 empty cells
        assert all(m["from"] in (1, 6, 8) for m in moves)

    def test_tapatan_adjacency(self):
        game = Tapatan()
        state = game.get_initial_state()
        moves = game.get_valid_moves(state)
        # Check that moves respect adjacency
        for m in moves:
            assert m["to"] in game.get_destinations(m["from"], state)

    def test_shisima_win_lines(self):
        """Shisima only counts lines through center."""
        game = Shisima()
        state = game.get_initial_state()
        # Manually set board where P1 has top row (0,1,2) — NOT a win in Shisima
        state["board"] = [1, 1, 1, 0, 0, 0, 2, 2, 2]
        result = game.check_result(state)
        # Top row [0,1,2] doesn't pass through center (4)
        assert result["over"] is False or result["winner"] == 0

    def test_tsoro_jump(self):
        game = TsoroYematatu()
        # Create a state where a jump is possible
        state = {"board": [0, 1, 2, 0, 2, 0, 1, 0, 1], "current_player": 1, "move_count": 0}
        dests = game.get_destinations(1, state)
        # Position 1 can jump over position 4 (occupied by 2) to position 7 (empty)
        assert 7 in dests


# ─── Placement+Movement Games Tests ───────────────────────────


class TestPlacementMovementGames:
    def test_placement_phase(self):
        game = ColMaisLivre()
        state = game.get_initial_state()
        assert state["phase"] == "placement"
        moves = game.get_valid_moves(state)
        assert len(moves) == 9  # all cells empty

    def test_transition_to_movement(self):
        game = ColMaisLivre()
        state = game.get_initial_state()
        # Place 3 pieces each (6 moves)
        for i in range(6):
            moves = game.get_valid_moves(state)
            state = game.apply_move(game.clone_state(state), moves[0])
        assert state["phase"] == "movement"

    def test_achi4_pieces_per_player(self):
        game = Achi4()
        assert game.pieces_per_player == 4

    def test_center_win_lines(self):
        game = ColMaisCentro()
        lines = game.get_win_lines()
        # All lines must pass through center (index 4)
        for line in lines:
            assert 4 in line


# ─── Blocking Games Tests ─────────────────────────────────────


class TestBlockingGames:
    def test_mu_torere_v1_initial(self):
        game = MuTorereV1()
        state = game.get_initial_state()
        assert state["board"] == [1, 2, 1, 2, 0, 2, 1, 2, 1]
        assert sum(1 for x in state["board"] if x == 1) == 4
        assert sum(1 for x in state["board"] if x == 2) == 4

    def test_mu_torere_v2_phases(self):
        game = MuTorereV2()
        state = game.get_initial_state()
        assert state["phase"] == "placement"
        # Place 4 each = 8 moves
        for _ in range(8):
            moves = game.get_valid_moves(state)
            state = game.apply_move(game.clone_state(state), moves[0])
        assert state["phase"] == "movement"

    def test_mu_torere_v3_center_restriction(self):
        game = MuTorereV3()
        state = game.get_initial_state()
        moves = game.get_valid_moves(state)
        # First 2 moves of P1 can't go to center (4)
        for m in moves:
            assert m["to"] != 4


# ─── Minimax AI Tests ─────────────────────────────────────────


class TestMinimaxAI:
    def test_ai_finds_winning_move(self):
        """AI should find the winning move when one exists."""
        game = TicTacToe()
        # P1 has 0 and 1, needs 2 to win
        state = {"board": [1, 1, 0, 2, 2, 0, 0, 0, 0], "current_player": 1}
        ai = MinimaxAI(game, max_depth=9, randomize=False)
        move = ai.get_best_move(state)
        assert move == 2  # Complete the top row

    def test_ai_blocks_opponent(self):
        """AI should block when opponent is about to win."""
        game = TicTacToe()
        # P2 has 0 and 1, P1 must block at 2
        state = {"board": [2, 2, 0, 1, 1, 0, 0, 0, 0], "current_player": 1}
        ai = MinimaxAI(game, max_depth=9, randomize=False)
        move = ai.get_best_move(state)
        assert move == 2  # Block P2's top row


# ─── Code Generation Tests ────────────────────────────────────


class TestCodes:
    def test_known_codes(self):
        """Verify codes match the documented values in CODES.md."""
        expected = {
            1: "9XLU", 2: "UWSK", 3: "WM7E", 4: "JQK8", 5: "Z7KN",
            6: "545B", 7: "X585", 8: "2E98", 9: "YYAP", 10: "GUAM",
            11: "5QJ7", 12: "GUT4", 13: "7K8A", 14: "QLFC", 15: "XMWW",
            16: "NX5T", 17: "77G2", 18: "J7WC", 19: "Y8CX", 20: "AFX2",
            21: "N53J",
        }
        for level, code in expected.items():
            assert generate_code(level) == code, f"Level {level}: expected {code}, got {generate_code(level)}"

    def test_verify_valid_code(self):
        for lv in range(1, 22):
            code = generate_code(lv)
            assert verify_code(code) == lv

    def test_verify_invalid_code(self):
        assert verify_code("ZZZZ") is None
        assert verify_code("") is None
        assert verify_code("AB") is None


# ─── Registry Tests ───────────────────────────────────────────


class TestRegistry:
    def test_all_available_games_have_class(self):
        for g in GAMES:
            if g["available"]:
                game = get_game_class(g["id"])
                assert game is not None
                assert game.name

    def test_unknown_game_raises(self):
        with pytest.raises(ValueError):
            get_game_class("nonexistent-game")


# ─── Amazonas Tests ───────────────────────────────────────────


class TestAmazonas:
    def test_amazonas_v1_initial_and_queen_moves(self):
        game = get_game_class("amazonas-1")
        state = game.get_initial_state()
        assert state["board"] == [1, 0, 0, 0, 0, 0, 0, 0, 2]
        
        # Test queen moves from pos 0:
        # horizontal: 1, 2
        # vertical: 3, 6
        # diagonal: 4, 8 (but 8 has opponent piece, so 8 is blocked, but 4 is open)
        moves = game.get_queen_moves(0, state["board"])
        assert set(moves) == {1, 2, 3, 6, 4}

    def test_amazonas_v2_moves(self):
        game = get_game_class("amazonas-2")
        state = game.get_initial_state()
        assert state["board"] == [1, 0, 1, 0, 0, 0, 2, 0, 2]
        
        # Get valid moves in movement phase (returns full moves {piece, to, arrowTo})
        moves = game.get_valid_moves(state)
        assert len(moves) > 0
        for m in moves:
            assert "piece" in m and "to" in m and "arrowTo" in m
            assert state["board"][m["piece"]] == 1
            assert state["board"][m["to"]] == 0 or m["to"] == m["piece"]
            # Arrow can be shot to any empty cell on the updated board (which includes the from position)

    def test_amazonas_v3_phases(self):
        game = get_game_class("amazonas-3")
        state = game.get_initial_state()
        assert state["phase"] == "placement"
        
        # Place P1 piece at 0
        state = game.apply_move(game.clone_state(state), 0)
        assert state["board"][0] == 1
        assert state["phase"] == "placement"
        
        # Place P2 piece at 8
        state = game.apply_move(game.clone_state(state), 8)
        assert state["board"][8] == 2
        # Phase should transition to movement after both place 1 piece
        assert state["phase"] == "movement"

    def test_amazonas_lose_condition(self):
        game = get_game_class("amazonas-1")
        # Block all neighbors of P1 (which starts at 0)
        # Neighbors of 0 are 1, 3, 4. Let's block them.
        state = {
            "board": [1, 3, 3, 3, 3, 0, 0, 0, 2],
            "current_player": 1,
            "phase": "movement",
            "move_count": 5
        }
        res = game.check_result(state)
        assert res["over"] is True
        assert res["winner"] == 2  # P2 wins because P1 has no moves


# ─── Desafios Tests ───────────────────────────────────────────


class TestDesafios:
    def test_desafio_tapatan_win(self):
        game = get_game_class("desafio-tapatan")
        state = game.get_initial_state()
        assert state["board"] == [1, 1, 1, 0, 0, 0, 2, 2, 2]
        
        # Manually swap board to target
        state["board"] = [2, 2, 2, 0, 0, 0, 1, 1, 1]
        res = game.check_result(state)
        assert res["over"] is True
        assert res["winner"] == 1

    def test_desafio_cavalo_v2_moves_and_win(self):
        game = get_game_class("desafio-cavalo-2")
        state = game.get_initial_state()
        assert state["board"] == [1, 0, 1, 0, 0, 0, 2, 0, 2]
        
        # From 0, knight can jump to 5 or 7. Both are empty (0).
        moves = game.get_valid_moves(state)
        assert any(m["from"] == 0 and m["to"] == 5 for m in moves)
        assert any(m["from"] == 0 and m["to"] == 7 for m in moves)
        
        # Check target state wins
        state["board"] = [2, 0, 2, 0, 0, 0, 1, 0, 1]
        res = game.check_result(state)
        assert res["over"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
