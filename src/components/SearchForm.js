import React, { useState } from "react";

export default function SearchForm({ onSearch }) {
  const [form, setForm] = useState({
    origin: "ICN",
    destination: "HND",
    destinationCode: "TYO",
    departDate: "2025-10-03",
    returnDate: "2025-10-05",
    adults: 2
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">여행 검색</h2>
      <div className="grid grid-cols-2 gap-3">
        <input name="origin" value={form.origin} onChange={handleChange} className="border p-2 rounded" placeholder="출발지 (ICN)" />
        <input name="destination" value={form.destination} onChange={handleChange} className="border p-2 rounded" placeholder="도착지 (HND)" />
        <input type="date" name="departDate" value={form.departDate} onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="adults" value={form.adults} onChange={handleChange} className="border p-2 rounded" min="1" />
      </div>
      <button
        onClick={() => onSearch(form)}
        className="mt-4 w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
      >
        검색 실행
      </button>
    </div>
  );
}
