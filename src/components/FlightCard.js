import React from "react";

const KRW = (n) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "-");
const minutesToHM = (mins) => {
  if (!Number.isFinite(mins)) return "-";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}시간 ${m}분`;
};

export default function FlightCard({ flight }) {
  if (!flight) return null;

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{flight.airline.name}</div>
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
          {flight.stops ? `환승 ${flight.stops}회` : "직항"}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-700">
        {flight.origin} → {flight.destination} · {flight.departTime}
      </div>
      <div className="text-sm text-gray-700">
        귀국 {flight.destination} → {flight.origin} · {flight.returnTime}
      </div>

      <div className="mt-1 text-xs text-
