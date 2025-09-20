import React from "react";

export default function HotelCard({ hotel }) {
  if (!hotel) return null;
  return (
    <div className="border p-3 rounded-lg mb-3">
      <p className="font-bold">{hotel.name}</p>
      <p className="text-sm text-gray-600">지역: {hotel.area}</p>
      <p className="text-sm">체크인: {hotel.checkIn} ~ {hotel.checkOut}</p>
      <p className="font-semibold mt-1">
        1박 ₩{hotel.pricePerNight?.toLocaleString()} + 세금 ₩{hotel.taxesPerNight?.toLocaleString()}
      </p>
    </div>
  );
}
