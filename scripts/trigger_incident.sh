#!/bin/sh
# One-command "live-break something" demo trigger (Section 52/53).
# Hits the demo app's /checkout endpoint with BREAK_PAYMENTS simulated,
# then posts a matching SigNoz-shaped alert to TraceScene's webhook so the
# whole pipeline (Case -> Evidence -> Timeline -> Finding) runs end-to-end
# even without a live SigNoz alert rule configured yet.
set -e

DEMO_APP_URL="${DEMO_APP_URL:-http://localhost:5001}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-}"

echo "Triggering checkout latency spike..."
curl -s "$DEMO_APP_URL/checkout" || echo "(demo app not reachable - continuing to fire the webhook anyway)"

echo "Firing simulated SigNoz alert webhook..."
curl -s -X POST "$BACKEND_URL/api/v1/webhooks/signoz/" \
  -H "Content-Type: application/json" \
  -H "X-Signoz-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{
    "alertId": "alert-demo-001",
    "ruleName": "checkout-service p95 latency",
    "severity": "critical",
    "service": "checkout-service",
    "value": 2450,
    "threshold": 2000,
    "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
  }'
echo ""
echo "Done - open the TraceScene AI dashboard to watch the Investigation Room populate."
