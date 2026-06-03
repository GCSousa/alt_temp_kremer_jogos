'use client';

import React from 'react';
import { GameState, GameResult, Move } from '../../lib/types';
import TicTacToeBoard from './TicTacToeBoard';
import TapatanBoard from './TapatanBoard';
import AmazonasBoard from './AmazonasBoard';

interface BoardWrapperProps {
  boardConfig?: {
    type: string;
    size?: number;
  };
  state: GameState;
  result: GameResult;
  interactionMode: 'placement' | 'movement';
  validMoves: Move[];
  onPlayMove: (move: Move) => void;
  disabled?: boolean;
}

export default function BoardWrapper({
  boardConfig,
  state,
  result,
  interactionMode,
  validMoves,
  onPlayMove,
  disabled = false,
}: BoardWrapperProps) {
  const boardType = boardConfig?.type || 'grid3x3';

  if (boardType === 'grid3x3') {
    return (
      <TicTacToeBoard
        state={state}
        result={result}
        onClick={(cell) => onPlayMove(cell)}
        disabled={disabled}
      />
    );
  }

  if (boardType === 'tapatan') {
    return (
      <TapatanBoard
        state={state}
        result={result}
        interactionMode={interactionMode}
        validMoves={validMoves}
        onPlayMove={onPlayMove}
        disabled={disabled}
      />
    );
  }

  if (boardType === 'amazonas') {
    return (
      <AmazonasBoard
        state={state}
        result={result}
        interactionMode={interactionMode}
        validMoves={validMoves}
        onPlayMove={onPlayMove}
        disabled={disabled}
      />
    );
  }

  return (
    <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
      Tipo de tabuleiro desconhecido: {boardType}
    </div>
  );
}
