import { useState, useEffect } from 'react';
import { StoryProgress } from '../lib/types';
import { verifyStoryCode } from '../lib/api';

const LS_KEY = 'story_v1';

const INITIAL_PROGRESS: StoryProgress = {
  unlockedUpTo: 1,
  completedMedium: [],
  completedEasy: [],
};

export const LEVEL_RULES: Record<number, string> = {
  1:  'Coloque peças em qualquer célula vazia, alternando turnos. Quem alinhar 3 em linha, coluna ou diagonal vence. Peças não se movem.',
  2:  'As 6 peças já estão posicionadas. Em cada turno, mova qualquer peça sua para qualquer posição vazia do tabuleiro.',
  3:  'As 6 peças já estão posicionadas. Mova uma peça para uma posição vizinha vazia, seguindo as linhas desenhadas no tabuleiro.',
  4:  'Mesmo movimento do Tapatan, mas só vale alinhamento que passe pelo centro (posição b2). Alinhar nas bordas não conta.',
  5:  'Como Tapatan, com uma opção extra: você também pode saltar sobre uma peça adjacente em linha reta pousando na posição seguinte, se estiver vazia.',
  6:  'Fase 1 — Colocação: cada jogador posiciona 3 peças alternadamente. Fase 2 — Movimento: mova qualquer peça sua para qualquer posição vazia.',
  7:  'Fase 1: cada jogador coloca 4 peças. Com 8 peças em 9 posições, quase não há espaço para mover — cada decisão é crítica.',
  8:  'Fase 1: coloque 3 peças livremente. Fase 2: mova para posição vizinha pelas linhas — como Tapatan, mas você escolheu onde começar.',
  9:  'Fase 1: coloque 3 peças. Fase 2: mova para qualquer vazio. Mas atenção: só conta alinhamento que passe pelo centro do tabuleiro.',
  10: 'Fase 1: coloque 3 peças. Fase 2: mova para vizinhos ou salte sobre peças em linha reta — combinando as regras do Achi com as do Tsoro.',
  11: 'Peças alternadas no tabuleiro. Mova uma peça para posição adjacente vazia. Quem não conseguir mover perde. Não há alinhamento.',
  12: 'Fase 1: posicione 4 peças livremente. Fase 2: mova pelas linhas adjacentes. Quem não conseguir mover perde.',
  13: 'Posição inicial em L. Regra especial: nas 2 primeiras jogadas de cada jogador, é proibido mover ao centro do tabuleiro.',
  14: 'Mova sua única peça (rainha) em linha reta por qualquer distância e, de onde parar, atire uma flecha para bloquear uma casa livre. Quem ficar preso perde.',
  15: 'Escolha qual de suas duas peças mover e, em seguida, atire a flecha para bloquear uma casa livre. Quem ficar sem movimentos perde.',
  16: 'Fase 1: coloque sua peça livremente no tabuleiro. Fase 2: jogue movendo e bloqueando normalmente.',
  17: 'Fase 1: posicione suas 2 peças alternadamente nas primeiras 4 jogadas. Fase 2: jogue movendo e bloqueando normalmente.',
  18: 'Desafio individual. Troque a posição de todas as peças de cima com as de baixo usando as linhas do Tapatan no menor número de movimentos.',
  19: 'Desafio individual. Troque a posição de uma única peça clara e uma escura usando movimentos de Cavalo do Xadrez (em L).',
  20: 'Problema de Guarini. Troque a posição das 2 claras de cima com as 2 escuras de baixo usando movimentos de Cavalo.',
  21: 'Desafio de Cavalo complexo. Troque a posição de 3 claras com 3 escuras usando movimentos de Cavalo. Planeje com cuidado.',
};

export function useStory() {
  const [progress, setProgress] = useState<StoryProgress>(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading story progress', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProgress = (newProg: StoryProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(newProg));
    } catch (e) {
      console.error('Error saving story progress', e);
    }
  };

  const markCompleted = (level: number, difficulty: 'easy' | 'medium') => {
    const updated = { ...progress };
    const key = difficulty === 'medium' ? 'completedMedium' : 'completedEasy';
    
    if (!updated[key]) updated[key] = [];
    if (!updated[key].includes(level)) {
      updated[key] = [...updated[key], level];
    }
    
    if (level >= updated.unlockedUpTo) {
      updated.unlockedUpTo = Math.min(level + 1, 21); // Cap at max games
    }
    
    saveProgress(updated);
  };

  const unlockWithCode = async (code: string): Promise<{ success: boolean; level?: number; error?: string }> => {
    try {
      const res = await verifyStoryCode(code);
      if (res.valid && res.level) {
        const updated = { ...progress };
        if (res.level + 1 > updated.unlockedUpTo) {
          updated.unlockedUpTo = Math.min(res.level + 1, 21);
          saveProgress(updated);
        }
        return { success: true, level: res.level };
      }
      return { success: false, error: res.error || 'Código inválido' };
    } catch (e) {
      return { success: false, error: 'Erro ao conectar ao servidor' };
    }
  };

  return {
    progress,
    loading,
    markCompleted,
    unlockWithCode,
    LEVEL_RULES,
  };
}
