"use client";

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-8">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
        <p className="text-red-400 font-medium">{message}</p>
      </div>
    </div>
  );
}
