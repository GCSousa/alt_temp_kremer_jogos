'use client';

import React from 'react';
import Link from 'next/link';
import { GAMES, BONUS_GAMES, CATEGORIES } from '../lib/registry';

export default function HomePage() {
  const miniGridSVG = () => (
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="60" rx="6" fill="#c9975a" />
      <line x1="20" y1="4" x2="20" y2="56" stroke="#6b3d1e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="4" x2="40" y2="56" stroke="#6b3d1e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="20" x2="56" y2="20" stroke="#6b3d1e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="40" x2="56" y2="40" stroke="#6b3d1e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="10" x2="26" y2="26" stroke="#dcdcdc" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="26" y1="10" x2="10" y2="26" stroke="#dcdcdc" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="30" r="7" fill="none" stroke="#686868" strokeWidth="3.5" />
      <circle cx="30" cy="50" r="7" fill="none" stroke="#686868" strokeWidth="3.5" />
      <line x1="34" y1="14" x2="46" y2="14" stroke="#dcdcdc" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="8" x2="40" y2="20" stroke="#dcdcdc" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <div id="screen-home" className="screen active">
      <header className="home-header">
        <div className="header-content">
          <div className="title-block">
            <span className="book-label">Divirta-se com</span>
            <h1 className="main-title">
              21 <span className="highlight">Jogos Lógicos</span>
            </h1>
            <span className="subtitle">no mesmo tabuleiro</span>
          </div>
          <div className="header-board-preview">
            <svg viewBox="0 0 100 100" className="preview-board">
              <rect width="100" height="100" rx="8" fill="#c8a068" />
              <line x1="33" y1="8" x2="33" y2="92" stroke="#6b3d1e" strokeWidth="3" strokeLinecap="round" />
              <line x1="67" y1="8" x2="67" y2="92" stroke="#6b3d1e" strokeWidth="3" strokeLinecap="round" />
              <line x1="8" y1="33" x2="92" y2="33" stroke="#6b3d1e" strokeWidth="3" strokeLinecap="round" />
              <line x1="8" y1="67" x2="92" y2="67" stroke="#6b3d1e" strokeWidth="3" strokeLinecap="round" />
              <line x1="14" y1="14" x2="86" y2="86" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="86" y1="14" x2="14" y2="86" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
        </div>
        <p className="author-credit">
          Baseado na obra de <strong>Renato P. Ribas</strong>
        </p>
      </header>

      <div className="story-entry-bar">
        <Link href="/story" style={{ textDecoration: 'none', display: 'block', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          <div className="story-entry-card" id="btn-enter-story">
            <div className="story-entry-left">
              <span className="story-entry-icon">⭐</span>
              <div className="story-entry-text">
                <strong>Modo História</strong>
                <span>Aprenda em sequência · Derrote a IA · Salve seu progresso</span>
              </div>
            </div>
            <span className="story-entry-arrow">›</span>
          </div>
        </Link>
      </div>

      <main className="games-section" id="games-container">
        {CATEGORIES.map((cat) => {
          const gamesInCat = GAMES.filter((g) => g.category === cat.id);
          return (
            <div key={cat.id} className="category-block">
              <div className="category-header">
                <div className="category-icon">{cat.icon}</div>
                <span className="category-title">{cat.label}</span>
                <div className="category-line"></div>
              </div>

              <div className="games-grid">
                {gamesInCat.map((game) => {
                  const altName = game.name_alt ? (
                    <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text3)' }}>
                      {' '}({game.name_alt})
                    </span>
                  ) : null;

                  if (game.available) {
                    return (
                      <Link href={`/setup/${game.id}`} key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="game-card">
                          <div className="game-card-header">
                            <div className="game-num-badge">{game.num}</div>
                            <span className="available-badge">Disponível</span>
                          </div>
                          <div className="game-board-mini">{miniGridSVG()}</div>
                          <div className="game-card-name">
                            {game.name}
                            {altName}
                          </div>
                          {game.origin && <div className="game-card-origin">📍 {game.origin}</div>}
                          <div className="game-card-desc">{game.description}</div>
                          <button className="btn-play-card">Jogar agora</button>
                        </div>
                      </Link>
                    );
                  } else {
                    return (
                      <div className="game-card coming-soon" key={game.id}>
                        <div className="game-card-header">
                          <div className="game-num-badge">{game.num}</div>
                          <span className="coming-soon-badge">Em Breve</span>
                        </div>
                        <div className="game-board-mini" style={{ opacity: 0.3 }}>
                          {miniGridSVG()}
                        </div>
                        <div className="game-card-name">
                          {game.name}
                          {altName}
                        </div>
                        <div className="game-card-desc">{game.description}</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}

        {/* Bonus Section */}
        <div className="category-block">
          <div className="category-header">
            <div className="category-icon">⭐</div>
            <span className="category-title">Bônus</span>
            <div className="category-line"></div>
          </div>
          <div className="games-grid">
            {BONUS_GAMES.map((game) => (
              <div className="game-card coming-soon" key={game.id}>
                <div className="game-card-header">
                  <div className="game-num-badge" style={{ background: 'var(--gold)', borderColor: 'var(--gold)' }}>
                    ★
                  </div>
                  <span className="coming-soon-badge">Em Breve</span>
                </div>
                <div className="game-card-name">{game.name}</div>
                <div className="game-card-desc">{game.description}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>
          © 2026 <strong>Gustavo Ribeiro Kremer</strong>, UFRGS &nbsp;·&nbsp; Baseado na obra de{' '}
          <strong>Renato P. Ribas</strong> — <em>Divirta-se com 21 Jogos Lógicos no Mesmo Tabuleiro</em>
        </p>
        <p style={{ marginTop: '6px', fontSize: '11px' }}>
          Código aberto sob licença{' '}
          <a href="https://github.com/grkremer/21_jogos_tabuleiro/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
            MIT License
          </a>
        </p>
      </footer>
    </div>
  );
}
