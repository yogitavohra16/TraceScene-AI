# Backend Dockerfile - see Section 40 of the PRD
FROM python:3.11-slim

WORKDIR /app

# System deps kept minimal on purpose (hackathon-scope image, not hardened prod image)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DJANGO_SETTINGS_MODULE=config.settings
EXPOSE 8000

# entrypoint.sh runs migrations then starts gunicorn, so `docker compose up`
# is a true one-command start (Section 38/39 requirement).
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]
