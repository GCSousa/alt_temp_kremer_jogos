# Migração: 21 Jogos Lógicos → Next.js + Python Backend

Converter o projeto de Vanilla JS (SPA estática, GitHub Pages) para uma arquitetura full-stack moderna:
- **Frontend**: Next.js (React) — renderização de telas, SVG boards, interatividade
- **Backend**: Python (Flask ou Django) — lógica dos jogos, IA Minimax, API REST
- **Notebooks**: Jupyter Notebooks para análise e documentação dos algoritmos

---

## User Review Required

> [!IMPORTANT]
> **Flask vs Django — Avaliação e Recomendação**
>
> Analisei ambos os frameworks em profundidade para este projeto. Veja a comparação abaixo.

### Flask vs Django — Comparação Técnica

| Critério | Flask | Django |
|---|---|---|
| **Complexidade do projeto** | ✅ Ideal para APIs enxutas — este projeto tem ~8 endpoints | ❌ Overkill — admin panel, ORM, auth não são necessários |
| **Banco de dados** | Não precisa (progresso fica no `localStorage` do browser) | Django **exige** BD mesmo sem usar (migrations, models) |
| **Tamanho do boilerplate** | Mínimo — 1 arquivo pode servir a API inteira | Pesado — `manage.py`, `settings.py`, 15+ arquivos de config |
| **Curva de aprendizado** | Baixa — funciona como "funções → rotas" | Alta — precisa entender ORM, middlewares, template engine |
| **Performance p/ IA** | Igual — ambos usam Python puro | Igual |
| **Notebooks** | ✅ Integra fácil (import direto dos módulos) | ✅ Igual |
| **Deploy futuro** | Railway, Render, Vercel Serverless — simples | Precisa de mais configuração |
| **Escalabilidade** | Suficiente para este projeto | Vantagem apenas se houver users, auth, admin |

> [!TIP]
> **Recomendação: Flask** 🏆
>
> Este projeto não tem banco de dados, não tem autenticação, não tem painel admin. A lógica toda é computacional (minimax, game rules).
> Flask é a escolha certa — leve, direto, sem boilerplate. Django seria como usar um canhão para matar uma mosca.
>
> **Quando Django faria sentido?** Se no futuro houver: ranking online, contas de usuário, multiplayer com WebSockets, painel de administração de jogos. Aí migraríamos para Django ou FastAPI.

---

## Open Questions

> [!IMPORTANT]
> **1. Renderização SVG — onde rodar?**
> Atualmente os tabuleiros são renderizados como SVG via JavaScript no browser (DOM manipulation).
> - **Opção A (Recomendada):** Manter a renderização SVG no frontend (React/Next.js) — é mais fluido para drag & drop, animações, hover effects
> - **Opção B:** Gerar SVG no backend Python e enviar como string — perdemos interatividade em tempo real
>
> Minha recomendação é **Opção A**: o frontend React gera o SVG com os mesmos gradientes/animações, e o backend Python cuida apenas da **lógica** (validar moves, calcular IA, checar resultado).

> [!IMPORTANT]
> **2. Progresso do Modo História**
> Atualmente salvo em `localStorage`. Com backend Python, temos duas opções:
> - **Opção A:** Manter no `localStorage` (sem banco de dados) — funciona offline
> - **Opção B:** Mover para o backend com SQLite — permite sincronização entre dispositivos
>
> Recomendo **Opção A** por simplicidade (manter como está), já que o sistema de códigos de desbloqueio já resolve a portabilidade.

> [!IMPORTANT]
> **3. Escopo da conversão JS → Python**
> Há 13 jogos implementados em JS + engine (GameBase, MinimaxAI) + 3 base classes (Movement, PlacementMovement, Blocking). Confirma que quer converter **todos os 13** para Python, ou prefere começar só com os primeiros e ir expandindo?

---

## Proposed Changes

### Estrutura de Diretórios Proposta

