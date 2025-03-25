FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Copy code and install Python deps
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY server/ .

# Expose Flask port
EXPOSE 5000

# Run Flask via Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "wsgi:app"]
