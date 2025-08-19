"use client";

export default function DashboardLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="flex flex-col items-center">
        {/* Modern pulsing dots animation */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse animation-delay-0"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse animation-delay-150"></div>
        </div>
        <p className="text-gray-400 text-sm mt-4">Loading...</p>
      </div>

      <style jsx global>{`
        .animation-delay-0 {
          animation-delay: 0ms;
        }
        .animation-delay-75 {
          animation-delay: 200ms;
        }
        .animation-delay-150 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
