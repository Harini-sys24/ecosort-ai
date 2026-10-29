import urllib.request
import json
import sys

def run_checks():
    print("=== 1. Checking Vite Frontend ===")
    res = urllib.request.urlopen("http://localhost:5173")
    assert res.status == 200
    html = res.read().decode("utf-8")
    assert '<div id="root"></div>' in html
    print("Frontend is live and serving index.html on port 5173.")

    print("\n=== 2. Checking Backend Health ===")
    res = urllib.request.urlopen("http://127.0.0.1:5000/api/health")
    data = json.loads(res.read().decode("utf-8"))
    print("Backend Health status:", data.get("status"))
    print("Project title:", data.get("research_title"))
    assert data["status"] == "healthy"

    print("\n=== 3. Checking E-Waste Categories ===")
    res = urllib.request.urlopen("http://127.0.0.1:5000/api/categories")
    cats = json.loads(res.read().decode("utf-8"))["categories"]
    print(f"Retrieved {len(cats)} categories:")
    for c in cats:
        print(f"  - [{c['slug']}] {c['name']} (Hazard: {c['hazard_level']}, Recyclability: {c['recyclability_rate']}%)")
    assert len(cats) >= 6

    print("\n=== 4. Checking Collection Centres Search ===")
    res = urllib.request.urlopen("http://127.0.0.1:5000/api/centres?city=Bengaluru")
    centres_data = json.loads(res.read().decode("utf-8"))
    centres = centres_data["centres"]
    print(f"Found {len(centres)} centres in Bengaluru. Demo notice: {centres_data['is_demo_notice']}")
    for c in centres:
        print(f"  - {c['name']} | PIN: {c['pin_code']} | Phone: {c['contact_phone']}")
    assert len(centres) >= 2

    print("\n=== 5. Admin Authentication & Role Protection ===")
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/auth/login",
        data=json.dumps({"email": "admin@ecosort.ai", "password": "Admin@123"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    auth_data = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
    admin_token = auth_data["token"]
    print(f"Admin logged in as: {auth_data['user']['name']} (Role: {auth_data['user']['role']})")
    assert auth_data["user"]["role"] == "admin"

    print("\n=== 6. Admin Metrics Access ===")
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/admin/model-metrics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    metrics = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))["metrics"]
    print(f"Model Name: {metrics['model_name']}")
    print(f"Measured Accuracy: {metrics['accuracy'] * 100:.2f}%")
    print(f"Macro Precision:   {metrics['precision_score'] * 100:.2f}%")
    print(f"Macro Recall:      {metrics['recall_score'] * 100:.2f}%")
    print(f"Macro F1-Score:    {metrics['f1_score'] * 100:.2f}%")
    print(f"Inference Latency: {metrics['avg_inference_time_ms']} ms")
    print(f"Confusion Matrix:  {len(metrics['confusion_matrix'])}x{len(metrics['confusion_matrix'][0])} matrix")

    print("\n=== 7. User Authentication & History ===")
    user_req = urllib.request.Request(
        "http://127.0.0.1:5000/api/auth/login",
        data=json.dumps({"email": "user@ecosort.ai", "password": "User@123"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    user_data = json.loads(urllib.request.urlopen(user_req).read().decode("utf-8"))
    user_token = user_data["token"]
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/history",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    history = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))["history"]
    print(f"User History for {user_data['user']['name']}: {len(history)} items retrieved.")
    for h in history:
        print(f"  - [{h['created_at'][:10]}] {h['category_name']} | Confidence: {h['confidence']}")

    print("\n=======================================================")
    print("SUCCESS: ALL 7 END-TO-END VERIFICATION CHECKS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_checks()
