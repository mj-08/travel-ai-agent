import React from "react";

export default function FlightCard({ flight }) {
  if (!flight) return null;
  return (
    <div className="border p-3 rounded-lg mb-3">
      <p className="font-bold">{flight.airline?.name || "항공편"}</p>
      <p className="text-sm text-gray-600">{flight.origin} → {flight.destination}</p>
      <p className="text-sm">출발: {flight.departDate} {flight.departTime}</p>
      <p className="text-sm">귀국: {flight.returnDate} {flight.returnTime}</p>
      <p className="font-semibold mt-1">₩{flight.price?.toLocaleString()}</p>
    </div>
  );
}
