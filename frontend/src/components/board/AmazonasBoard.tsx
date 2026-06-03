'use client';

import React, { useState, useRef } from 'react';
import { GameState, GameResult, Move } from '../../lib/types';

interface AmazonasBoardProps {
  state: GameState;
  result: GameResult;
  interactionMode: 'placement' | 'movement';
  validMoves: Move[];
  onPlayMove: (move: Move) => void;
  disabled?: boolean;
}

const SIZE = 300;
const MARGIN = 45;
const STEP = (SIZE - 2 * MARGIN) / 2; // 105

// Point [x, y] for each of the 9 board positions
const PTS: [number, number][] = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    PTS.push([MARGIN + c * STEP, MARGIN + r * STEP]);
  }
}

const BOARD_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const PIECE_R = 22;
const SNAP_R = 36;

export default function AmazonasBoard({
  state,
  result,
  interactionMode,
  validMoves,
  onPlayMove,
  disabled = false,
}: AmazonasBoardProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Local state for two-step movement
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [movedPieceTo, setMovedPieceTo] = useState<number | null>(null);

  // Drag state for moving piece (step 1)
  const [dragActive, setDragActive] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverDest, setHoverDest] = useState<number | null>(null);

  const isClickable = !result.over && !disabled;

  const toSVGCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (SIZE / rect.width),
      y: (clientY - rect.top) * (SIZE / rect.height),
    };
  };

  // Helper to extract valid moves for Amazonas
  const getMovesForPiece = (pIdx: number): { piece: number; to: number; arrowTo: number }[] => {
    return validMoves
      .filter((m): m is { piece: number; to: number; arrowTo: number } => 
        typeof m === 'object' && m !== null && 'piece' in m && m.piece === pIdx
      );
  };

  const getValidDestsFor = (pIdx: number): number[] => {
    return Array.from(new Set(getMovesForPiece(pIdx).map((m) => m.to)));
  };

  const getValidArrowsFor = (pIdx: number, toIdx: number): number[] => {
    return getMovesForPiece(pIdx)
      .filter((m) => m.to === toIdx)
      .map((m) => m.arrowTo);
  };

  const currentValidDests = selectedPiece !== null && movedPieceTo === null ? getValidDestsFor(selectedPiece) : [];
  const currentValidArrows = selectedPiece !== null && movedPieceTo !== null ? getValidArrowsFor(selectedPiece, movedPieceTo) : [];

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isClickable || interactionMode === 'placement') return;

    const coords = toSVGCoords(e.clientX, e.clientY);
    
    // Find closest cell
    let hitIdx: number | null = null;
    for (let i = 0; i < 9; i++) {
      const [px, py] = PTS[i];
      if (Math.hypot(coords.x - px, coords.y - py) < SNAP_R) {
        hitIdx = i;
        break;
      }
    }

    if (hitIdx === null) return;

    // Step 2: Shoot arrow
    if (selectedPiece !== null && movedPieceTo !== null) {
      if (currentValidArrows.includes(hitIdx)) {
        // Finalize move!
        onPlayMove({ piece: selectedPiece, to: movedPieceTo, arrowTo: hitIdx });
        setSelectedPiece(null);
        setMovedPieceTo(null);
        return;
      }
      
      // If clicked elsewhere, cancel or change piece selection
      if (state.board[hitIdx] === state.current_player) {
        setSelectedPiece(hitIdx);
        setMovedPieceTo(null);
      } else {
        setSelectedPiece(null);
        setMovedPieceTo(null);
      }
      return;
    }

    // Step 1: Selecting or starting drag
    // Click on valid dest directly if already selected
    if (selectedPiece !== null && currentValidDests.includes(hitIdx) && state.board[hitIdx] === 0) {
      setMovedPieceTo(hitIdx);
      return;
    }

    // Must be own piece to select/drag
    if (state.board[hitIdx] !== state.current_player) {
      setSelectedPiece(null);
      return;
    }

    // Start drag
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragActive(true);
    setDragFrom(hitIdx);
    setDragCoords(coords);
    setHoverDest(null);
    setSelectedPiece(hitIdx);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragActive || dragFrom === null) return;

    const coords = toSVGCoords(e.clientX, e.clientY);
    setDragCoords(coords);

    // Find nearest valid destination
    const dests = getValidDestsFor(dragFrom);
    let nearest: number | null = null;
    let minDist = SNAP_R;

    for (const d of dests) {
      const [px, py] = PTS[d];
      const dist = Math.hypot(coords.x - px, coords.y - py);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    }
    setHoverDest(nearest);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragActive || dragFrom === null) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragActive(false);

    if (hoverDest !== null) {
      setSelectedPiece(dragFrom);
      setMovedPieceTo(hoverDest);
    } else {
      // Tap selection
      const startCoords = PTS[dragFrom];
      const distance = Math.hypot(dragCoords.x - startCoords[0], dragCoords.y - startCoords[1]);
      if (distance < 10) {
        setSelectedPiece(dragFrom);
      } else {
        setSelectedPiece(null);
      }
      setMovedPieceTo(null);
    }
    
    setDragFrom(null);
    setHoverDest(null);
  };

  const handlePlacementClick = (idx: number) => {
    if (!isClickable || interactionMode !== 'placement') return;
    if (validMoves.includes(idx)) {
      onPlayMove(idx);
    }
  };

  // Determine what is rendered at each board index
  const renderBoard = [...state.board];
  // If a piece is temporarily moved, update the rendered board representation
  if (selectedPiece !== null && movedPieceTo !== null) {
    renderBoard[movedPieceTo] = state.board[selectedPiece];
    renderBoard[selectedPiece] = 0;
  }

  return (
    <svg
      ref={svgRef}
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
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <defs>
        <linearGradient id="tpWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a568" />
          <stop offset="100%" stopColor="#b8843c" />
        </linearGradient>

        <linearGradient id="tpP1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f8f8" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>

        <linearGradient id="tpP2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#484848" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>

        <filter id="tpShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>

      {/* Board Background */}
      <rect width={SIZE} height={SIZE} fill="url(#tpWood)" rx="16" />

      {/* Board lines */}
      {BOARD_LINES.map((line, idx) => {
        const [a, , c] = line;
        const [x1, y1] = PTS[a];
        const [x2, y2] = PTS[c];
        return (
          <line
            key={`line-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#5c3217"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })}

      {/* STEP 1: Destinations indicator for piece selection */}
      {interactionMode === 'movement' && selectedPiece !== null && movedPieceTo === null && !dragActive && (
        <>
          {currentValidDests.map((idx) => {
            const [cx, cy] = PTS[idx];
            return (
              <circle
                key={`dest-${idx}`}
                cx={cx}
                cy={cy}
                r={9}
                fill="rgba(255,255,255,0.35)"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            );
          })}
        </>
      )}

      {/* Drag & drop visual indicators */}
      {dragActive && dragFrom !== null && (
        <>
          {getValidDestsFor(dragFrom).map((idx) => {
            const [cx, cy] = PTS[idx];
            const isHovered = hoverDest === idx;
            return (
              <circle
                key={`drag-dest-${idx}`}
                cx={cx}
                cy={cy}
                r={isHovered ? 14 : 10}
                fill={isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)'}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                style={{ pointerEvents: 'none', transition: 'all 0.1s' }}
              />
            );
          })}
        </>
      )}

      {/* STEP 2: Shoot arrow destinations indicator */}
      {interactionMode === 'movement' && selectedPiece !== null && movedPieceTo !== null && (
        <>
          {currentValidArrows.map((idx) => {
            const [cx, cy] = PTS[idx];
            return (
              <g key={`arrow-dest-${idx}`} style={{ pointerEvents: 'none' }}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill="rgba(239,68,68,0.18)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#ef4444"
                />
              </g>
            );
          })}
        </>
      )}

      {/* Render elements (Queens and Blocks) */}
      {renderBoard.map((v, i) => {
        if (v === 0) return null;
        const [cx, cy] = PTS[i];
        
        // Hide piece if currently dragging it
        const isDragged = dragActive && dragFrom === i;
        const isSelected = selectedPiece === i && movedPieceTo === null;
        const isTempMoved = movedPieceTo === i;

        // Render blocked arrow target (value 3)
        if (v === 3) {
          return (
            <g key={`block-${i}`} filter="url(#tpShadow)">
              <circle cx={cx} cy={cy} r={PIECE_R} fill="#2a1215" stroke="#ef4444" strokeWidth="2.5" />
              <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          );
        }

        // Render queens (value 1 or 2)
        return (
          <g
            key={`piece-${i}`}
            filter="url(#tpShadow)"
            opacity={isDragged ? 0.3 : 1}
            style={{ transition: 'opacity 0.2s' }}
          >
            {(isSelected || isTempMoved) && (
              <circle
                cx={cx}
                cy={cy}
                r={PIECE_R + 7}
                fill="none"
                stroke={isTempMoved ? '#a78bfa' : 'rgba(255,255,255,0.6)'}
                strokeWidth="2.5"
                strokeDasharray={isTempMoved ? undefined : "5 3"}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={PIECE_R}
              fill={v === 1 ? 'url(#tpP1)' : 'url(#tpP2)'}
              stroke={v === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)'}
              strokeWidth="1.5"
            />
            {isTempMoved && (
              <path
                d={`M ${cx - 6} ${cy} L ${cx} ${cy - 6} L ${cx + 6} ${cy} M ${cx} ${cy - 6} L ${cx} ${cy + 6}`}
                fill="none"
                stroke={v === 1 ? '#000' : '#fff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}

      {/* Active dragging ghost piece */}
      {dragActive && dragFrom !== null && (
        <circle
          cx={dragCoords.x}
          cy={dragCoords.y}
          r={PIECE_R * 0.9}
          fill={state.board[dragFrom] === 1 ? 'url(#tpP1)' : 'url(#tpP2)'}
          opacity="0.9"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Placement Phase: Invisible click targets for empty positions */}
      {interactionMode === 'placement' && isClickable && (
        <>
          {state.board.map((val, i) => {
            if (val !== 0) return null;
            const [cx, cy] = PTS[i];
            const isMoveValid = validMoves.includes(i);
            if (!isMoveValid) return null;

            return (
              <circle
                key={`target-${i}`}
                cx={cx}
                cy={cy}
                r={SNAP_R}
                fill="rgba(0,0,0,0)"
                style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                onClick={() => handlePlacementClick(i)}
                onMouseEnter={(e) => (e.currentTarget.style.fill = 'rgba(255,255,255,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.fill = 'rgba(0,0,0,0)')}
              />
            );
          })}
        </>
      )}
    </svg>
  );
}
