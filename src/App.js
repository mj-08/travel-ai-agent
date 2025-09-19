import React, { useState } from "react";

export default function App() {
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👉 본인 Vercel 배포 주소로 교체
  const VERCEL_API_BASE = "https://your-vercel-project.vercel.app/api";

  const search = async () => {
    setLoading(true);

    try {
      // 항공 검색
      const resFlights = await fetch(
        `${VERCEL_API_BASE}/flights?origin=ICN&destination=HND&departDate=2025-10-03&returnDate=2025-10-05&adults=2`
      );
      const dataFlights = await resFlights.json();
      setFlights(dataFlights.data || []);

      // 호텔 검색
      const resHotels = await fetch(
        `${VERCEL_API_BASE}/hotels?destination=TYO&checkIn=2025-10-03&checkOut=2025-10-05&adults=2`
      );
      const dataHotels = await resHotels.json();
      setHotels(dataHotels.hotels || []);
    } catch (err) {
      console.error("검색 오류:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        여행 AI 에이전트 (프론트)
      </h1>
      <button
        onClick={search}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "검색 중..." : "검색 실행"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h2>항공편 결과</h2>
        <pre
          style={{
            background: "#f3f4f6",
            padding: "1rem",
            borderRadius: "8px",
            maxHeight: "300px",
            overflow: "auto",
            fontSize: "0.85rem",
          }}
        >
          {flights.length ? JSON.stringify(flights, null, 2) : "검색 결과 없음"}
        </pre>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>호텔 결과</h2>
        <pre
          style={{
            background: "#f3f4f6",
            padding: "1rem",
            borderRadius: "8px",
            maxHeight: "300px",
            overflow: "auto",
            fontSize: "0.85rem",
          }}
        >
          {hotels.length ? JSON.stringify(hotels, null, 2) : "검색 결과 없음"}
        </pre>
      </div>
    </div>
  );
}
