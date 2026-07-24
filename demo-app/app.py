"""
TraceScene AI demo app (PRD Section 45/52).

Simulates the "bad deploy causes latency spike" scenario used in the demo
storyboard: `checkout-service` calls `payments-service`, which (once
`BREAK_PAYMENTS=1` is set) exhausts its simulated connection pool and gets
slow, producing the exact trace/log/metric shape the fallback SigNoz client
and the correlation/scoring engine are tuned for.

Run this alongside the real SigNoz + OTel Collector stack
(`docker-compose.signoz.yml`) to see real telemetry flow end-to-end, or run
it standalone just to poke at the two simulated endpoints.
"""
import logging
import os
import random
import time

from flask import Flask, jsonify

from otel_setup import setup_otel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("demo-app")

OTLP_ENDPOINT = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
setup_otel("checkout-service", OTLP_ENDPOINT)

app = Flask(__name__)

# Toggled by scripts/trigger_incident.sh to simulate the "bad deploy"
BREAK_PAYMENTS = os.environ.get("BREAK_PAYMENTS", "0") == "1"


@app.get("/checkout")
def checkout():
    """Simulates checkout-service calling payments-service."""
    start = time.time()
    payment_result = _call_payments()
    duration_ms = int((time.time() - start) * 1000)
    logger.info("checkout completed in %sms", duration_ms)
    return jsonify({"status": "ok", "duration_ms": duration_ms, "payment": payment_result})


def _call_payments():
    """In-process stand-in for a real payments-service HTTP call - kept as
    a plain function (not a second Flask app) so the whole demo runs with
    one `python app.py`, matching Section 38's beginner-friendly setup."""
    if BREAK_PAYMENTS:
        logger.error("payments-service: connection pool exhausted")
        time.sleep(1.9)  # matches the Section 23 example's 1.9s slow span
        return {"status": "degraded", "latency_ms": 1900}

    time.sleep(random.uniform(0.05, 0.15))
    return {"status": "ok", "latency_ms": random.randint(50, 150)}


@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
