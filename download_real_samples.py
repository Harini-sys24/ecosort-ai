import urllib.request
import os

URLS = {
    "mobile_phone_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/eb/IPhone_3G_%28cracked_screen%29.jpg",
    "laptop_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/07/Broken_Acer_Laptop.jpg",
    "keyboard_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Computer_keyboard_packard_bell_community.jpg",
    "pcb_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/18/Electronic_circuit_board.jpg",
    "battery_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Swollen_lithium_polymer_battery.jpg",
    "cables_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/e0/USB_cables_tangled.jpg"
}

out_dir = "real_test_samples"
os.makedirs(out_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EcoSortAI-Research/1.0"
}

print("Downloading real e-waste test images from public sources...")
for filename, url in URLS.items():
    dest = os.path.join(out_dir, filename)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(dest, "wb") as f:
                f.write(data)
        print(f"  [OK] {filename} ({len(data)} bytes)")
    except Exception as e:
        print(f"  [FAIL] {filename}: {e}")
