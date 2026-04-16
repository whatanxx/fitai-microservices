FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations and start app
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}
