FROM python:3.12-slim

# Set workdir
WORKDIR /app

# curl is only needed for the HEALTHCHECK; all Python dependencies ship as wheels
# Security updates of the base image are applied at build time.
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir uv

# Install the exact, hash-verified runtime dependencies from uv.lock (no dev tools)
COPY pyproject.toml uv.lock ./
RUN uv export --frozen --no-dev --no-emit-project -o /tmp/requirements.txt \
    && uv pip install --system --no-cache -r /tmp/requirements.txt \
    && rm /tmp/requirements.txt

# Copy backend source
COPY . .

# Create necessary directories
RUN mkdir -p logs db user_data

# Expose Flask port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Run Flask via Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5001", "main:app"]
