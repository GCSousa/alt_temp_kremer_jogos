import { GameState, Move, GameResult, Difficulty } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface StartResponse {
  state: GameState;
  valid_moves: Move[];
  result: GameResult;
  interaction_mode: string;
  board_config: Record<string, any>;
}

interface MoveResponse {
  state: GameState;
  result: GameResult;
  valid_moves: Move[];
  interaction_mode: string;
  move?: Move;
}

export async function startGame(gameId: string, startingPlayer: number = 1): Promise<StartResponse> {
  const res = await fetch(`${API_BASE}/api/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, starting_player: startingPlayer }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function applyMove(gameId: string, state: GameState, move: Move): Promise<MoveResponse> {
  const res = await fetch(`${API_BASE}/api/game/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, state, move }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getAIMove(gameId: string, state: GameState, difficulty: Difficulty): Promise<MoveResponse> {
  const res = await fetch(`${API_BASE}/api/game/ai-move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, state, difficulty }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function verifyStoryCode(code: string): Promise<{ valid: boolean; level?: number; error?: string }> {
  const res = await fetch(`${API_BASE}/api/story/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return { valid: false, error: errorData.error || 'Código inválido' };
  }
  return res.json();
}

export async function generateStoryCode(level: number): Promise<{ code: string }> {
  const res = await fetch(`${API_BASE}/api/story/generate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}
