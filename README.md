Adhyatma Bandha — Smart Devotional Health Wristband

 Features
- Heart Rate & SpO₂ monitoring (MAX30102)
- BP risk-level estimation (algorithmic, not cuff-based)
- Single LED + buzzer alert patterns for status (Normal / Elevated / Critical)
- Printed QR code linking to cloud profile & emergency contacts
- BLE advertising for gateway-based location tracking
- Low-cost goal (< ₹400 per unit)

Hardware
- Sensor: MAX30102 (HR & SpO₂)
- MCU: ESP32 / Arduino + BLE gateway
- Indicators: Single red LED, buzzer
- Power: Rechargeable Li-ion (~300mAh) or coin-cell fallback
- Files: see `hardware/` folder (images, 3D design, components list)

Software / Firmware
- `firmware/arduino_code.ino` — Main Arduino/ESP32 firmware
  - Comments at top explain wiring and libraries used
- `website/` — Simple web dashboard (static files) to view sample data

Circuit & Assembly
Refer to `hardware/images/circuit_diagram.png` for wiring. All connectors and pin mapping are documented in `hardware/components_list.txt`.

How to run / Test locally
1. Flash `firmware/arduino_code.ino` to the ESP32/Arduino (instructions in file header).
2. Power the device and observe LED/buzzer patterns.
3. For the web dashboard, open `website/index.html` in a browser to see the UI mockup.

Prototype images
See `hardware/ for photos 



