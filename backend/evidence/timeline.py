"""
Timeline Reconstruction Logic (PRD Section 30).

`TimelineBuilder` turns a Case's persisted Evidence (everything except
items marked `irrelevant`) into the ordered payload the Timeline Panel
renders (Section 11.4, Section 23 example response). It does not persist
anything itself - it is recomputed on every request so it always reflects
the latest relevance edits (Section 30's "recomputation triggers").
"""
from __future__ import annotations

from datetime import timedelta

CLUSTER_WINDOW_SECONDS = 2


class TimelineBuilder:
    def __init__(self, case):
        self.case = case

    def build(self) -> dict:
        evidence_qs = (
            self.case.evidence.exclude(relevance="irrelevant").order_by("event_timestamp")
        )
        evidence_list = list(evidence_qs)

        entries = [self._alert_entry()] if self.case.linked_alert_id else []
        entries += [self._evidence_entry(item) for item in evidence_list]
        entries.sort(key=lambda entry: entry["timestamp"])

        clustered = self._cluster(entries)
        self._mark_key_evidence(clustered)

        return {"case_id": self.case.id, "entries": clustered}

    def _alert_entry(self) -> dict:
        return {
            "timestamp": self.case.created_at,
            "type": "alert",
            "summary": f"Alert fired: {self.case.title}",
            "evidence_id": None,
            "correlation_score": 100,
        }

    def _evidence_entry(self, evidence) -> dict:
        return {
            "timestamp": evidence.event_timestamp,
            "type": evidence.source_type,
            "summary": evidence.raw_content[:140],
            "evidence_id": evidence.id,
            "correlation_score": evidence.correlation_score,
        }

    def _cluster(self, entries: list) -> list:
        """Groups entries within a 2-second window into one cluster node
        (Section 30, step 2) so a burst of log lines doesn't clutter the
        timeline. Single-item clusters are returned unwrapped."""
        clusters: list = []
        bucket: list = []

        for entry in entries:
            if bucket and (entry["timestamp"] - bucket[-1]["timestamp"]) <= timedelta(seconds=CLUSTER_WINDOW_SECONDS):
                bucket.append(entry)
            else:
                if bucket:
                    clusters.append(self._finalize_bucket(bucket))
                bucket = [entry]
        if bucket:
            clusters.append(self._finalize_bucket(bucket))
        return clusters

    def _finalize_bucket(self, bucket: list):
        if len(bucket) == 1:
            return bucket[0]
        return {
            "timestamp": bucket[0]["timestamp"],
            "type": "cluster",
            "summary": f"{len(bucket)} events in quick succession",
            "evidence_id": None,
            "correlation_score": max(item["correlation_score"] for item in bucket),
            "cluster_entries": bucket,
        }

    def _mark_key_evidence(self, entries: list) -> None:
        """Flags the single highest-scoring entry as `is_key_evidence` so
        the UI can render it with a larger dot (Section 30, step 4)."""
        flat = []
        for entry in entries:
            flat.extend(entry.get("cluster_entries", [entry]))
        if not flat:
            return
        top = max(flat, key=lambda entry: entry["correlation_score"])
        top["is_key_evidence"] = True
