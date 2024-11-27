FROM ubuntu:22.04

# Install Python and other basic dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    netcat-openbsd \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy application files
COPY . .

# Set environment variables
ENV POSTGRES_DB=postgres \
    POSTGRES_USER=postgres.rdjzspdkdgkgngvetvqw \
    POSTGRES_PASSWORD=\#D3t5Xvwtn*eRmRKFVyf\$\#Ws \
    POSTGRES_HOST=aws-0-ap-south-1.pooler.supabase.com \
    POSTGRES_PORT=6543 \
    EMAIL_HOST_USER=your_email \
    EMAIL_HOST_PASSWORD=your_password \
    DEFAULT_FROM_EMAIL=your_email

# Set up backend
RUN pip3 install -r requirements.txt

# Expose port
EXPOSE 8000

# Create startup script with database check
RUN echo '#!/bin/bash\n\
python3 manage.py migrate\n\
python3 manage.py runserver 0.0.0.0:8000' > /app/start.sh \
    && chmod +x /app/start.sh

# Start server
CMD ["/app/start.sh"]
