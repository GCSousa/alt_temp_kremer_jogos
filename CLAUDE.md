# CLAUDE.md

This file provides guidance for development in this repository.

## Project Structure

This project is configured as a flat Next.js application with a Python Flask serverless backend at the root level:
- **Frontend (Next.js + TS)**: Located directly in the root directory (`src/`, `public/`, `package.json`, etc.).
- **Backend (Python + Flask)**: Located in the `api/` directory (`api/index.py`, `api/engine/`, `api/games/`, etc.).
- **Notebooks (Jupyter)**: Located in `notebooks/`. Documentation and analysis of Minimax theory, decision trees, heuristics, and performance.

## Commands Reference

### Running Locally
- **Install dependencies**: `npm install` and `pip install flask flask-cors pytest`
- **Run frontend locally**: `npm run dev` (runs Next.js on `http://localhost:3000`)
- **Run backend locally**: `python api/index.py` (runs Flask on `http://localhost:5000`)
- **Run backend tests**: `python -m pytest api/tests/test_games.py -v`
- **Build frontend**: `npm run build`
- **Lint code**: `npm run lint`

### Port Settings
- Next.js Frontend: Port `3000` (e.g. `http://localhost:3000`)
- Flask Backend: Port `5000` (e.g. `http://localhost:5000`)


