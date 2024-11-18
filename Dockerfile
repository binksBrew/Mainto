FROM ubuntu:22.04

# Install Node.js 18.x and other basic dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    postgresql-server-dev-all \
    python3-dev \
    gcc \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy application files
COPY backend ./backend
COPY frontend ./frontend

# Set up backend
WORKDIR /app/backend
RUN pip3 install -r requirements.txt

# Set up frontend
WORKDIR /app/frontend
RUN npm install

# Set environment variable for frontend
ENV REACT_APP_BACKEND_URL=http://localhost:8000

# Expose ports
EXPOSE 3000 8000

# Create startup script with database check
WORKDIR /app
RUN echo '#!/bin/bash\n\
echo "Waiting for postgres..."\n\
while ! nc -z db 5432; do\n\
  sleep 1\n\
done\n\
echo "PostgreSQL started"\n\
\n\
echo "Environment variables:"\n\
echo "POSTGRES_DB=$POSTGRES_DB"\n\
echo "POSTGRES_USER=$POSTGRES_USER"\n\
echo "POSTGRES_HOST=$POSTGRES_HOST"\n\
echo "POSTGRES_PORT=$POSTGRES_PORT"\n\
\n\
cd /app/backend\n\
python3 manage.py migrate\n\
python3 manage.py runserver 0.0.0.0:8000 &\n\
cd /app/frontend && npm start' > /app/start.sh \
    && chmod +x /app/start.sh

# Install netcat for database checking
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Start both servers
CMD ["/app/start.sh"]
