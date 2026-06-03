'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { GAMES } from '../../../lib/registry';
import { Difficulty } from '../../../lib/types';

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const gameDef = GAMES.find((g) => g.id === gameId);

  // Default state settings matching original app
  const [mode, setMode] = useState<'local' | 'ai'>('local');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [startingPlayer, setStartingPlayer] = useState<string>('1');

  if (!gameDef) {
    return (
      <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
        <h2>Jogo não encontrado</h2>
        <Link href="/">Voltar ao início</Link>
      </div>
    );
  }

  const handleStart = () => {
    const query = new URLSearchParams({
      mode,
      difficulty,
      starts: startingPlayer,
    });
    router.push(`/game/${gameId}?${query.toString()}`);
  };

  return (
    <div id="screen-setup" className="screen active" style={{ display: 'block', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="setup-wrapper" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Voltar
          </button>
        </Link>

        <div className="setup-card" style={{ marginTop: '24px' }}>
          <div className="setup-game-badge">{gameDef.num}</div>
          <h2 className="setup-game-title">{gameDef.name}</h2>
          <p className="setup-game-desc">{gameDef.description}</p>

          <div className="setup-section">
            <h3 className="setup-section-title">Modo de Jogo</h3>
            <div className="mode-grid">
              <button
                className={`mode-btn ${mode === 'local' ? 'active' : ''}`}
                onClick={() => setMode('local')}
              >
                <div className="mode-icon">👥</div>
                <div className="mode-info">
                  <span className="mode-name">Local</span>
                  <span className="mode-desc">2 Jogadores</span>
                </div>
              </button>
              <button
                className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
                onClick={() => setMode('ai')}
              >
                <div className="mode-icon">🤖</div>
                <div className="mode-info">
                  <span className="mode-name">vs Máquina</span>
                  <span className="mode-desc">Minimax AI</span>
                </div>
              </button>
            </div>
          </div>

          {mode === 'ai' && (
            <div className="setup-section" id="section-difficulty">
              <h3 className="setup-section-title">Dificuldade</h3>
              <div className="difficulty-grid">
                <button
                  className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  <span className="diff-icon">🌱</span>
                  <span className="diff-name">Fácil</span>
                  <span className="diff-depth">Profund. 1</span>
                </button>
                <button
                  className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  <span className="diff-icon">⚡</span>
                  <span className="diff-name">Médio</span>
                  <span className="diff-depth">Profund. 3</span>
                </button>
                <button
                  className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  <span className="diff-icon">💀</span>
                  <span className="diff-name">Difícil</span>
                  <span className="diff-depth">Profund. 9</span>
                </button>
              </div>
            </div>
          )}

          <div className="setup-section">
            <h3 className="setup-section-title">Quem começa?</h3>
            <div className="starts-grid">
              <button
                className={`starts-btn ${startingPlayer === '1' ? 'active' : ''}`}
                onClick={() => setStartingPlayer('1')}
              >
                <span className="starts-piece p1-dot"></span>
                Jogador 1
              </button>
              <button
                className={`starts-btn ${startingPlayer === '2' ? 'active' : ''}`}
                onClick={() => setStartingPlayer('2')}
              >
                <span className="starts-piece p2-dot"></span>
                {mode === 'ai' ? 'IA' : 'Jogador 2'}
              </button>
              <button
                className={`starts-btn ${startingPlayer === 'random' ? 'active' : ''}`}
                onClick={() => setStartingPlayer('random')}
              >
                🎲 Aleatório
              </button>
            </div>
          </div>

          <button className="btn-start" onClick={handleStart} style={{ marginTop: '32px', width: '100%' }}>
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
}