```
21_jogos_tabuleiro/
├── frontend/                          # Next.js app
│   ├── package.json
│   ├── next.config.js
│   ├── public/
│   ├── src/
│   │   ├── app/                       # App Router (Next.js 14+)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Home screen
│   │   │   ├── globals.css            # Design system (migrado do style.css)
│   │   │   ├── setup/
│   │   │   │   └── [gameId]/page.tsx  # Setup screen
│   │   │   ├── game/
│   │   │   │   └── [gameId]/page.tsx  # Game screen
│   │   │   └── story/
│   │   │       └── page.tsx           # Story mode screen
│   │   ├── components/
│   │   │   ├── ui/                    # Botões, modais, badges
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Badge.tsx
│   │   │   ├── board/                 # Renderers SVG
│   │   │   │   ├── TicTacToeBoard.tsx
│   │   │   │   ├── TapatanBoard.tsx
│   │   │   │   └── BoardWrapper.tsx
│   │   │   ├── game/                  # UI do jogo
│   │   │   │   ├── PlayersBar.tsx
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   └── WinOverlay.tsx
│   │   │   ├── home/
│   │   │   │   ├── GameCard.tsx
│   │   │   │   └── CategoryBlock.tsx
│   │   │   └── story/
│   │   │       ├── StoryMap.tsx
│   │   │       └── StoryPath.tsx
│   │   ├── hooks/
│   │   │   ├── useGame.ts             # Game state management
│   │   │   └── useStory.ts            # Story progress
│   │   ├── lib/
│   │   │   ├── api.ts                 # Chamadas ao backend Flask
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── registry.ts           # Game registry (metadata only)
│   │   └── stores/
│   │       └── gameStore.ts           # Zustand/context state
│   └── tsconfig.json
│
├── backend/                           # Flask API
│   ├── requirements.txt
│   ├── app.py                         # Flask entry point + routes
│   ├── config.py                      # Configurações
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── game_base.py               # ABC — classe base de todos os jogos
│   │   └── minimax_ai.py             # Alpha-beta minimax genérico
│   ├── games/
│   │   ├── __init__.py
│   │   ├── registry.py               # Dict dos 21 jogos
│   │   ├── tic_tac_toe.py            # Jogo 1
│   │   ├── movement_game_base.py     # Base: jogos 2-5
│   │   ├── game2_free_move.py        # Jogo 2
│   │   ├── game3_tapatan.py          # Jogo 3
│   │   ├── game4_shisima.py          # Jogo 4
│   │   ├── game5_tsoro.py            # Jogo 5
│   │   ├── placement_movement_base.py # Base: jogos 6-10
│   │   ├── game6_placement_free.py   # Jogo 6
│   │   ├── game7_achi4.py            # Jogo 7
│   │   ├── game8_achi3.py            # Jogo 8
│   │   ├── game9_placement_center.py # Jogo 9
│   │   ├── game10_placement_jump.py  # Jogo 10
│   │   ├── blocking_game_base.py     # Base: jogos 11-13
│   │   ├── game11_mu_torere_v1.py    # Jogo 11
│   │   ├── game12_mu_torere_v2.py    # Jogo 12
│   │   └── game13_mu_torere_v3.py    # Jogo 13
│   ├── utils/
│   │   ├── __init__.py
│   │   └── codes.py                   # Geração/verificação de códigos
│   └── tests/
│       ├── __init__.py
│       ├── test_tic_tac_toe.py
│       ├── test_minimax.py
│       └── test_games.py
│
├── notebooks/                         # Jupyter Notebooks
│   ├── 01_game_theory_intro.ipynb     # Teoria dos jogos — minimax explicado
│   ├── 02_minimax_visualization.ipynb # Visualização da árvore de decisão
│   ├── 03_game_analysis.ipynb         # Análise de cada jogo (branching factor, etc)
│   ├── 04_ai_performance.ipynb        # Benchmarks da IA por jogo e profundidade
│   └── 05_board_heuristics.ipynb      # Heurísticas de avaliação
│
├── CLAUDE.md                          # Atualizado
├── GAMES.md                           # Mantido
├── CODES.md                           # Mantido
├── README.md                          # Atualizado
└── LICENSE
```

---

### Backend — Flask API

#### [NEW] [app.py](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/backend/app.py)

Entry point do Flask. Rotas da API REST:

