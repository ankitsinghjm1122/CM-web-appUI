import unittest
from fastapi.testclient import TestClient
from backend.main import app

class TestNexusCrmBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "online")
        self.assertIn("endpoints", data)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")

    def test_get_customers(self):
        response = self.client.get("/api/customers")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_get_analytics_metrics(self):
        response = self.client.get("/api/analytics/metrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("stats", data)
        self.assertIn("total", data["stats"])
        self.assertIn("active", data["stats"])
        self.assertIn("inactive", data["stats"])

if __name__ == "__main__":
    unittest.main()
