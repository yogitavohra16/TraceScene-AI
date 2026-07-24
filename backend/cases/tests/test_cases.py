"""Integration tests for the Case endpoints (Section 45)."""
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from services.models import Service


class CaseAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="priya", password="pw12345")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.service = Service.objects.create(name="checkout-service")

    def test_create_case_defaults_to_open_status(self):
        response = self.client.post(
            "/api/v1/cases/",
            {
                "title": "Checkout latency spike",
                "service": self.service.id,
                "severity": "high",
                "description": "P95 latency crossed 2s.",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "open")

    def test_list_cases_requires_auth(self):
        self.client.credentials()
        response = self.client.get("/api/v1/cases/")
        self.assertEqual(response.status_code, 401)

    def test_close_case_sets_resolution_summary(self):
        create = self.client.post(
            "/api/v1/cases/",
            {"title": "Test case", "service": self.service.id, "severity": "low"},
        )
        case_id = create.data["id"]
        response = self.client.post(
            f"/api/v1/cases/{case_id}/close/",
            {"resolution_summary": "Rolled back the bad deploy."},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "closed")
