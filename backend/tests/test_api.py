import unittest
import io
import json
import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database import get_db_connection

class EcoSortAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["project"], "EcoSort AI")

    def test_get_categories(self):
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("categories", data)
        self.assertGreaterEqual(len(data["categories"]), 6)

    def test_get_collection_centres(self):
        response = self.client.get("/api/centres")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("centres", data)
        self.assertGreaterEqual(len(data["centres"]), 8)

    def test_auth_login_admin(self):
        response = self.client.post("/api/auth/login", json={
            "email": "admin@ecosort.ai",
            "password": "Admin@123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "admin")

    def test_auth_login_user(self):
        response = self.client.post("/api/auth/login", json={
            "email": "user@ecosort.ai",
            "password": "User@123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "user")

    def test_auth_register_and_login(self):
        unique_email = f"test_{os.urandom(4).hex()}@example.com"
        reg_response = self.client.post("/api/auth/register", json={
            "name": "Test Student",
            "email": unique_email,
            "password": "password123"
        })
        self.assertEqual(reg_response.status_code, 201)
        data = reg_response.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "user")

    def test_classify_item_demo_mode(self):
        # Create a tiny 10x10 dummy RGB image in memory
        from PIL import Image
        img = Image.new("RGB", (10, 10), color=(73, 109, 137))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        img_byte_arr.seek(0)

        response = self.client.post(
            "/api/classify",
            data={
                "image": (img_byte_arr, "test_phone.jpg"),
                "demo_hint": "mobile_phones"
            },
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("classification", data)
        self.assertIn("guidance", data)
        # Confidence is a float when trained, or None when untrained
        if data["classification"]["is_trained"]:
            self.assertIsInstance(data["classification"]["confidence"], float)
            self.assertGreater(data["classification"]["confidence"], 0.0)
        else:
            self.assertIsNone(data["classification"]["confidence"])


    def test_admin_metrics(self):
        # Login as admin to get token
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@ecosort.ai",
            "password": "Admin@123"
        })
        token = login_res.get_json()["token"]

        response = self.client.get(
            "/api/admin/model-metrics",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("metrics", data)
        self.assertGreater(data["metrics"]["accuracy"], 0.9)

if __name__ == "__main__":
    unittest.main()
