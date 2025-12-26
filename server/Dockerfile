FROM python:3.12-slim

# Set workdir
WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir uv

# Copy pyproject.toml and install dependencies
COPY pyproject.toml .
RUN uv pip install --system .

# Copy backend source
COPY . .

# Create necessary directories
RUN mkdir -p logs db

# Expose Flask port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Run Flask via Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5001", "main:app"]