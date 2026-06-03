# CLAUDE.md

This file provides guidance for development in this repository.

## Project Structure

This project is configured as a Next.js monorepo with a Python Flask serverless backend:
- **Frontend (Next.js + TS)**: Located in `frontend/`. Implements the user interface, SVG board renderers, and game state hooks.
- **Backend (Python + Flask)**: Located in `frontend/api/`. Serverless functions routing to `api/index.py`. Implements core game rules, Minimax AI, and unlock codes.
- **Notebooks (Jupyter)**: Located in `notebooks/`. Documentation and analysis of Minimax theory, decision trees, heuristics, and performance.

## Commands Reference

### Backend Commands (run inside `frontend/`)
- **Install dependencies**: `pip install flask flask-cors pytest`
- **Run Flask server locally**: `python api/index.py` (runs on `http://localhost:5000`)
- **Run backend tests**: `python -m pytest api/tests/test_games.py -v`

### Frontend Commands (run inside `frontend/`)
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev` (runs on `http://localhost:3000`)
- **Build production bundle**: `npm run build`
- **Lint code**: `npm run lint`

### Port Settings
- Flask Backend: Port `5000` (e.g. `http://localhost:5000`)
- Next.js Frontend: Port `3000` (e.g. `http://localhost:3000`)

