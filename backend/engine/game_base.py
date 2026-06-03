"""
Abstract base class for all board games.
Every game must extend this and implement the required methods.

Converted from js/engine/GameBase.js
"""
from abc import ABC, abstractmethod
import copy


class GameBase(ABC):
    """Base class that all 21 games extend."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable game name."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Brief game description in Portuguese."""
        ...

    @property
    def origin(self) -> str | None:
        """Country/culture of origin."""
        return None

    @property
    @abstractmethod
    def board_config(self) -> dict:
        """Board configuration used by the renderer. Must include {'type': str}."""
        ...

    @property
    def interaction_mode(self) -> str:
        """Default interaction mode: 'placement' or 'movement'."""
        return "placement"

    def get_interaction_mode(self, state: dict) -> str:
        """Dynamic interaction mode based on state. Override for bifásic games."""
        return self.interaction_mode

    @abstractmethod
    def get_initial_state(self) -> dict:
        """Returns the initial game state. Must include {'current_player': 1|2}."""
        ...

    @abstractmethod
    def get_valid_moves(self, state: dict) -> list:
        """Returns an array of valid moves for the current state."""
        ...

    @abstractmethod
    def apply_move(self, state: dict, move) -> dict:
        """
        Applies a move to a state and returns the new state.
        IMPORTANT: mutates and returns the given state object.
        Callers should clone_state() first if they need immutability.
        """
        ...

    @abstractmethod
    def check_result(self, state: dict) -> dict:
        """
        Checks the game result.
        Returns: {'over': bool, 'winner': 1|2|0|None, 'line': list|None}
          winner: 1=P1 wins, 2=P2 wins, 0=draw, None=game ongoing
          line: winning line data for rendering (game-specific), or None
        """
        ...

    @abstractmethod
    def evaluate(self, state: dict) -> int:
        """
        Heuristic evaluation of a state for minimax.
        Positive scores favor player 1, negative favor player 2.
        Terminal states should return large values (e.g., ±1000).
        """
        ...

    def clone_state(self, state: dict) -> dict:
        """Deep clone a state. Override for performance if needed."""
        return copy.deepcopy(state)
