"""
Central registry of all 21 games (+ bonus).

Converted from js/games/registry.js
"""
from games.tic_tac_toe import TicTacToe
from games.game2_free_move import FreeMove
from games.game3_tapatan import Tapatan
from games.game4_shisima import Shisima
from games.game5_tsoro import TsoroYematatu
from games.game6_placement_free import ColMaisLivre
from games.game7_achi4 import Achi4
from games.game8_achi3 import Achi3
from games.game9_placement_center import ColMaisCentro
from games.game10_placement_jump import ColMaisSalto
from games.game11_mu_torere_v1 import MuTorereV1
from games.game12_mu_torere_v2 import MuTorereV2
from games.game13_mu_torere_v3 import MuTorereV3
from games.game14_amazonas_v1 import AmazonasV1
from games.game15_amazonas_v2 import AmazonasV2
from games.game16_amazonas_v3 import AmazonasV3
from games.game17_amazonas_v4 import AmazonasV4
from games.game18_desafio_tapatan import DesafioTapatan
from games.game19_desafio_cavalo_v1 import DesafioCavaloV1
from games.game20_desafio_cavalo_v2 import DesafioCavaloV2
from games.game21_desafio_cavalo_v3 import DesafioCavaloV3

# Map of game_id → game class
_GAME_CLASSES = {
    "tictactoe":         TicTacToe,
    "free-move":         FreeMove,
    "tapatan":           Tapatan,
    "shisima":           Shisima,
    "tsoro-yematatu":    TsoroYematatu,
    "placement-free-move": ColMaisLivre,
    "achi":              Achi4,
    "achi3":             Achi3,
    "placement-center":  ColMaisCentro,
    "placement-jump":    ColMaisSalto,
    "mu-torere-1":       MuTorereV1,
    "mu-torere-2":       MuTorereV2,
    "mu-torere-3":       MuTorereV3,
    "amazonas-1":        AmazonasV1,
    "amazonas-2":        AmazonasV2,
    "amazonas-3":        AmazonasV3,
    "amazonas-4":        AmazonasV4,
    "desafio-tapatan":   DesafioTapatan,
    "desafio-cavalo-1":  DesafioCavaloV1,
    "desafio-cavalo-2":  DesafioCavaloV2,
    "desafio-cavalo-3":  DesafioCavaloV3,
}