```
POST /api/game/start          → Iniciar nova partida (retorna state inicial)
POST /api/game/move           → Aplicar jogada humana + validar
POST /api/game/ai-move        → Pedir jogada da IA (minimax)
GET  /api/game/valid-moves    → Listar movimentos válidos p/ um state
GET  /api/game/check-result   → Verificar se jogo acabou
GET  /api/games               → Listar todos os jogos disponíveis
POST /api/story/verify-code   → Verificar código de desbloqueio
POST /api/story/generate-code → Gerar código para um nível
```

**Cada request/response é JSON stateless** — o state do jogo viaja no body do request.

---

#### [NEW] [engine/game_base.py](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/backend/engine/game_base.py)

Conversão direta do [GameBase.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/engine/GameBase.js) para Python:

```python
from abc import ABC, abstractmethod
import json, copy

class GameBase(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def description(self) -> str: ...

    @property
    def origin(self) -> str | None:
        return None

    @property
    @abstractmethod
    def board_config(self) -> dict: ...

    @abstractmethod
    def get_initial_state(self) -> dict: ...

    @abstractmethod
    def get_valid_moves(self, state: dict) -> list: ...

    @abstractmethod
    def apply_move(self, state: dict, move) -> dict: ...

    @abstractmethod
    def check_result(self, state: dict) -> dict: ...

    @abstractmethod
    def evaluate(self, state: dict) -> int: ...

    def clone_state(self, state: dict) -> dict:
        return copy.deepcopy(state)
```

---

#### [NEW] [engine/minimax_ai.py](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/backend/engine/minimax_ai.py)

Conversão do [MinimaxAI.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/engine/MinimaxAI.js):

```python
import random, math

DIFFICULTY = {
    'easy':   {'depth': 1, 'label': 'Fácil',   'icon': '🌱', 'randomize': True},
    'medium': {'depth': 3, 'label': 'Médio',   'icon': '⚡', 'randomize': True},
    'hard':   {'depth': 9, 'label': 'Difícil', 'icon': '💀', 'randomize': False},
}

class MinimaxAI:
    def __init__(self, game, max_depth, randomize=True):
        self.game = game
        self.max_depth = max_depth
        self.randomize = randomize

    def get_best_move(self, state):
        # Alpha-beta pruning — mesma lógica do JS
        ...
```

---

#### [NEW] Jogos em Python (13 arquivos)

Cada jogo JS será convertido 1:1 para Python. Exemplo do mapeamento:

| JavaScript | Python | Classe |
|---|---|---|
| [TicTacToe.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/TicTacToe.js) | `tic_tac_toe.py` | `TicTacToe(GameBase)` |
| [MovementGameBase.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/MovementGameBase.js) | `movement_game_base.py` | `MovementGameBase(GameBase)` |
| [Game2.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game2.js) | `game2_free_move.py` | `FreeMove(MovementGameBase)` |
| [Game3.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game3.js) | `game3_tapatan.py` | `Tapatan(MovementGameBase)` |
| [Game4.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game4.js) | `game4_shisima.py` | `Shisima(MovementGameBase)` |
| [Game5.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game5.js) | `game5_tsoro.py` | `TsoroYematatu(MovementGameBase)` |
| [PlacementMovementBase.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/PlacementMovementBase.js) | `placement_movement_base.py` | `PlacementMovementBase(GameBase)` |
| [Game6.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game6.js) → [Game10.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game10.js) | `game6-10_*.py` | Extends PlacementMovementBase |
| [BlockingGameBase.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/BlockingGameBase.js) | `blocking_game_base.py` | `BlockingGameBase(GameBase)` |
| [Game11.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game11.js) → [Game13.js](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/js/games/Game13.js) | `game11-13_*.py` | Extends BlockingGameBase |

---

### Frontend — Next.js

#### [NEW] Projeto Next.js em `frontend/`

