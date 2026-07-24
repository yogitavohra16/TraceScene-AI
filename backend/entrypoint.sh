#!/bin/sh
# Runs DB migrations then starts the app server. Kept as a tiny shell script
# (rather than baking migrate into the Dockerfile) so `docker compose up`
# always has an up-to-date schema, even after a model change + rebuild.
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput 
gunicorn config.wsgi:application --bind 0.0.0.0:8000
