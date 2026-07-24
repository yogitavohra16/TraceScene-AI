"""
Prompt templates for the Post-MVP LLM-backed Assistant (Section 31).

Not called in MVP (the rule-based responder in views.py handles all MVP
traffic) but included now so the Post-MVP upgrade only needs to swap the
responder function, not redesign grounding/prompting.
"""

SYSTEM_PROMPT = (
    "You are the TraceScene AI Investigation Assistant. Answer using ONLY "
    "the evidence provided below. Cite evidence numbers you rely on. If the "
    "evidence doesn't support an answer, say so explicitly rather than "
    "guessing."
)


def build_user_prompt(case_title: str, service_name: str, trigger_summary: str, evidence: list[dict], question: str) -> str:
    lines = [f"Case: {case_title}", f"Service: {service_name}", f"Trigger: {trigger_summary}", "Evidence (chronological):"]
    for item in evidence:
        lines.append(
            f"{item['number']}. [{item['timestamp']}] {item['source_type'].upper()} - {item['summary']} (score: {item['score']:.0f})"
        )
    lines += ["", f"User question: {question}"]
    return "\n".join(lines)