GAMES = [
    # ─── ALINHAMENTO: Apenas Colocação ──────────────────────────
    {
        "id": "tictactoe", "num": 1,
        "name": "Jogo da Velha", "name_alt": "Tic-Tac-Toe",
        "category": "Alinhamento", "subcategory": "Apenas Colocação",
        "origin": "Tradicional mundial",
        "description": "O clássico! Coloque peças alternadamente e seja o primeiro a alinhar três.",
        "available": True,
    },
    # ─── ALINHAMENTO: Apenas Movimentação ───────────────────────
    {
        "id": "free-move", "num": 2,
        "name": "Movimento Livre", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Apenas Movimentação",
        "origin": None,
        "description": "Peças já posicionadas. Qualquer peça pode mover para qualquer posição livre.",
        "available": True,
    },
    {
        "id": "tapatan", "num": 3,
        "name": "Tapatan", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Apenas Movimentação",
        "origin": "Indonésia / Filipinas",
        "description": "Peças movem para posições vizinhas livres pelas linhas do tabuleiro.",
        "available": True,
    },
    {
        "id": "shisima", "num": 4,
        "name": "Shisima", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Apenas Movimentação",
        "origin": "Quênia",
        "description": "Como Tapatan, mas o alinhamento vitorioso deve passar pelo centro.",
        "available": True,
    },
    {
        "id": "tsoro-yematatu", "num": 5,
        "name": "Tsoro Yematatu", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Apenas Movimentação",
        "origin": "Zimbábue",
        "description": "Além de mover para vizinhos, permite saltar sobre peças em linha reta.",
        "available": True,
    },
    # ─── ALINHAMENTO: Colocação e Movimentação ──────────────────
    {
        "id": "placement-free-move", "num": 6,
        "name": "Colocação + Livre", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Colocação e Movimentação",
        "origin": None,
        "description": "Fase de colocação seguida de movimentação livre para qualquer posição vazia.",
        "available": True,
    },
    {
        "id": "achi", "num": 7,
        "name": "Achi", "name_alt": "4 peças",
        "category": "Alinhamento", "subcategory": "Colocação e Movimentação",
        "origin": "Gana",
        "description": "Cada jogador tem 4 peças. Fase de colocação, depois movimentação pelas linhas.",
        "available": True,
    },
    {
        "id": "achi3", "num": 8,
        "name": "Achi (3 peças)", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Colocação e Movimentação",
        "origin": "Gana",
        "description": "Versão do Achi com 3 peças por jogador — mais dinâmico e veloz.",
        "available": True,
    },
    {
        "id": "placement-center", "num": 9,
        "name": "Colocação + Centro", "name_alt": None,
        "category": "Alinhamento", "subcategory": "Colocação e Movimentação",
        "origin": None,
        "description": "Colocação seguida de movimentação; alinhamento válido deve passar pelo centro.",
        "available": True,
    },
    {
        "id": "placement-jump", "num": 10,
        "name": "Colocação + Salto", "name_alt": "Tsoro style",
        "category": "Alinhamento", "subcategory": "Colocação e Movimentação",
        "origin": "Zimbábue",
        "description": "Colocação seguida de movimentação com saltos — regras do Tsoro Yematatu.",
        "available": True,
    },
    # ─── BLOQUEIO: Mu Torere ────────────────────────────────────
    {
        "id": "mu-torere-1", "num": 11,
        "name": "Mu Torere (V1)", "name_alt": None,
        "category": "Bloqueio", "subcategory": "Mu Torere",
        "origin": "Nova Zelândia (Maori)",
        "description": "Peças dispostas alternadamente. Mova pelas linhas do tabuleiro. Quem não conseguir mover perde.",
        "available": True,
    },
    {
        "id": "mu-torere-2", "num": 12,
        "name": "Mu Torere (V2)", "name_alt": None,
        "category": "Bloqueio", "subcategory": "Mu Torere",
        "origin": "Nova Zelândia (Maori)",
        "description": "Fase de colocação (4 peças cada), depois movimentação pelas linhas. Quem não conseguir mover perde.",
        "available": True,
    },
    {
        "id": "mu-torere-3", "num": 13,
        "name": "Mu Torere (V3)", "name_alt": "Original",
        "category": "Bloqueio", "subcategory": "Mu Torere",
        "origin": "Nova Zelândia (Maori)",
        "description": "Posição inicial alternada. Nos primeiros 2 lances de cada jogador, é proibido mover para o centro.",
        "available": True,
    },
    # ─── BLOQUEIO: Amazonas ─────────────────────────────────────
    {"id": "amazonas-1", "num": 14, "name": "Amazonas (V1)", "name_alt": "1 peça", "category": "Bloqueio", "subcategory": "Amazonas", "origin": "Argentina (adaptado)", "description": "Mova sua peça e lance uma peça de bloqueio. Quem ficar preso perde.", "available": True},
    {"id": "amazonas-2", "num": 15, "name": "Amazonas (V2)", "name_alt": "2 peças", "category": "Bloqueio", "subcategory": "Amazonas", "origin": "Argentina (adaptado)", "description": "Cada jogador com 2 peças pré-posicionadas. Jogo mais complexo.", "available": True},
    {"id": "amazonas-3", "num": 16, "name": "Amazonas (V3)", "name_alt": "1 peça, fora", "category": "Bloqueio", "subcategory": "Amazonas", "origin": "Argentina (adaptado)", "description": "Peça começa fora; o primeiro lance é posicioná-la. Mais estratégia inicial.", "available": True},
    {"id": "amazonas-4", "num": 17, "name": "Amazonas (V4)", "name_alt": "2 peças, fora", "category": "Bloqueio", "subcategory": "Amazonas", "origin": "Argentina (adaptado)", "description": "Duas peças fora do tabuleiro. Fase de colocação + movimentação com bloqueio.", "available": True},
    # ─── DESAFIOS INDIVIDUAIS ──────────────────────────────────
    {"id": "desafio-tapatan", "num": 18, "name": "Desafio: Troca de Lado", "name_alt": "Tapatan", "category": "Desafio", "subcategory": "Individual", "origin": None, "description": "Troque as peças de lado no menor número de movimentos. Movimento Tapatan.", "available": True},
    {"id": "desafio-cavalo-1", "num": 19, "name": "Desafio: Cavalo (1)", "name_alt": "1 peça", "category": "Desafio", "subcategory": "Individual", "origin": None, "description": "Troque 1 peça de cada lado usando o movimento do Cavalo do Xadrez.", "available": True},
    {"id": "desafio-cavalo-2", "num": 20, "name": "Desafio: Cavalo (2)", "name_alt": "2 peças", "category": "Desafio", "subcategory": "Individual", "origin": None, "description": "Troque 2 peças de cada lado usando o movimento do Cavalo do Xadrez.", "available": True},
    {"id": "desafio-cavalo-3", "num": 21, "name": "Desafio: Cavalo (3)", "name_alt": "3 peças", "category": "Desafio", "subcategory": "Individual", "origin": None, "description": "Troque 3 peças de cada lado usando o movimento do Cavalo do Xadrez.", "available": True},
]

BONUS_GAMES = [
    {"id": "ultimate-ttt", "name": "Ultimate Tic-Tac-Toe", "description": "Nove partidas simultâneas! Sua jogada determina em qual tabuleiro o adversário joga.", "available": False},
    {"id": "ultimate-amazonas", "name": "Ultimate Amazonas", "description": "A dinâmica do Ultimate aplicada ao jogo de bloqueio Amazonas.", "available": False},
]

CATEGORIES = [
    {"id": "Alinhamento", "icon": "⊞", "label": "Jogos de Alinhamento", "subcategories": ["Apenas Colocação", "Apenas Movimentação", "Colocação e Movimentação"]},
    {"id": "Bloqueio", "icon": "🚧", "label": "Jogos de Bloqueio", "subcategories": ["Mu Torere", "Amazonas"]},
    {"id": "Desafio", "icon": "🧩", "label": "Desafios Individuais", "subcategories": ["Individual"]},
]


def get_game_class(game_id: str):
    """Returns an instance of the game class for the given game_id."""
    cls = _GAME_CLASSES.get(game_id)
    if cls is None:
        raise ValueError(f"Unknown game_id: {game_id}")
    return cls()
