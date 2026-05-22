## Sobre

Desenvolvido por um doutorando em Ciência da Computação.

**Nota de desenvolvimento:** este projeto foi criado com assistência do [Claude Code](https://claude.ai/code) (Anthropic).

---

## Tecnologia

Vanilla JavaScript (ES modules), HTML e CSS — sem frameworks, sem build step. Hospedado via GitHub Pages.

A IA usa Minimax com poda alpha-beta em três níveis de dificuldade (fácil, médio, difícil). O algoritmo é genérico e funciona com qualquer jogo da coleção.

---

## Jogos implementados

| # | Jogo | Categoria |
|---|------|-----------|
| 1 | Jogo da Velha | Alinhamento — Colocação |
| 2 | Movimento Livre | Alinhamento — Movimentação |
| 3 | Tapatan | Alinhamento — Movimentação |
| 4 | Shisima | Alinhamento — Movimentação |
| 5 | Tsoro Yematatu | Alinhamento — Movimentação |
| 6 | Colocação + Livre | Alinhamento — Colocação e Movimentação |
| 7 | Achi (4 peças) | Alinhamento — Colocação e Movimentação |
| 8 | Achi (3 peças) | Alinhamento — Colocação e Movimentação |
| 9 | Colocação + Centro | Alinhamento — Colocação e Movimentação |
| 10 | Colocação + Salto | Alinhamento — Colocação e Movimentação |
| 11 | Mu Torere V1 | Bloqueio |
| 12 | Mu Torere V2 | Bloqueio |
| 13 | Mu Torere V3 (Original) | Bloqueio |
| 14–21 | Amazonas e Desafios | Em desenvolvimento |

---

**Demo:** [grkremer.github.io/21_jogos_tabuleiro](https://grkremer.github.io/21_jogos_tabuleiro)

---

## Como rodar localmente

```bash
python -m http.server 8080
```

---

## Citação

Se você usar este projeto em trabalhos acadêmicos (artigos, teses, relatórios técnicos ou material didático), cite-o como:

```bibtex
@software{Kremer_21JogosLogicos,
  author       = {Gustavo Ribeiro Kremer},
  title        = {{21 Jogos Lógicos no Mesmo Tabuleiro}: Webapp Interativo},
  year         = {2025},
  url          = {https://github.com/grkremer/21_jogos_tabuleiro},
  note         = {Baseado no livro de Renato P. Ribas (CMS/Metamorfose, 2025, ISBN 978-65-6144-054-7)},
}
```
