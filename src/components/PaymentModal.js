import React from "react";

export default function PaymentModal({ plan, onClose }) {
  if (!plan) return null;

  const total = plan.flight.price + (plan.hotel.pricePerNight + plan.hotel.taxesPerNight) * plan.hotel.nights;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">모의 결제</h2>
        <p className="mb-2">항공편: {plan.flight.airline?.name}</p>
        <p className="mb-2">호텔: {plan.hotel.name}</p>
        <p className="font-semibold mb-4">총액: ₩{total.toLocaleString()}</p>

        <button
          onClick={() => {
            alert("결제가 완료되었습니다 (모의)");
            onClose();
          }}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          결제하기
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg mt-2"
        >
          취소
        </button>
      </div>
    </div>
  );
}
