export interface GameState {
  board: number[];
  current_player: number;
  phase?: 'placement' | 'movement';
  placed?: Record<string, number> | number[];
  move_count?: number;
}

export type Move = number | { from: number; to: number } | { piece: number; to: number; arrowTo: number };

export interface GameResult {
  over: boolean;
  winner: number; // 0 = draw, 1 = P1, 2 = P2
  line?: number[];
  reason?: string;
}

export interface GameMetadata {
  id: string;
  num: number;
  name: string;
  name_alt?: string | null;
  category: string;
  subcategory: string;
  origin?: string | null;
  description: string;
  available: boolean;
}

export interface CategoryMetadata {
  id: string;
  icon: string;
  label: string;
  subcategories: string[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StoryProgress {
  unlockedUpTo: number;
  completedMedium: number[];
  completedEasy: number[];
}
