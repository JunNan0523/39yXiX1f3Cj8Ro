"use client";

export default function LoadingDots({ 
  size = "md", 
  text = "", 
  className = "",
  color = "blue"
}) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2", 
    lg: "w-3 h-3",
    xl: "w-4 h-4"
  };
  
  const colorClasses = {
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    green: "bg-green-400",
    red: "bg-red-400",
    gray: "bg-gray-400"
  };
  
  const dotSize = sizeClasses[size] || sizeClasses.md;
  const dotColor = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex space-x-2">
        <div className={`${dotSize} ${dotColor} rounded-full animate-pulse animation-delay-0`}></div>
        <div className={`${dotSize} ${dotColor} rounded-full animate-pulse animation-delay-75`}></div>
        <div className={`${dotSize} ${dotColor} rounded-full animate-pulse animation-delay-150`}></div>
      </div>
      {text && (
        <p className="text-gray-400 text-sm mt-3">{text}</p>
      )}
      
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