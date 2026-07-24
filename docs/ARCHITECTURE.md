# Architecture

## Overview

TraceScene AI is a reasoning/narrative layer on top of a SigNoz +
OpenTelemetry observability stack. It does not collect telemetry itself -
it reads from SigNoz's Query Service API and turns a SigNoz alert (or a
manually-created case) into a structured investigation: **Case → Evidence →
Timeline → Finding**, with an AI Assistant that answers questions grounded
only in that case's own evidence.

## Data model (ERD)

```
Service (1) ──< (many) Case (1) ──< (many) Evidence
                        │
                        ├──< (many) Note
                        │
                        └── (1:1) Finding
```

- **Service** - a registry entry for an instrumented system (`checkout-service`, etc). Auto-created from webhook payloads or manually via Django admin.
- **Case** - the incident/investigation record. Has a lifecycle: `open → investigating → closed`.
- **Evidence** - a single scored SigNoz signal (log/trace/metric/deploy/alert) attached to a Case, with a `correlation_score` (0-100) and a user-editable `relevance` (`unreviewed`/`relevant`/`irrelevant`).
- **Finding** - one-to-one with Case: an AI-proposed hypothesis + `confidence_score`, with `status` (`proposed`/`accepted`/`rejected`).
- **Note** - free-text investigator notes on a Case.

## Backend module map

| App | Responsibility |
|---|---|
| `accounts` | Token login/logout (DRF Token Auth) |
| `services` | Service registry (read-only API) |
| `cases` | Case CRUD, close action, notes sub-resource |
| `evidence` | Evidence list/update, **`correlation.py`** (CorrelationEngine), **`timeline.py`** (TimelineBuilder) |
| `findings` | Finding accept/reject/regenerate, **`scoring.py`** (FindingGenerator, confidence formula) |
| `integrations` | **`signoz_client.py`** (the only module that talks to SigNoz), webhook receiver, SigNoz connection settings, `otel_setup.py` (dogfooding) |
| `assistant` | Rule-based Q&A grounded in a case's evidence (`grounding.py`), Post-MVP LLM prompt templates (`prompts.py`, unused in MVP) |
| `common` | Shared pagination, standard error-shape exception handler |

## Correlation algorithm (evidence scoring)

For a Case, `CorrelationEngine` queries SigNoz for signals in a window
around the trigger time (default: 10 min before, 5 min after - configurable
via `CORRELATION_WINDOW_BEFORE_MIN`/`CORRELATION_WINDOW_AFTER_MIN`), then
scores each signal:

```
correlation_score = 0.40 * time_proximity      (closer to trigger = higher, decays to 0 at 15 min)
                   + 0.25 * service_match        (100 if same service, else 40)
                   + 0.20 * trace_id_match        (100 if it shares a trace ID, else 0)
                   + 0.15 * severity_signal        (100 if content has error/timeout/exhausted keywords, else 20)
```

Items scoring below `MIN_CORRELATION_SCORE` (default 30) are discarded, not
stored - keeping the Evidence Panel free of noise. Duplicate signals
(same `source_type` + `source_ref` + `event_timestamp`) are de-duplicated
via a DB unique constraint and `update_or_create`.

## Confidence scoring algorithm (finding generation)

`FindingGenerator` turns a Case's evidence into a plain-English hypothesis
and a 0-100 confidence score:

```
confidence_score = clamp(
    0.5 * avg_relevant_score            (average correlation_score of user-marked-relevant evidence,
                                          or the top 3 by score if nothing's been reviewed yet)
  + 0.3 * evidence_convergence_bonus     (100 * distinct_source_types / 4 - rewards independent signals agreeing)
  + 0.2 * causal_pattern_bonus,          (100 if it matches a known incident shape - e.g. a deploy within
                                          10 min of the alert, or a resource-exhaustion keyword + metric evidence -
                                          50 for a weaker pattern match, else 0)
  0, 100
)
```

This is a transparent, rule-based formula (not a black-box ML model) so a
user can always see *why* a Finding has the confidence it does - matching
the product's "Detective's Case Board, not a magic 8-ball" philosophy.

## Timeline reconstruction

`TimelineBuilder` takes all non-irrelevant Evidence (plus a synthetic
"alert fired" entry if the Case has a `linked_alert_id`), sorts
chronologically, clusters events within a 2-second window into a single
node (so a burst of log lines doesn't clutter the timeline), and flags the
single highest-scoring entry as "key evidence" for a larger marker in the
UI. It recomputes on every request rather than persisting a snapshot, so it
always reflects the latest relevance edits.

## AI Assistant (MVP scope)

`EvidenceGrounder` builds a capped (top 20 by score), chronological context
of a case's own evidence. The MVP responder (`assistant/views.py`) answers
common question shapes (what changed first, current confidence, strongest
signal) directly from that structured data with **zero external API calls**
- this keeps the demo free of network dependencies during judging and keeps
answers always evidence-cited. `assistant/prompts.py` contains unused
Post-MVP prompt templates for when this is swapped for a real LLM call
(the grounding/prompting split means that swap only touches the responder
function, not the rest of the pipeline).

## SigNoz integration

`integrations/signoz_client.py` is the *only* module that talks to SigNoz's
HTTP Query Service API. It normalizes SigNoz's response shape into the flat
dicts the correlation engine expects, isolating any future SigNoz API
version drift to one file. If SigNoz is unreachable, it falls back to a
deterministic, clearly-logged demo evidence set matching the PRD's "bad
deploy" example scenario, so the rest of the product is always demoable.

## OpenTelemetry dogfooding

The backend instruments itself with the OpenTelemetry Python SDK
(`integrations/otel_setup.py`), exporting its own traces to the same OTel
Collector / SigNoz stack it queries - so TraceScene AI's own performance and
errors are visible in SigNoz too.

## Frontend architecture

React SPA (Vite) with a thin `api/*.js` layer (one file per backend
resource, all built on a single shared `axios` instance), two global
contexts (`AuthContext` for the DRF token, `ToastContext` for
notifications), and data-fetching hooks (`useCases`, `useCaseDetail`,
`usePolling`) that keep pages free of inline `fetch` logic. Components are
grouped by concern (`badges/`, `dashboard/`, `cases/`, `investigation/`)
mirroring the backend's app-per-concern structure.

## Sequence: webhook → Investigation Room

See the Mermaid diagram in [`README.md`](../README.md#architecture).

## Roadmap (Post-MVP)

- LLM-backed Assistant using the existing grounding/prompt scaffolding
- Full trace waterfall visualization (spans as a proper Gantt chart)
- Role-based access control (Viewer/Investigator/Admin)
- Postmortem export (Markdown/PDF)
- Slack/Teams incident bot
- Learned (ML-based) correlation scoring, replacing the fixed-weight formula
- Cross-case pattern detection ("this looks like Case #12")
- Multi-tenant SaaS packaging (per-org SigNoz connections)
