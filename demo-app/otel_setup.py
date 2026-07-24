"""
Minimal OTel setup for the demo app (PRD Section 26's "beginner setup
example"). Two services are instrumented here in a single process
(`checkout-service` and `payments-service` are simulated as two Flask
blueprints) so the demo can show a real cross-service trace without
needing two separate containers.
"""
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def setup_otel(service_name: str, otlp_endpoint: str) -> None:
    resource = Resource(attributes={SERVICE_NAME: service_name})
    provider = TracerProvider(resource=resource)
    # insecure=True: local gRPC without TLS (Section 26's beginner-mistake
    # warning - forgetting this causes traces to silently fail to export).
    exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    RequestsInstrumentor().instrument()
