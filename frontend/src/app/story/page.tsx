'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GAMES } from '../../lib/registry';
import { useStory, LEVEL_RULES } from '../../hooks/useStory';

const NODE_EDGE_PAD = [
  18, 22,   // 1-2
  52, 30,   // 3-4
  85, 65,   // 5-6
  35, 80,   // 7-8
  20, 55,   // 9-10
  72, 25,   // 11-12
  60, 88,   // 13-14
  30, 45,   // 15-16
  78, 20,   // 17-18
  58, 40,   // 19-20
  70,       // 21
];

function StoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress, loading, markCompleted, unlockWithCode } = useStory();

  const [introSeen, setIntroSeen] = useState(true);
  const [activeLevelModal, setActiveLevelModal] = useState<number | null>(null);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeError, setCodeError] = useState('');
  const [playAsDark, setPlayAsDark] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const mapScrollRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const [pathSvg, setPathSvg] = useState<{ d: string; activeD: string } | null>(null);

  // Check intro seen and query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('story_intro_seen');
      setIntroSeen(seen === '1');
    }
  }, []);

  const triggerFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 3000);
  };

  const handleAcceptIntro = () => {
    localStorage.setItem('story_intro_seen', '1');
    setIntroSeen(true);
  };

  // Open direct level detail if passed in query (e.g. from redirect)
  useEffect(() => {
    const openLevel = searchParams.get('openLevel');
    if (openLevel) {
      const num = parseInt(openLevel);
      if (num >= 1 && num <= 21) {
        setActiveLevelModal(num);
      }
    }
  }, [searchParams]);

  // Draw Path function: measures node positions and updates the connecting path
  const drawPath = () => {
    const mapEl = mapRef.current;
    if (!mapEl) return;

    const nodes = mapEl.querySelectorAll('.story-node');
    if (nodes.length < 2) return;

    const mapRect = mapEl.getBoundingClientRect();
    const scrollEl = mapScrollRef.current;
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;

    const pts: { cx: number; cy: number; active: boolean }[] = [];

    // Map level number to indices
    for (let lv = 1; lv <= 21; lv++) {
      const nodeBtn = nodeRefs.current[lv];
      if (nodeBtn) {
        const r = nodeBtn.getBoundingClientRect();
        const cx = r.left - mapRect.left + r.width / 2;
        const cy = r.top - mapRect.top + scrollTop + r.height / 2;
        const active = lv <= progress.unlockedUpTo;
        pts.push({ cx, cy, active });
      }
    }

    if (pts.length < 2) return;

    // Build full bezier path
    let d = `M ${pts[0].cx} ${pts[0].cy}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cy1 = prev.cy + (curr.cy - prev.cy) * 0.5;
      d += ` C ${prev.cx} ${cy1}, ${curr.cx} ${cy1}, ${curr.cx} ${curr.cy}`;
    }

    // Build active path
    let activeD = '';
    const lastActive = pts.reduce((acc, p, i) => (p.active ? i : acc), -1);
    if (lastActive > 0) {
      activeD = `M ${pts[0].cx} ${pts[0].cy}`;
      for (let i = 1; i <= lastActive; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cy1 = prev.cy + (curr.cy - prev.cy) * 0.5;
        activeD += ` C ${prev.cx} ${cy1}, ${curr.cx} ${cy1}, ${curr.cx} ${curr.cy}`;
      }
    }

    setPathSvg({ d, activeD });
  };

  // Re-draw path when progress updates or intro state changes
  useEffect(() => {
    if (introSeen && !loading) {
      // Delay slightly to allow rendering and layout sizing to complete
      const timer = setTimeout(() => {
        drawPath();
      }, 150);

      window.addEventListener('resize', drawPath);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', drawPath);
      };
    }
  }, [introSeen, loading, progress]);

  // Handle Code submission
  const handleCodeSubmit = async () => {
    if (codeInputValue.length !== 4) return;
    const res = await unlockWithCode(codeInputValue);
    if (res.success && res.level) {
      setCodeModalVisible(false);
      setCodeInputValue('');
      triggerFlash(`✓ Progresso até o nível ${res.level} restaurado!`);
    } else {
      setCodeError(res.error || 'Código inválido. Verifique e tente novamente.');
    }
  };

  const startLevel = (difficulty: 'easy' | 'medium') => {
    if (activeLevelModal === null) return;
    const game = GAMES.find((g) => g.num === activeLevelModal);
    if (!game) return;

    setActiveLevelModal(null);
    router.push(
      `/game/${game.id}?mode=ai&difficulty=${difficulty}&starts=1&story=true&playAsDark=${playAsDark}`
    );
  };

  const storyGames = GAMES.filter((g) => g.num >= 1 && g.num <= 21).sort((a, b) => a.num - b.num);

  const selectedGameModal = activeLevelModal !== null ? GAMES.find((g) => g.num === activeLevelModal) : null;
  const isMedDone = activeLevelModal !== null ? progress.completedMedium.includes(activeLevelModal) : false;
  const isEasyDone = activeLevelModal !== null ? progress.completedEasy.includes(activeLevelModal) : false;

  return (
    <div id="screen-story" className="screen active" style={{ display: 'block' }}>
      <div className="story-wrapper">
        <div className="story-topbar">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Voltar
            </button>
          </Link>
          <h2 className="story-topbar-title">Modo História</h2>
          <button className="btn-icon-round" title="Inserir código de desbloqueio" onClick={() => setCodeModalVisible(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
        </div>

        <div className="story-map-scroll" ref={mapScrollRef} onScroll={drawPath}>
          <div className="story-map" id="story-map" ref={mapRef} style={{ position: 'relative', overflow: 'hidden' }}>
            
            {/* Flash message */}
            {flashMessage && <div className="story-flash">{flashMessage}</div>}

            {/* SVG Path Overlay */}
            {pathSvg && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                <defs>
                  <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="#5b21b6" />
                    <stop offset="50%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#9d5cf7" />
                  </linearGradient>
                </defs>
                {/* Background locked path */}
                <path d={pathSvg.d} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
                <path d={pathSvg.d} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />

                {/* Active unlocked path */}
                {pathSvg.activeD && (
                  <>
                    <path d={pathSvg.activeD} fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
                    <path d={pathSvg.activeD} fill="none" stroke="url(#pathGrad)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
                    <path d={pathSvg.activeD} fill="none" stroke="rgba(200,180,255,0.2)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            )}

            {/* Nodes Render */}
            {!loading &&
              storyGames.map((game, i) => {
                const lv = game.num;
                const unlocked = lv <= progress.unlockedUpTo;
                const medDone = progress.completedMedium.includes(lv);
                const easyDone = progress.completedEasy.includes(lv);
                const isCurrent = unlocked && !medDone && lv === progress.unlockedUpTo;

                const isLeft = i % 2 === 0;
                const pad = NODE_EDGE_PAD[i] ?? 30;

                const nodeClass = !unlocked
                  ? 'node-locked'
                  : medDone
                  ? 'node-done'
                  : isCurrent
                  ? 'node-current'
                  : 'node-unlocked';

                const star = medDone ? (
                  <span className="node-star">★</span>
                ) : easyDone ? (
                  <span className="node-star star-outline">☆</span>
                ) : null;

                return (
                  <div
                    key={game.id}
                    className={`story-item ${isLeft ? 'item-left' : 'item-right'}`}
                    style={{
                      paddingLeft: isLeft ? `${pad}px` : undefined,
                      paddingRight: !isLeft ? `${pad}px` : undefined,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <button
                      ref={(el) => {
                        nodeRefs.current[lv] = el;
                      }}
                      className={`story-node ${nodeClass}`}
                      disabled={!unlocked || !game.available}
                      onClick={() => game.available && setActiveLevelModal(lv)}
                      title={!game.available && unlocked ? 'Em breve' : undefined}
                      style={{ opacity: !game.available && unlocked ? 0.55 : undefined }}
                    >
                      {!unlocked ? (
                        <>
                          <span className="node-icon">🔒</span>
                          <span className="node-num-sm">{lv}</span>
                        </>
                      ) : (
                        <>
                          <span className="node-num">{lv}</span>
                          {star}
                        </>
                      )}
                    </button>
                    <div className={`story-label ${!unlocked ? 'label-locked' : ''} ${isCurrent ? 'label-current' : ''}`}>
                      {game.name}
                      {!game.available && unlocked && <span className="story-soon-badge">Em breve</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* MODAL: Story Intro */}
      <div className={`modal-overlay ${!introSeen ? 'visible' : ''}`} id="modal-story-intro">
        <div className="modal-card">
          <span className="modal-icon">📖</span>
          <h2 className="modal-title">Modo História</h2>
          <p className="modal-body">Explore os 21 jogos em sequência, como proposto no livro. Cada nível apresenta uma nova mecânica, evoluindo gradualmente a complexidade.</p>
          <div className="modal-list">
            <div className="modal-list-item">
              <span>🌱</span>
              <span><strong>Fácil</strong> — Pratique sem pressão, quantas vezes quiser</span>
            </div>
            <div className="modal-list-item">
              <span>⚡</span>
              <span><strong>Médio</strong> — Derrote a IA para desbloquear o próximo nível</span>
            </div>
            <div className="modal-list-item">
              <span>🔑</span>
              <span><strong>Código</strong> — Anote o código ao vencer para recuperar o progresso em outro dispositivo</span>
            </div>
          </div>
          <button className="btn-primary" onClick={handleAcceptIntro}>Começar</button>
        </div>
      </div>

      {/* MODAL: Level detail */}
      {selectedGameModal && (
        <div className="modal-overlay visible" id="modal-level-detail">
          <div className="modal-card">
            <div className="modal-level-header">
              <div className="modal-level-badge">{selectedGameModal.num}</div>
              <div>
                <h2 className="modal-lv-title">{selectedGameModal.name}</h2>
                {selectedGameModal.origin && <p className="modal-origin">📍 {selectedGameModal.origin}</p>}
              </div>
            </div>
            
            <div id="modal-lv-status" style={{ marginTop: '8px' }}>
              {isMedDone ? (
                <span className="lv-badge badge-done">★ Concluído</span>
              ) : isEasyDone ? (
                <span className="lv-badge badge-easy">☆ Praticado</span>
              ) : null}
            </div>

            <p className="modal-body">{selectedGameModal.description}</p>
            
            <div className="modal-rules-block">
              <div className="modal-rules-label">Como jogar</div>
              <p className="modal-rules">{LEVEL_RULES[selectedGameModal.num] || ''}</p>
            </div>

            <div className="piece-choice">
              <span className="piece-choice-label">Jogar com</span>
              <div className="piece-btns">
                <button
                  className={`piece-btn ${!playAsDark ? 'active' : ''}`}
                  onClick={() => setPlayAsDark(false)}
                >
                  ⬜ Claras
                </button>
                <button
                  className={`piece-btn ${playAsDark ? 'active' : ''}`}
                  onClick={() => setPlayAsDark(true)}
                >
                  ⬛ Escuras
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => startLevel('easy')}>
                🌱 Praticar (Fácil)
              </button>
              <button className="btn-primary" onClick={() => startLevel('medium')}>
                ⚡ Avançar (Médio)
              </button>
            </div>
            
            <button className="btn-text" onClick={() => setActiveLevelModal(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Code entry */}
      <div className={`modal-overlay ${codeModalVisible ? 'visible' : ''}`} id="modal-code-entry">
        <div className="modal-card">
          <span className="modal-icon">🔑</span>
          <h2 className="modal-title">Inserir Código</h2>
          <p className="modal-body">Cole o código recebido ao concluir um nível para recuperar seu progresso em outro dispositivo.</p>
          <input
            type="text"
            className="code-input"
            placeholder="XXXX"
            maxLength={4}
            value={codeInputValue}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
              setCodeInputValue(clean);
              setCodeError('');
            }}
            autoComplete="off"
            spellCheck="false"
          />
          {codeError && <p className="code-error" style={{ display: 'block' }}>{codeError}</p>}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => { setCodeModalVisible(false); setCodeInputValue(''); setCodeError(''); }}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleCodeSubmit} disabled={codeInputValue.length !== 4}>
              Desbloquear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <React.Suspense fallback={
      <div className="screen active" style={{ display: 'block' }}>
        <div className="story-wrapper">
          <div className="story-topbar">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-back">Voltar</button>
            </Link>
            <h2 className="story-topbar-title">Modo História</h2>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>
            Carregando mapa...
          </div>
        </div>
      </div>
    }>
      <StoryContent />
    </React.Suspense>
  );
}
