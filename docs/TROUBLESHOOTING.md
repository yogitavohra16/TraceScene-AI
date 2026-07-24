# Troubleshooting

## Backend

**`ModuleNotFoundError: No module named 'django'` when running `manage.py`**
You haven't activated the virtual environment or installed dependencies.
Run `source venv/bin/activate` (or `venv\Scripts\activate` on Windows),
then `pip install -r requirements.txt`.

**`django.db.utils.OperationalError: no such table`**
Migrations haven't been applied yet. Run `python manage.py migrate`.

**401 Unauthorized on every API call**
The frontend sends `Authorization: Token <key>`. Make sure you've logged in
(`POST /api/v1/auth/login/`) and that the token is stored - check
`localStorage.tracescene_token` in your browser's dev tools.

**Webhook returns 401 `invalid_secret`**
The `X-Signoz-Webhook-Secret` header didn't match the secret saved in
Settings (or `SIGNOZ_WEBHOOK_SECRET` in `.env` on first boot). Either update
the SigNoz alert channel's header, or clear the webhook secret in Settings
if you don't need this check during local development.

**Evidence/Timeline/Finding stay empty after creating a Case**
Correlation runs on a background thread and can take a few seconds; the
frontend polls every 5 seconds while the case is `investigating`. If SigNoz
isn't running, `SigNozClient` falls back to demo evidence automatically -
check the backend logs for a `SigNoz unreachable ... using demo fallback
evidence` warning to confirm this is what happened.

**`ConnectionError` when testing the SigNoz connection in Settings**
This is expected if you haven't started `docker-compose.signoz.yml` yet, or
if `SIGNOZ_BASE_URL` points somewhere unreachable. The rest of the product
still works via the fallback evidence generator described above.

## Frontend

**Blank page / "Failed to fetch" errors in the console**
Check `VITE_API_BASE_URL` in `frontend/.env` points at your running backend
(default `http://localhost:8000/api/v1`), and that the backend is actually
running.

**CORS error in the browser console**
Add your frontend's origin to `CORS_ALLOWED_ORIGINS` in `backend/.env`
(comma-separated), then restart the backend.

**`npm install` fails with peer dependency errors**
Run `npm install --legacy-peer-deps` as a fallback.

## Docker

**`docker compose up` fails to resolve the SigNoz network**
`docker-compose.yml` expects an external network named `signoz-net`,
created by `docker-compose.signoz.yml`. Start that stack first:
`docker compose -f docker-compose.signoz.yml up -d`, then run
`docker compose up`.

**SigNoz containers take a long time to become healthy**
This is normal - ClickHouse + the SigNoz query service can take 30-60
seconds on first start. TraceScene AI's backend and frontend don't need to
wait for this; they'll just use fallback demo evidence until SigNoz is
ready.

## OpenTelemetry

**No traces showing up for the backend itself in SigNoz**
Confirm `OTEL_EXPORTER_OTLP_ENDPOINT` in `backend/.env` points at a
reachable OTel Collector (`http://localhost:4317` locally, or
`http://otel-collector:4317` inside Docker Compose), and that you passed
`insecure=True` when constructing the exporter (already done in
`integrations/otel_setup.py`) - omitting this against a local
non-TLS collector causes traces to silently fail to export with no
obvious error, which is the single most common OTel beginner mistake.

## General

If you hit something not covered here, check the backend logs first
(`python manage.py runserver` prints to stdout) - most failures in this
project (webhook errors, SigNoz fallbacks, correlation retries) are logged
with a clear, human-readable message rather than a bare stack trace.
