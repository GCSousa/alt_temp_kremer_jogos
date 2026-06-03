# CLAUDE.md

This file provides guidance for development in this repository.

## Project Structure

This project has been migrated to a full-stack architecture:
- **Backend (Python + Flask)**: Located in `backend/`. Implements core game rules, Minimax AI engine, and story unlock codes.
- **Frontend (Next.js + TS)**: Located in `frontend/`. Implements the user interface, SVG board renderers, and game state hooks.
- **Notebooks (Jupyter)**: Located in `notebooks/`. Documentation and analysis of Minimax theory, decision trees, heuristics, and performance.

## Commands Reference

### Backend Commands
- **Install dependencies**: `pip install flask flask-cors pytest`
- **Run Flask server**: `python app.py` (runs on `http://localhost:5000`)
- **Run backend tests**: `python -m pytest tests/test_games.py -v`

### Frontend Commands
- **Install dependencies**: `npm install` inside `frontend/`
- **Run dev server**: `npm run dev`
- **Build production bundle**: `npm run build`
- **Lint code**: `npm run lint`

### Port Settings
- Flask Backend: Port `5000` (e.g. `http://localhost:5000`)
- Next.js Frontend: Port `3000` (e.g. `http://localhost:3000`)
