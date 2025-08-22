import React from "react";

export default function AppointmentModal({ currentAppt, setShowApptModal }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowApptModal(false)}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowApptModal(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2">{currentAppt.name}</h3>
        <p className="italic text-gray-500 mb-4">{currentAppt.style}</p>
      </div>
    </div>
  );
}
