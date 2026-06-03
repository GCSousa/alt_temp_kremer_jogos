"""
Flask API — 21 Jogos Lógicos no Mesmo Tabuleiro

Stateless REST API. Game state travels in the request body.
All game logic runs in Python (engine + games packages).
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from flask import Flask, jsonify, request
from flask_cors import CORS

from games.registry import GAMES, BONUS_GAMES, CATEGORIES, get_game_class
from engine.minimax_ai import MinimaxAI, DIFFICULTY
from utils.codes import generate_code, verify_code

app = Flask(__name__)
CORS(app)  # Allow Next.js frontend to call the API


# ─── Game Endpoints ────────────────────────────────────────────


@app.route("/api/games", methods=["GET"])
def list_games():
    """List all games with metadata."""
    return jsonify({
        "games": GAMES,
        "bonus": BONUS_GAMES,
        "categories": CATEGORIES,
    })


@app.route("/api/game/start", methods=["POST"])
def start_game():
    """Start a new game. Returns the initial state."""
    data = request.get_json()
    game_id = data.get("game_id")

    try:
        game = get_game_class(game_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    state = game.get_initial_state()

    # Allow overriding the starting player
    starting_player = data.get("starting_player", 1)
    if starting_player in (1, 2):
        state["current_player"] = starting_player

    return jsonify({
        "state": state,
        "valid_moves": game.get_valid_moves(state),
        "result": game.check_result(state),
        "interaction_mode": game.get_interaction_mode(state),
        "board_config": game.board_config,
    })


@app.route("/api/game/move", methods=["POST"])
def apply_move():
    """Apply a human move. Returns updated state, result, and valid moves."""
    data = request.get_json()
    game_id = data.get("game_id")
    state = data.get("state")
    move = data.get("move")

    try:
        game = get_game_class(game_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Validate the move
    valid_moves = game.get_valid_moves(state)

    # Normalize move for comparison
    move_valid = False
    if isinstance(move, int):
        move_valid = move in valid_moves
    elif isinstance(move, dict):
        move_valid = any(
            (isinstance(vm, dict) and vm.get("from") == move.get("from")
             and vm.get("to") == move.get("to"))
            for vm in valid_moves
        )
    else:
        move_valid = move in valid_moves

    if not move_valid:
        return jsonify({"error": "Invalid move", "valid_moves": valid_moves}), 400

    # Apply the move (on a clone so the original isn't mutated)
    new_state = game.apply_move(game.clone_state(state), move)
    result = game.check_result(new_state)

    return jsonify({
        "state": new_state,
        "result": result,
        "valid_moves": game.get_valid_moves(new_state) if not result["over"] else [],
        "interaction_mode": game.get_interaction_mode(new_state),
    })


@app.route("/api/game/ai-move", methods=["POST"])
def ai_move():
    """Calculate and apply the AI's best move."""
    data = request.get_json()
    game_id = data.get("game_id")
    state = data.get("state")
    difficulty = data.get("difficulty", "medium")

    try:
        game = get_game_class(game_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if difficulty not in DIFFICULTY:
        return jsonify({"error": f"Unknown difficulty: {difficulty}"}), 400

    diff = DIFFICULTY[difficulty]
    ai = MinimaxAI(game, diff["depth"], diff["randomize"])
    best_move = ai.get_best_move(state)

    if best_move is None:
        return jsonify({
            "state": state,
            "move": None,
            "result": game.check_result(state),
            "valid_moves": [],
            "interaction_mode": game.get_interaction_mode(state),
        })

    new_state = game.apply_move(game.clone_state(state), best_move)
    result = game.check_result(new_state)

    return jsonify({
        "state": new_state,
        "move": best_move,
        "result": result,
        "valid_moves": game.get_valid_moves(new_state) if not result["over"] else [],
        "interaction_mode": game.get_interaction_mode(new_state),
    })


@app.route("/api/game/valid-moves", methods=["POST"])
def get_valid_moves():
    """Get valid moves for a given state."""
    data = request.get_json()
    game_id = data.get("game_id")
    state = data.get("state")

    try:
        game = get_game_class(game_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "valid_moves": game.get_valid_moves(state),
        "interaction_mode": game.get_interaction_mode(state),
    })


@app.route("/api/game/check-result", methods=["POST"])
def check_result():
    """Check if the game is over."""
    data = request.get_json()
    game_id = data.get("game_id")
    state = data.get("state")

    try:
        game = get_game_class(game_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"result": game.check_result(state)})


# ─── Story Mode Endpoints ─────────────────────────────────────


@app.route("/api/story/verify-code", methods=["POST"])
def story_verify_code():
    """Verify an unlock code. Returns level number or error."""
    data = request.get_json()
    raw = data.get("code", "")
    level = verify_code(raw)
    if level is None:
        return jsonify({"valid": False, "error": "Código inválido"}), 400
    return jsonify({"valid": True, "level": level})


@app.route("/api/story/generate-code", methods=["POST"])
def story_generate_code():
    """Generate the unlock code for a given level."""
    data = request.get_json()
    level = data.get("level")
    if not isinstance(level, int) or not (1 <= level <= 21):
        return jsonify({"error": "Level must be 1-21"}), 400
    return jsonify({"code": generate_code(level)})


# ─── Health Check ──────────────────────────────────────────────


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "games_available": sum(1 for g in GAMES if g["available"])})


# ─── Run ───────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
