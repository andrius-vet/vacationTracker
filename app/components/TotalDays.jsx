import React from "react";

function TotalDays({ days }) {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="block text-gray-700 text-sm font-bold mb-2">
        Total days left
      </h2>
      <p className="text-3xl font-bold text-gray-800">{days}</p>
    </div>
  );
}

export default TotalDays;
