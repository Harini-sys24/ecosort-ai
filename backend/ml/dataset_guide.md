# E-Waste Dataset Acquisition Guide

This guide explains how to obtain, organize, and prepare a labeled image dataset for the six target e-waste classes in **EcoSort AI**:
1. `mobile_phones` (Smartphones, feature phones)
2. `laptops` (Laptops, notebooks, netbooks)
3. `keyboards` (Keyboards, desktop input devices)
4. `circuit_boards` (Printed circuit boards, motherboards, GPUs)
5. `batteries` (Lithium-ion cells, power banks, camera batteries)
6. `chargers_cables` (Wall adapters, USB cords, power supplies)

---

## 1. Recommended Public Open Datasets

### A. Mendeley E-Waste Image Dataset
- **URL:** [Mendeley Data — E-Waste Classification](https://data.mendeley.com/datasets/v5n39bphhy/)
- **Description:** Contains over 3,000 labelled photos of discarded consumer electronics including mobile phones, keyboards, PCBs, mouse peripherals, batteries, and chargers.
- **Licence:** CC BY 4.0 (Open academic research use).

### B. Kaggle E-Waste Dataset
- **URL:** [Kaggle — Electronic Waste Image Dataset](https://www.kaggle.com/datasets) (Search: `e-waste-classification` or `waste-classification-data`)
- **Classes:** PCBs, mobile devices, batteries, laptops, cables.

### C. Google Open Images V7 Subset
Using the `fiftyone` or `open-images-downloader` Python library, you can extract classes by MID tag:
- Mobile phone: `/m/050k8`
- Laptop: `/m/01c648`
- Computer keyboard: `/m/01m4t`
- Circuit board / Electronics: `/m/033cnk`
- Battery: `/m/01c5q_`
- Cable / Cord: `/m/0167gd`

---

## 2. Directory Structure

Place your unpacked images into `dataset/` organized by class subfolders:

```
ewaste/
└── dataset/
    ├── mobile_phones/
    │   ├── phone_001.jpg
    │   └── phone_002.jpg
    ├── laptops/
    │   ├── laptop_001.jpg
    │   └── laptop_002.jpg
    ├── keyboards/
    │   ├── kbd_001.jpg
    │   └── kbd_002.jpg
    ├── circuit_boards/
    │   ├── pcb_001.jpg
    │   └── pcb_002.jpg
    ├── batteries/
    │   ├── bat_001.jpg
    │   └── bat_002.jpg
    └── chargers_cables/
        ├── cable_001.jpg
        └── cable_002.jpg
```

---

## 3. Image Requirements & Best Practices
- **Formats:** Standard `.jpg`, `.jpeg`, `.png`, or `.webp`.
- **Resolution:** At least 224×224 pixels (the training script resizes images automatically).
- **Balance:** Aim for at least 100–300 images per class for solid transfer-learning fine-tuning.
- **Diversity:** Include varied backgrounds, lighting conditions, angles, and conditions (cracked screens, detached casings, exposed circuit traces).
