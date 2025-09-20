import React, { useState } from "react";
import FlightCard from "./components/FlightCard";
import HotelCard from "./components/HotelCard";
import Loader from "./components/Loader";
import PaymentModal from "./components/PaymentModal";

const API_BASE = "https://server.smithery.ai/@almogqwinz/mcp-amadeus-api/mcp"; // MCP 서버 주소

export default function App() {
  const [query, setQuery] = useState("인천에서 도쿄 2박 3일 최저가");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [selected, setSelected] = useState(null);

  async function handleSearch() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      if (!res.ok) throw new Error("MCP 서버 호출 실패");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBook(plan) {
    setSelected(plan);
    setShowPayment(true);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">여행 AI Agent</h1>
        <p className="text-gray-600">자연어로 요청하고, AI가 최저가·최단시간·최소리스크 조합을 추천합니다</p>
      </header>

      <div className="mb-4">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="예) 인천에서 도쿄 왕복, 11월 2일 출발 11월 4일 귀국, 성인 2명"
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {loading ? "검색 중..." : "검색 실행"}
      </button>

      {error && <div className="text-red-500 mt-4">⚠ {error}</div>}
      {loading && <Loader />}

      {result && (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {["lowest", "fastest", "safest"].map((key) => (
            <div key={key} className="bg-white shadow-md rounded-xl p-4 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">
                {key === "lowest" ? "💰 최저가" : key === "fastest" ? "⚡ 최단시간" : "🛡 최소리스크"}
              </h3>
              <FlightCard flight={result[key].flight} />
              <HotelCard hotel={result[key].hotel} />
              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleBook(result[key])}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  예약 진행
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPayment && (
        <PaymentModal plan={selected} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}
