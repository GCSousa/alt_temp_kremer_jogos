'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GAMES } from '../../../lib/registry';
import { useGame } from '../../../hooks/useGame';
import { useStory } from '../../../hooks/useStory';
import { generateStoryCode } from '../../../lib/api';
import BoardWrapper from '../../../components/board/BoardWrapper';
import { Difficulty } from '../../../lib/types';

function GameContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { markCompleted } = useStory();

  const gameId = params.gameId as string;
  const gameDef = GAMES.find((g) => g.id === gameId);

  // Setup params from URL query
  const mode = (searchParams.get('mode') as 'local' | 'ai') || 'local';
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';
  const startsQuery = searchParams.get('starts') || '1';
  const isStory = searchParams.get('story') === 'true';
  const playAsDark = searchParams.get('playAsDark') === 'true';

  const {
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
  } = useGame();

  const [winCode, setWinCode] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    if (gameDef) {
      let startingPlayer: number | 'random' = 'random';
      if (startsQuery === '1') startingPlayer = 1;
      if (startsQuery === '2') startingPlayer = 2;

      initGame(gameDef.id, mode, difficulty, startingPlayer, playAsDark);
    }
  }, [gameId, mode, difficulty, startsQuery, playAsDark]);

  // Handle WinOverlay trigger and Code Generation
  useEffect(() => {
    if (result?.over) {
      const showOverlay = async () => {
        if (isStory && gameDef) {
          const playerWon = result.winner !== 0 && result.winner !== null && result.winner !== config?.aiPlayer;
          if (playerWon) {
            // Mark completed in localStorage
            if (difficulty === 'easy' || difficulty === 'medium') {
              markCompleted(gameDef.num, difficulty);
            }
            
            // Get unlock code from backend
            try {
              const res = await generateStoryCode(gameDef.num);
              setWinCode(res.code);
            } catch (err) {
              console.error('Failed to generate story code', err);
            }
          }
        }
        // Show after a slight delay for animation feel
        setTimeout(() => {
          setOverlayVisible(true);
        }, 700);
      };
      showOverlay();
    } else {
      setOverlayVisible(false);
      setWinCode(null);
    }
  }, [result, isStory, gameDef, config]);

  if (!gameDef || !state) {
    return (
      <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
        <h2>Carregando partida...</h2>
      </div>
    );
  }

  // UI calculations
  const p1Name = config?.p1Name || 'Jogador 1';
  const p2Name = config?.p2Name || 'Jogador 2';
  const currentTurn = state.current_player;

  // Status message
  let statusText = `Vez de ${currentTurn === 1 ? p1Name : p2Name}`;
  if (isAIThinking) {
    statusText = '🤖 IA pensando...';
  }
  if (result?.over) {
    if (result.winner === 1) {
      statusText = `${p1Name} venceu! 🎉`;
    } else if (result.winner === 2) {
      statusText = `${p2Name} venceu! 🎉`;
    } else {
      statusText = 'Empate! 🤝';
    }
  }

  const handleBack = () => {
    if (isStory) {
      router.push('/story');
    } else {
      router.push(`/setup/${gameId}`);
    }
  };

  const handlePlayAgain = () => {
    setOverlayVisible(false);
    restartRound();
  };

  const handleNextLevel = () => {
    const nextGame = GAMES.find((g) => g.num === gameDef.num + 1);
    if (nextGame && nextGame.available) {
      router.push(`/story?openLevel=${nextGame.num}`);
    } else {
      router.push('/story');
    }
  };

  return (
    <div id="screen-game" className="screen active" style={{ display: 'block' }}>
      <div className="game-wrapper">
        <div className="game-topbar">
          <button className="btn-back" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Voltar
          </button>
          <h2 className="game-topbar-title">
            {isStory ? `Nível ${gameDef.num}: ` : ''}{gameDef.name}
          </h2>
          <button className="btn-icon-round" onClick={restartRound} title="Reiniciar Partida">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>

        <div className="players-bar">
          {/* Player 1 Card */}
          <div className={`player-card ${currentTurn === 1 && !result?.over ? 'active-turn' : ''}`} id="player1-card">
            <div className="player-avatar p1-avatar">
              <svg width="28" height="28" viewBox="0 0 40 40">
                <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                <line x1="32" y1="8" x2="8" y2="32" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="player-info">
              <span className="player-name" id="player1-name">{p1Name}</span>
              <span className="player-score" id="score-p1">{scores[1]}</span>
            </div>
            <div className="turn-indicator" id="turn1"></div>
          </div>

          <div className="vs-badge">
            <span className="score-draws-label">Empates</span>
            <span className="score-draws" id="score-draw">{scores.draw}</span>
          </div>

          {/* Player 2 Card */}
          <div className={`player-card right ${currentTurn === 2 && !result?.over ? 'active-turn' : ''}`} id="player2-card">
            <div className="turn-indicator right" id="turn2"></div>
            <div className="player-info right">
              <span className="player-name" id="player2-name">{p2Name}</span>
              <span className="player-score" id="score-p2">{scores[2]}</span>
            </div>
            <div className="player-avatar p2-avatar">
              <svg width="28" height="28" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-text" id="status-text">{statusText}</div>
        </div>

        <div className="board-area">
          <div id="game-board" className="board-container">
            <BoardWrapper
              boardConfig={boardConfig as any}
              state={state}
              result={result || { over: false, winner: 0 }}
              interactionMode={interactionMode}
              validMoves={validMoves}
              onPlayMove={playMove}
              disabled={isAIThinking}
            />
          </div>
        </div>
      </div>

      {/* WIN OVERLAY */}
      <div className={`win-overlay ${overlayVisible ? 'visible' : ''}`} id="win-overlay" style={{ pointerEvents: overlayVisible ? 'all' : 'none' }}>
        <div className="win-card">
          <div className="win-emoji" id="win-emoji">
            {result?.winner === 0 ? '🤝' : result?.winner === config?.aiPlayer ? '🤖' : '🏆'}
          </div>
          <h2 className="win-title" id="win-title">
            {result?.winner === 0 ? 'Empate!' : result?.winner === config?.aiPlayer ? 'A IA Venceu!' : 'Vitória!'}
          </h2>
          <p className="win-subtitle" id="win-subtitle">
            {result?.winner === 0
              ? 'Bom jogo! Foi uma disputa equilibrada.'
              : result?.winner === config?.aiPlayer
              ? 'Tente novamente para superar o Minimax AI!'
              : 'Excelente estratégia e ótimas jogadas!'}
          </p>

          {/* Unlock code display */}
          {winCode && (
            <div className="story-win-code" id="story-win-code" style={{ display: 'block' }}>
              <p className="story-code-label">Código de desbloqueio</p>
              <div className="story-code-value" id="story-win-code-value">{winCode}</div>
              <p className="story-code-hint">Anote este código para recuperar o progresso em outro dispositivo</p>
            </div>
          )}

          {isStory ? (
            <div className="win-actions">
              {result?.winner !== 0 && result?.winner !== config?.aiPlayer ? (
                <>
                  {gameDef.num < 21 && (
                    <button className="btn-primary" onClick={handleNextLevel}>
                      Próximo Nível ›
                    </button>
                  )}
                  <button className="btn-secondary" onClick={handleBack}>
                    Voltar ao Mapa
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={handlePlayAgain}>
                    Tentar Novamente
                  </button>
                  <button className="btn-secondary" onClick={handleBack}>
                    Voltar ao Mapa
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="win-actions" id="win-actions">
              <button className="btn-primary" id="btn-play-again" onClick={handlePlayAgain}>
                Jogar Novamente
              </button>
              <button className="btn-secondary" id="btn-change-setup" onClick={handleBack}>
                Mudar Configuração
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <React.Suspense fallback={
      <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '100px' }}>
        <h2>Carregando partida...</h2>
      </div>
    }>
      <GameContent />
    </React.Suspense>
  );
}
