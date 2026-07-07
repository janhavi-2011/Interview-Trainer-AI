#!/bin/bash

echo "Loading knowledge base..."
python load_knowledge_base.py

echo "Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}