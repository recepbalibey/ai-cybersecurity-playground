FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy full repo (datasets/, knowledge/ must be at repo root for __file__-relative paths)
COPY . .

# Backend working directory
WORKDIR /app/backend

# Non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
