"""
OpenTelemetry Integration (PRD Section 26).

TraceScene AI's own backend is instrumented with OpenTelemetry so its
performance and errors show up in SigNoz too ("dogfooding", Section 7 NFR).
This does NOT re-instrument the user's application - it only traces
TraceScene's own Django process.

Common beginner mistake this avoids (Section 26): forgetting
`insecure=True` for local gRPC without TLS, which causes traces to silently
fail to export with no obvious error.
"""

import logging

logger = logging.getLogger(__name__)

_otel_initialized = False


def setup_otel() -> None:
    """Idempotent - safe to call multiple times (e.g. under gunicorn's
    multiple worker processes)."""
    global _otel_initialized
    if _otel_initialized:
        return

    try:
        from django.conf import settings
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter

        # Trace imports
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
            OTLPSpanExporter,
        )
        from opentelemetry.instrumentation.django import DjangoInstrumentor
        from opentelemetry.instrumentation.requests import RequestsInstrumentor

        # Log imports
        from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
        from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
        from opentelemetry.sdk.resources import SERVICE_NAME, Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        resource = Resource(attributes={SERVICE_NAME: settings.OTEL_SERVICE_NAME})

        # -------------------------
        # Traces → SigNoz
        # -------------------------
        provider = TracerProvider(resource=resource)

        exporter = OTLPSpanExporter(
            endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT, insecure=True
        )

        provider.add_span_processor(BatchSpanProcessor(exporter))

        trace.set_tracer_provider(provider)

        # -------------------------
        # Logs → SigNoz
        # -------------------------
        log_provider = LoggerProvider(resource=resource)

        log_exporter = OTLPLogExporter(
            endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT, insecure=True
        )

        log_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))

        log_handler = LoggingHandler(level=logging.INFO, logger_provider=log_provider)

        logging.getLogger().addHandler(log_handler)
        logging.getLogger().setLevel(logging.INFO)

        # Django + Requests instrumentation
        DjangoInstrumentor().instrument()
        RequestsInstrumentor().instrument()

        _otel_initialized = True

        logger.info(
            "OpenTelemetry initialized: service.name=%s -> %s",
            settings.OTEL_SERVICE_NAME,
            settings.OTEL_EXPORTER_OTLP_ENDPOINT,
        )

    except Exception:
        logger.exception("OpenTelemetry setup failed - continuing without telemetry.")
