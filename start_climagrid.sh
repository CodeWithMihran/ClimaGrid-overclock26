#!/bin/bash
# ==============================================================================
# CLIMAGRID Command Operations Launcher (Linux / macOS)
# ==============================================================================

echo "======================================================================"
echo "   CLIMAGRID // MULTI-HAZARD CLIMATE DISASTER RESILIENCE"
echo "              Starting Full Platform (Overclock '26)"
echo "======================================================================"
echo ""

# 1. Start Backend
echo "[1/3] Starting FastAPI Backend on Port 8000..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "[2/3] Starting Next.js Production Server on Port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "[3/3] Waiting for services to initialize..."
sleep 3

echo ""
echo "======================================================================"
echo " Platform is now operational!"
echo " - Command Operations Center: http://localhost:3000"
echo " - Citizen SOS Mobile Portal: http://localhost:3000/citizen"
echo " - Backend API Swagger Docs:  http://localhost:8000/docs"
echo "======================================================================"
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
