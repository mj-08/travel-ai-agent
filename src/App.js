import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import RecommendationCard from "./components/RecommendationCard";

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const VERCEL_API_BASE = "https://your-vercel-app.vercel.app/api";

  const handleSearch = async (params) => {
    setLoading(true);
    try {
      const resFlights = await fetch(
        `${VERCEL_API_BASE}/flights?origin=${params.origin}&destination=${params.destination}&departDate=${params.departDate}&returnDate=${params.returnDate}&adults=${params.adults}`
      );
      const flights = await resFlights.json();

      const resHotels = await fetch(
        `${VERCEL_API_BASE}/hotels?destination=${params.destinationCode}&checkIn=${params.departDate}&checkOut=${params.returnDate}&adults=${params.adults}`
      );
      const hotels = await resHotels.json();

      // 👉 여기서 "최저가 · 최단시간 · 최소리스크" 계산 로직 넣기
      setResults({ flights, hotels });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-indigo-600 text-white p-4 text-xl font-bold">
        ✈️ 여행 AI 에이전트
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <SearchForm onSearch={handleSearch} />

        {loading && <p className="mt-4">검색 중...</p>}

        {results && (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <RecommendationCard type="최저가" data={results} />
            <RecommendationCard type="최단시간" data={results} />
            <RecommendationCard type="최소리스크" data={results} />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} Travel AI Demo
      </footer>
    </div>
  );
}
