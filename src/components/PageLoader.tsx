"use client";

import Image from "next/image";

interface PageLoaderProps {
  className?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function PageLoader({
  className = "",
  fullScreen = false,
  size = "md"
}: PageLoaderProps) {
  const logoWidth = size === "sm" ? 140 : size === "lg" ? 220 : 180;
  const logoHeight = size === "sm" ? 45 : size === "lg" ? 70 : 60;
  const logoClass = size === "sm" ? "h-9" : size === "lg" ? "h-14" : "h-11";

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      {/* Brand Logo with a smooth subtle breathing pulse */}
      <div className="relative transition-all duration-300 transform hover:scale-105">
        <Image
          src="/logo-horizontal.jpg"
          alt="Global Speaker Parts"
          width={logoWidth}
          height={logoHeight}
          className={`${logoClass} w-auto object-contain animate-pulse`}
          priority
        />
      </div>

      {/* Sleek Minimalist Circular Spinner */}
      <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`w-full flex items-center justify-center bg-white rounded-lg py-16 ${className}`}>
      {content}
    </div>
  );
}
