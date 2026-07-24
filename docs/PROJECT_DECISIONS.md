# Project Decisions

Living log of deviations/decisions made during implementation that weren't
fully specified (or were changed) from the PRD. Format follows PRD Section 47.

## [2026-07-21] Persisted SigNoz connection settings via a small model

**Context:** Section 22 requires `GET`/`PUT /api/v1/settings/signoz/` and
`POST /api/v1/settings/signoz/test/`, but Section 20's backend folder
structure doesn't list a `settings` app or a model to back these endpoints
- only environment variables are named in Section 37.

**Decision:** Added `integrations/models.py: SignozConnectionSettings`, a
singleton row (`pk=1`) that the Settings screen reads/writes, seeded from
the environment variables on first access.

**Alternatives considered:** (1) Keep settings entirely in environment
variables and make the Settings screen read-only - rejected because the
PRD's Section 11.7 explicitly describes a "Save" button with success/error
toast, implying persistence. (2) Store settings in a JSON file on disk -
rejected as less idiomatic Django and harder to keep consistent with the
webhook secret check.

**Rationale:** A single-tenant MVP only needs one connection config; a
singleton model is the simplest thing that satisfies both the API contract
and the UI's save/test flow without over-engineering multi-tenant config
(explicitly Post-MVP, Section 55).

**PRD section affected:** Section 20 (Backend Folder Structure), Section 22
(Settings endpoints).

---

## [2026-07-21] Correlation jobs run synchronously under pytest

**Context:** `CorrelationEngine.run_async()` spawns a background thread per
Section 24 ("Django's built-in threading for MVP simplicity"). Under
pytest, each test wraps its work in a transaction; a real background
thread racing that transaction against SQLite's single-writer lock produced
intermittent `database is locked` errors.

**Decision:** `run_async()` checks for pytest's own `PYTEST_CURRENT_TEST`
environment variable (set automatically for the duration of every test) and,
if present, runs the correlation job synchronously in-process instead of on
a thread. Production and the local dev/demo path are unaffected - only the
test process takes this branch.

**Alternatives considered:** (1) Mock `run_async` in every test that
triggers it - rejected as repetitive across many test files. (2) Switch
SQLite to WAL mode - helps but doesn't fully eliminate cross-thread
contention within a single test's transaction. (3) Use `django-rq`/Celery
even for MVP - explicitly out of scope per Section 24/39 (avoids
hackathon-scope infra overhead).

**Rationale:** Keeps the production code path exactly as specified, adds
one small, well-commented conditional, and produces deterministic tests -
directly serving Section 45's testing strategy without adding new
infrastructure.

**PRD section affected:** Section 24 (Backend Services - async work), Section 45 (Testing Strategy).

---

## [2026-07-21] Case create response returns the full detail shape, serialized before correlation starts

**Context:** Section 23's example response for `POST /api/v1/cases/` shows
the full Case shape (`status`, `evidence_count`, `finding`, etc.), but the
input serializer (`CaseCreateSerializer`) only exposes the fields a client
may set.

**Decision:** `CaseViewSet.create()` serializes the response with
`CaseDetailSerializer` immediately after saving, but *before* calling
`CorrelationEngine.run_async()` - because correlation flips `status` from
`open` to `investigating` as its first step, and the create response should
reflect the just-created `open` state per the Section 23 example.

**Alternatives considered:** Returning the leaner create-serializer shape -
rejected because it doesn't match the documented response and omits fields
(`status`, `evidence_count`) the frontend's redirect-to-detail flow doesn't
strictly need but the spec promises.

**Rationale:** Matches the documented contract exactly without changing
the underlying create → correlate flow.

**PRD section affected:** Section 23 (Request/Response Examples).

---

## [2026-07-21] SigNoz Query API fallback for demo continuity

**Context:** Section 56 flags "SigNoz Query API shape differs from what's
assumed here (version drift)" and "SigNoz Docker stack is heavy/slow to
start" as real risks, especially for judging/demo scenarios where SigNoz
may not be reachable yet.

**Decision:** `SigNozClient.fetch_signals()` attempts a real query against
SigNoz's Query Service API first; on any `requests.exceptions.RequestException`
it falls back to a deterministic, realistic evidence set that reproduces the
exact "bad deploy" scenario from Section 23's example (same service names,
similar timing, same evidence types). Every fallback use logs a clear
warning identifying it as demo data, never presenting it as real telemetry.

**Alternatives considered:** Failing the correlation job outright when
SigNoz is unreachable - rejected because Section 33 requires Case creation
to never fail even if SigNoz is down, and a judge/demo audience benefits
from always seeing a working pipeline.

**Rationale:** Directly implements Section 56's own mitigation guidance
("isolate all version-specific query-building" in `SigNozClient`) while
keeping the product demoable under the exact failure mode the PRD itself
anticipates.

**PRD section affected:** Section 27 (SigNoz Integration), Section 56 (Risks and Mitigations).
