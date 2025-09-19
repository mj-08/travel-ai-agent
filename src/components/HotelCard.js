import React from "react";

const KRW = (n) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "-");
const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toISOString().slice(0, 10);
};

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{hotel.name}</div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            hotel.refundable
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {hotel.refundable ? "무료취소" : "환불불가"}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-700">
        ★{hotel.stars} · 평점 {hotel.rating} ({KRW(hotel.reviews)} 리뷰)
      </div>
      <div className="text-xs text-gray-500">
        체크인 {formatDate(hotel.checkIn)} · {hotel.nights}박
      </div>

      <div className="mt-2 font-semibold text-indigo-600">
        1박 ₩{KRW(hotel.pricePerNight)} (+세금 ₩{KRW(hotel.taxesPerNight)})
      </div>
    </div>
  );
}
