"use client";

import { useEffect, useState } from "react";

type Telemetry = {
  meter_id: string;
  pressure_psi: number;
  flow_lpm: number;
  timestamp: string;
  edge_gateway: string;
  status: "normal" | "alert";
  alerts: string[];
  receivedAt?: string;
};

export default function LiveEdgeTelemetry() {
  const [data, setData] = useState<Telemetry | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/edge-telemetry", { cache: "no-store" });
        const json = await res.json();
        setData(json.data);
      } catch (error) {
        console.error("Failed to fetch telemetry", error);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Live Edge Telemetry</h2>
        <p className="text-sm text-gray-500">Waiting for edge data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Live Edge Telemetry</h2>
        <p className="text-sm text-gray-500">
          Source: {data.edge_gateway} | Meter: {data.meter_id}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Pressure</p>
          <p className="text-2xl font-bold">{data.pressure_psi} PSI</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Flow Rate</p>
          <p className="text-2xl font-bold">{data.flow_lpm} L/min</p>
        </div>
      </div>

      <div
        className={`rounded-lg p-4 ${data.status === "alert"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
          }`}
      >
        <p className="font-semibold">
          Status: {data.status === "alert" ? "ALERT DETECTED" : "NORMAL"}
        </p>

        {data.alerts?.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {data.alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Sensor timestamp: {data.timestamp}
      </p>
    </div>
  );
}
