import random
import time
from datetime import datetime

PRESSURE_THRESHOLD = 80.0
FLOW_THRESHOLD = 45.0

meters = ["MTR-001", "MTR-002", "MTR-003", "MTR-004"]


def generate_telemetry(meter_id):
    pressure = round(random.uniform(45, 95), 2)
    flow_rate = round(random.uniform(15, 60), 2)

    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "meter_id": meter_id,
        "pressure_psi": pressure,
        "flow_lpm": flow_rate,
    }


def evaluate_alert(data):
    alerts = []

    if data["pressure_psi"] > PRESSURE_THRESHOLD:
        alerts.append("PRESSURE ALERT: Possible pipe stress or leakage risk")

    if data["flow_lpm"] > FLOW_THRESHOLD:
        alerts.append("FLOW ALERT: Abnormal water consumption detected")

    return alerts


print("AquaSense IoT Edge Simulation Started")
print("Simulating smart meter telemetry and edge-level alert detection...\n")

for i in range(20):
    meter_id = random.choice(meters)
    telemetry = generate_telemetry(meter_id)
    alerts = evaluate_alert(telemetry)

    print(
        f"[{telemetry['timestamp']}] "
        f"Meter={telemetry['meter_id']} | "
        f"Pressure={telemetry['pressure_psi']} PSI | "
        f"Flow={telemetry['flow_lpm']} L/min"
    )

    if alerts:
        for alert in alerts:
            print(f"  ⚠ {alert}")
    else:
        print("  Status: Normal")

    print("-" * 80)
    time.sleep(1)

print("\nSimulation completed.")