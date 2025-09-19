import React, { useState, useEffect } from "react";
import FlightCard from "./components/FlightCard";
import HotelCard from "./components/HotelCard";
import Loader from "./components/Loader";

const API_BASE = "https://your-vercel-project.vercel.app/api"; // Vercel 프록시 주소

export default function App() {
  const [query, setQuery] = useState("인천에서 도쿄 왕복, 10월 3일 출발 10월 5일 귀국, 도쿄 2박, 성인 2명");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const runSearch = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 항공 검색
      const resFlights = await fetch(
        `${API_BASE}/flights?origin=ICN&destination=HND&departDate=2025-10-03&returnDate=2025-10-05&adults=2`
      );
      if (!resFlights.ok) throw new Error("항공편 API 실패");
      const dataFlights = await resFlights.json();
      setFlights(dataFlights.data || []);

      // 호텔 검색
      const resHotels = await fetch(
        `${API_BASE}/hotels?destination=TYO&checkIn=2025-10-03&checkOut=2025-10-05&adults=2`
      );
      if (!resHotels.ok) throw new Error("호텔 API 실패");
      const dataHotels = await resHotels.json();
      setHotels(dataHotels.hotels || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    runSearch(); // 첫 로드시 자동 실행
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">여행 AI 에이전트</h1>
      <textarea
        className="w-full border rounded p-3 mb-4"
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={runSearch}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "검색 중..." : "검색 실행"}
      </button>

      {loading && <Loader message="항공편과 호텔을 불러오는 중..." />}
      {errorMsg && <p className="text-red-600 mt-4">⚠️ {errorMsg}</p>}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">항공편 결과</h2>
          {flights.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {flights.map((f, idx) => (
                <FlightCard key={idx} flight={{
                  airline: { name: f.validatingAirlineCodes?.[0] || "항공사" },
                  origin: f.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || "ICN",
                  destination: f.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || "HND",
                  departTime: f.itineraries?.[0]?.segments?.[0]?.departure?.at?.slice(11, 16) || "--:--",
                  returnTime: f.itineraries?.[1]?.segments?.slice(-1)[0]?.arrival?.at?.slice(11, 16) || "--:--",
                  duration: 140,
                  stops: (f.itineraries?.[0]?.segments?.length || 1) - 1,
                  baggageIncluded: true,
                  price: f.price?.grandTotal ? Math.round(+f.price.grandTotal) : 0,
                }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">검색 결과 없음</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">호텔 결과</h2>
          {hotels.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {hotels.map((h, idx) => (
                <HotelCard key={idx} hotel={{
                  name: h.name || `호텔 ${idx + 1}`,
                  area: h.zoneName || "도쿄",
                  stars: 4,
                  rating: h.rating || 4.3,
                  reviews: 200 + idx * 15,
                  refundable: true,
                  checkIn: "2025-10-03",
                  nights: 2,
                  pricePerNight: h.minRate || 100000,
                  taxesPerNight: 15000,
                }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">검색 결과 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
