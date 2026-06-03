import { useState, useEffect, useCallback } from 'react';
import { GameState, Move, GameResult, Difficulty } from '../lib/types';
import { startGame, applyMove, getAIMove } from '../lib/api';

interface GameSessionConfig {
  gameId: string;
  mode: 'local' | 'ai';
  difficulty: Difficulty;
  startingPlayer: number | 'random';
  aiPlayer: number; // 1 or 2
  p1Name: string;
  p2Name: string;
}

export function useGame() {
  const [config, setConfig] = useState<GameSessionConfig | null>(null);
  
  // Game session states
  const [state, setState] = useState<GameState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [interactionMode, setInteractionMode] = useState<'placement' | 'movement'>('placement');
  const [boardConfig, setBoardConfig] = useState<Record<string, any>>({});
  
  // UI states
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [scores, setScores] = useState({ 1: 0, 2: 0, draw: 0 });

  const resetScores = useCallback(() => {
    setScores({ 1: 0, 2: 0, draw: 0 });
  }, []);

  const initGame = async (
    gameId: string,
    mode: 'local' | 'ai',
    difficulty: Difficulty,
    startingPlayer: number | 'random',
    playAsDark: boolean = false
  ) => {
    // Resolve starting player
    let firstPlayer = startingPlayer;
    if (firstPlayer === 'random') {
      firstPlayer = Math.random() < 0.5 ? 1 : 2;
    }

    const aiPlayer = playAsDark ? 1 : 2;
    const p1Name = mode === 'ai' ? (playAsDark ? '🤖 IA' : 'Você') : 'Jogador 1';
    const p2Name = mode === 'ai' ? (playAsDark ? 'Você' : '🤖 IA') : 'Jogador 2';

    setConfig({
      gameId,
      mode,
      difficulty,
      startingPlayer,
      aiPlayer,
      p1Name,
      p2Name,
    });

    try {
      const res = await startGame(gameId, firstPlayer as number);
      setState(res.state);
      setResult(res.result);
      setValidMoves(res.valid_moves);
      setInteractionMode(res.interaction_mode as 'placement' | 'movement');
      setBoardConfig(res.board_config);
    } catch (e) {
      console.error('Error starting game', e);
    }
  };

  const restartRound = async () => {
    if (!config) return;

    let firstPlayer = config.startingPlayer;
    if (firstPlayer === 'random') {
      firstPlayer = Math.random() < 0.5 ? 1 : 2;
    }

    try {
      const res = await startGame(config.gameId, firstPlayer as number);
      setState(res.state);
      setResult(res.result);
      setValidMoves(res.valid_moves);
      setInteractionMode(res.interaction_mode as 'placement' | 'movement');
      setBoardConfig(res.board_config);
      setIsAIThinking(false);
    } catch (e) {
      console.error('Error restarting round', e);
    }
  };

  // Play a move (called by human clicks/drags)
  const playMove = async (move: Move) => {
    if (!config || !state || isAIThinking || result?.over) return;

    try {
      const res = await applyMove(config.gameId, state, move);
      setState(res.state);
      setResult(res.result);
      setValidMoves(res.valid_moves);
      setInteractionMode(res.interaction_mode as 'placement' | 'movement');

      if (res.result.over) {
        handleGameOver(res.result);
      }
    } catch (e) {
      console.error('Error applying move', e);
    }
  };

  const handleGameOver = (res: GameResult) => {
    if (res.winner === 1) {
      setScores((prev) => ({ ...prev, 1: prev[1] + 1 }));
    } else if (res.winner === 2) {
      setScores((prev) => ({ ...prev, 2: prev[2] + 1 }));
    } else {
      setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
    }
  };

  // Effect to handle AI plays
  useEffect(() => {
    if (!config || !state || result?.over || config.mode !== 'ai' || isAIThinking) return;

    const isAITurn = state.current_player === config.aiPlayer;
    if (!isAITurn) return;

    let active = true;
    const triggerAI = async () => {
      setIsAIThinking(true);
      // Add a slight realistic delay so the AI doesn't feel instantaneous/jarring
      await new Promise((r) => setTimeout(r, 600));
      if (!active) return;

      try {
        const res = await getAIMove(config.gameId, state, config.difficulty);
        if (!active) return;

        setState(res.state);
        setResult(res.result);
        setValidMoves(res.valid_moves);
        setInteractionMode(res.interaction_mode as 'placement' | 'movement');
        
        if (res.result.over) {
          handleGameOver(res.result);
        }
      } catch (e) {
        console.error('Error getting AI move', e);
      } finally {
        if (active) setIsAIThinking(false);
      }
    };

    triggerAI();

    return () => {
      active = false;
    };
  }, [state, config, result, isAIThinking]);

  return {
    config,
    state,
    result,
    validMoves,
    interactionMode,
    boardConfig,
    isAIThinking,
    scores,
    initGame,
    restartRound,
    playMove,
    resetScores,
  };
}