- Inicializado com `npx -y create-next-app@latest ./` (TypeScript, App Router, sem Tailwind)
- CSS migrado do [style.css](file:///c:/Users/Sousa/Desktop/codigo%20pessoal/Nova%20pasta%20(2)/21_jogos_tabuleiro/css/style.css) atual (1623 linhas) para `globals.css` + CSS Modules por componente
- Todas as custom properties mantidas (cores, tipografia, espaçamentos)
- Google Fonts (Inter + Cinzel) carregadas via `next/font`

#### Componentes React (conversão do HTML/JS)

| HTML/JS Atual | Componente React |
|---|---|
| `#screen-home` + `buildHomeScreen()` | `page.tsx` + `GameCard.tsx` + `CategoryBlock.tsx` |
| `#screen-setup` + `openSetup()` | `setup/[gameId]/page.tsx` |
| `#screen-game` + game loop | `game/[gameId]/page.tsx` + `useGame` hook |
| `#screen-story` + story.js | `story/page.tsx` + `StoryMap.tsx` |
| SVG renderers (TicTacToe, Tapatan) | `board/TicTacToeBoard.tsx`, `board/TapatanBoard.tsx` |
| Modais (story intro, level, code) | `ui/Modal.tsx` (reutilizável) |
| Win overlay | `game/WinOverlay.tsx` |

#### Hook `useGame` — Fluxo de comunicação com o backend

```typescript
// hooks/useGame.ts
export function useGame(gameId: string) {
  // 1. POST /api/game/start → recebe state inicial
  // 2. Humano clica → POST /api/game/move → recebe new state + result
  // 3. Se vs IA → POST /api/game/ai-move → recebe move + new state
  // 4. Loop até result.over === true
}
```

---

### Notebooks

#### [NEW] `notebooks/` — 5 Jupyter Notebooks

| Notebook | Conteúdo |
|---|---|
| `01_game_theory_intro.ipynb` | Introdução à teoria dos jogos, explicação do Minimax com exemplos visuais |
| `02_minimax_visualization.ipynb` | Visualização da árvore de decisão da IA (Jogo da Velha como exemplo), usando graphviz/matplotlib |
| `03_game_analysis.ipynb` | Análise de cada jogo: branching factor, game tree size, complexidade teórica |
| `04_ai_performance.ipynb` | Benchmarks: tempo de resposta por jogo × profundidade, % de vitórias vs jogadas aleatórias |
| `05_board_heuristics.ipynb` | Avaliação de heurísticas de posição para jogos de bloqueio (mobilidade, controle do centro) |

Todos os notebooks importam diretamente os módulos Python de `backend/engine/` e `backend/games/`.

---

## Plano de Execução (Ordem)

### Fase 1 — Backend Python (Core)
1. Criar estrutura `backend/`
2. Implementar `engine/game_base.py` + `engine/minimax_ai.py`
3. Converter os 13 jogos JS → Python
4. Implementar `games/registry.py`
5. Implementar `utils/codes.py` (gerar/verificar códigos)
6. Testes unitários para todos os jogos + IA

### Fase 2 — API Flask
7. Criar `app.py` com Flask + rotas REST
8. Testar endpoints via curl/Postman
9. Configurar CORS para comunicação com Next.js

### Fase 3 — Frontend Next.js
10. Inicializar projeto Next.js
11. Migrar design system (CSS custom properties, layout)
12. Criar componentes React (home, setup, game, story)
13. Migrar renderers SVG para React (JSX)
14. Implementar `useGame` hook (comunicação com API)
15. Implementar `useStory` hook (localStorage + API codes)

### Fase 4 — Notebooks
16. Criar os 5 notebooks com documentação e visualizações

### Fase 5 — Polish
17. Testes end-to-end (frontend + backend)
18. README atualizado
19. Docker Compose (opcional, para dev fácil)

---

## Verification Plan

### Automated Tests

```bash
# Backend: rodar testes unitários
cd backend
python -m pytest tests/ -v

# Frontend: build check
cd frontend
npm run build

# API: smoke test
curl -X POST http://localhost:5000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"game_id": "tictactoe"}'
```

### Validação Funcional
- Cada jogo Python deve produzir **exatamente o mesmo resultado** que o JS para as mesmas sequências de jogadas
- IA no Python deve escolher **a mesma jogada** que o JS quando `randomize=false` e `depth=9`
- Notebook 04 deve confirmar que a IA Python não é significativamente mais lenta que a JS

### Manual Verification
- Jogar cada um dos 13 jogos no frontend Next.js vs IA Python
- Verificar drag & drop nos jogos de movimentação
- Testar Modo História completo (progressão, códigos, desbloqueio)
