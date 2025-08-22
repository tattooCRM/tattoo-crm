import React from "react";

export default function PublicPageBox({ hasPage, setShowPageModal }) {
  return (
    <div className="bg-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
      <h2 className="font-semibold mb-4">Ma page publique</h2>
      <button
        onClick={() => setShowPageModal(true)}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        {hasPage ? "Modifier ma page" : "Créer ma page"}
      </button>
    </div>
  );
}
