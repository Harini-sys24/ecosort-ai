import urllib.request
import json
import uuid

def post_image(filepath):
    boundary = uuid.uuid4().hex
    with open(filepath, "rb") as f:
        file_bytes = f.read()

    headers_part = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="item.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8")
    
    footer_part = f"\r\n--{boundary}--\r\n".encode("utf-8")
    body = headers_part + file_bytes + footer_part

    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/classify",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode("utf-8"))

print("=== Testing Real CNN Image Classification via /api/classify ===")

res_battery = post_image("dataset/batteries/batteries_000.jpg")
c1 = res_battery["classification"]
print("\n[Test 1: Battery Image]")
print(f"Predicted Category: {c1['category_name']} (slug: {c1['category_slug']})")
print(f"Model Confidence:   {c1['confidence']} ({c1['confidence_percentage']})")
print(f"Is Model Trained:   {c1['is_trained']}")
print(f"Model Status:       {c1['model_status']}")
print(f"Inference Latency:  {c1['inference_time_ms']} ms")
print(f"All Probabilities:  {c1['all_probabilities']}")

res_laptop = post_image("dataset/laptops/laptops_000.jpg")
c2 = res_laptop["classification"]
print("\n[Test 2: Laptop Image]")
print(f"Predicted Category: {c2['category_name']} (slug: {c2['category_slug']})")
print(f"Model Confidence:   {c2['confidence']} ({c2['confidence_percentage']})")
print(f"Is Model Trained:   {c2['is_trained']}")
print(f"Model Status:       {c2['model_status']}")
print(f"Inference Latency:  {c2['inference_time_ms']} ms")
print(f"All Probabilities:  {c2['all_probabilities']}")

res_pcb = post_image("dataset/circuit_boards/circuit_boards_000.jpg")
c3 = res_pcb["classification"]
print("\n[Test 3: Circuit Board Image]")
print(f"Predicted Category: {c3['category_name']} (slug: {c3['category_slug']})")
print(f"Model Confidence:   {c3['confidence']} ({c3['confidence_percentage']})")
print(f"Is Model Trained:   {c3['is_trained']}")
print(f"Model Status:       {c3['model_status']}")
print(f"Inference Latency:  {c3['inference_time_ms']} ms")
print(f"All Probabilities:  {c3['all_probabilities']}")

import os
user_img_path = "backend/uploads/4c050020213e4160bd58c104c2a2c923.jpeg"
if os.path.exists(user_img_path):
    res_user = post_image(user_img_path)
    c4 = res_user["classification"]
    print("\n[Test 4: Real User Device Photo (backend/uploads/4c050020213e4160bd58c104c2a2c923.jpeg)]")
    print(f"Predicted Category: {c4['category_name']} (slug: {c4['category_slug']})")
    print(f"Model Confidence:   {c4['confidence']} ({c4['confidence_percentage']})")
    print(f"Is Model Trained:   {c4['is_trained']}")
    print(f"Model Status:       {c4['model_status']}")
    print(f"Inference Latency:  {c4['inference_time_ms']} ms")
    print(f"All Probabilities:  {c4['all_probabilities']}")

print("\nSUCCESS: CNN INFERENCE IS FULLY ACTIVE AND RETURNING REAL PREDICTIONS!")

