import React from "react";

export default function RecommendationCard({ type, data }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold text-indigo-600">{type} 추천</h3>
      <p className="text-sm text-gray-600 mt-2">여기서 항공편 + 호텔 조합 보여주기</p>
      {/* 👉 flights / hotels 데이터 분석해서 카드에 표시 */}
    </div>
  );
}
