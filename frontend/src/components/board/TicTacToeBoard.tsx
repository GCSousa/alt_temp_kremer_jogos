'use client';

import React from 'react';
import { GameState, GameResult } from '../../lib/types';

interface TicTacToeBoardProps {
  state: GameState;
  result: GameResult;
  onClick: (cellIndex: number) => void;
  disabled?: boolean;
}

export default function TicTacToeBoard({ state, result, onClick, disabled = false }: TicTacToeBoardProps) {
  const SIZE = 300;
  const CELL = SIZE / 3;
  const PAD = 18;
  const strokeW = 8;
  const pieceR = CELL * 0.55;

  const isClickable = !result.over && !disabled;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="ttt-board"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        display: 'block',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
      }}
    >
      <defs>
        {/* Wood gradient */}
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a568" />
          <stop offset="100%" stopColor="#b8843c" />
        </linearGradient>

        {/* P1 (Light/White piece) gradient */}
        <linearGradient id="p1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#c0c0c0" />
        </linearGradient>

        {/* P2 (Dark/Black piece) gradient */}
        <linearGradient id="p2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#585858" />
          <stop offset="100%" stopColor="#1c1c1c" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={SIZE} height={SIZE} fill="url(#woodGrad)" rx="16" />

      {/* Win cell highlights */}
      {result.over && result.line && (
        <>
          {result.line.map((idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const fillColors = {
              1: 'rgba(255,255,255,0.2)',
              2: 'rgba(60,60,60,0.35)',
            };
            return (
              <rect
                key={`win-${idx}`}
                x={col * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
                fill={fillColors[result.winner as 1 | 2] || 'rgba(245,166,35,0.2)'}
                className="cell-win-glow"
              />
            );
          })}
        </>
      )}

      {/* Board lines */}
      {[1, 2].map((i) => (
        <React.Fragment key={`lines-${i}`}>
          {/* Vertical line */}
          <line
            x1={i * CELL}
            y1={PAD}
            x2={i * CELL}
            y2={SIZE - PAD}
            stroke="#5c3217"
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* Horizontal line */}
          <line
            x1={PAD}
            y1={i * CELL}
            x2={SIZE - PAD}
            y2={i * CELL}
            stroke="#5c3217"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </React.Fragment>
      ))}

      {/* Interactive cells & Pieces */}
      {Array.from({ length: 9 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = col * CELL + CELL / 2;
        const cy = row * CELL + CELL / 2;
        const val = state.board[i];

        if (val === 1) {
          // X piece
          const arm = pieceR * 0.42;
          return (
            <g key={`piece-${i}`} filter="url(#shadow)">
              <line
                x1={cx - arm}
                y1={cy - arm}
                x2={cx + arm}
                y2={cy + arm}
                stroke="url(#p1Grad)"
                strokeWidth={strokeW}
                strokeLinecap="round"
              />
              <line
                x1={cx + arm}
                y1={cy - arm}
                x2={cx - arm}
                y2={cy + arm}
                stroke="url(#p1Grad)"
                strokeWidth={strokeW}
                strokeLinecap="round"
              />
            </g>
          );
        } else if (val === 2) {
          // O piece
          return (
            <g key={`piece-${i}`} filter="url(#shadow)">
              <circle
                cx={cx}
                cy={cy}
                r={pieceR * 0.4}
                fill="none"
                stroke="url(#p2Grad)"
                strokeWidth={strokeW}
              />
            </g>
          );
        } else if (isClickable) {
          // Clickable hover area
          return (
            <rect
              key={`empty-${i}`}
              x={col * CELL + 4}
              y={row * CELL + 4}
              width={CELL - 8}
              height={CELL - 8}
              fill="rgba(0,0,0,0)"
              rx={10}
              style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
              onClick={() => onClick(i)}
              onMouseEnter={(e) => (e.currentTarget.style.fill = 'rgba(255,255,255,0.09)')}
              onMouseLeave={(e) => (e.currentTarget.style.fill = 'rgba(0,0,0,0)')}
            />
          );
        }
        return null;
      })}

      {/* Win line overlay */}
      {result.over && result.line && (
        (() => {
          const [a, , c] = result.line;
          const getCenter = (idx: number) => ({
            x: (idx % 3) * CELL + CELL / 2,
            y: Math.floor(idx / 3) * CELL + CELL / 2,
          });
          const pa = getCenter(a);
          const pc = getCenter(c);
          return (
            <line
              x1={pa.x}
              y1={pa.y}
              x2={pc.x}
              y2={pc.y}
              stroke={result.winner === 1 ? '#f0f0f0' : '#888888'}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.85}
              style={{
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                animation: 'drawWinLine 0.5s ease forwards',
              }}
            />
          );
        })()
      )}
    </svg>
  );
}
