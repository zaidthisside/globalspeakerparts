"use client";

interface LogoProps {
  className?: string;
  variant?: "primary" | "stacked" | "icon" | "text-only";
  light?: boolean;
}

export default function Logo({ 
  className = "h-12", 
  variant = "primary", 
  light = false 
}: LogoProps) {
  const brandBlue = "#000000"; // Pure Black (from Shutterstock logo black)
  const accentColor = "#0EA5E9"; // Always Sky Blue accent bar / cap
  const mainColor = light ? "#FFFFFF" : brandBlue;

  // 1. ICON ONLY VARIANT
  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full object-contain animate-fade-in"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            {/* Symmetrical Globe Earth Silhouette Only (Filled to bounds) */}
            <image 
              href="/logo-globe.jpg" 
              x="0" 
              y="0" 
              width="200" 
              height="200" 
              style={{ filter: light ? 'invert(1)' : 'none' }}
            />
          </g>
        </svg>
      </div>
    );
  }

  // 2. TEXT ONLY VARIANT
  if (variant === "text-only") {
    return (
      <div className={`flex items-center ${className}`}>
        <svg 
          viewBox="0 0 350 140" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <text 
              x="10" 
              y="60" 
              fill={mainColor} 
              style={{ 
                fontFamily: "var(--font-manrope), Manrope, sans-serif", 
                fontWeight: 800, 
                fontSize: "76px", 
                letterSpacing: "-1px" 
              }}
            >
              GLOBAL
            </text>
            <rect x="10" y="74" width="330" height="9.5" fill={accentColor} rx="1" />
            <text 
              x="10" 
              y="114" 
              fill={mainColor} 
              style={{ 
                fontFamily: "var(--font-manrope), Manrope, sans-serif", 
                fontWeight: 700, 
                fontSize: "36px", 
                letterSpacing: "0.8px" 
              }}
            >
              SPEAKER PARTS
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. STACKED ICON OVER TEXT VARIANT (Used in Footer - scaled 4x globe + 1.5x text)
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <svg 
          viewBox="0 0 560 620" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe Earth Silhouette Only (Centering a 360x360 globe in a 560 width viewBox) */}
          <g transform="translate(100, 15)">
            <image 
              href="/logo-globe.jpg" 
              x="0" 
              y="0" 
              width="360" 
              height="360" 
              style={{ filter: light ? 'invert(1)' : 'none' }}
            />
          </g>

          {/* Centered Wordmarks on Bottom (1.5x scale, horizontal center at 280, minimal gap) */}
          <g transform="translate(280, 385) scale(1.5)">
            <text 
              x="0" 
              y="40" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-manrope), Manrope, sans-serif", 
                fontWeight: 800, 
                fontSize: "64px", 
                letterSpacing: "-1px" 
              }}
            >
              GLOBAL
            </text>
            
            <rect x="-130" y="55" width="260" height="9" fill={accentColor} rx="1" />
            
            <text 
              x="0" 
              y="94" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-manrope), Manrope, sans-serif", 
                fontWeight: 700, 
                fontSize: "30px", 
                letterSpacing: "0.8px" 
              }}
            >
              SPEAKER PARTS
            </text>
            
            <text 
              x="0" 
              y="120" 
              fill={light ? "#A3A3A8" : "#5C5C63"} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-inter), Inter, sans-serif", 
                fontWeight: 850, 
                fontSize: "9.5px", 
                letterSpacing: "3.6px" 
              }}
            >
              MANUFACTURING <tspan fill={accentColor}>•</tspan> WHOLESALE <tspan fill={accentColor}>•</tspan> EXPORT
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 4. PRIMARY HORIZONTAL VARIANT (DEFAULT - Used in Navbar)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 680 270" 
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Circle Icon (2x size: width/height increased to 240) */}
        <g transform="translate(10, 10)">
          <image 
            href="/logo-globe.jpg" 
            x="10" 
            y="0" 
            width="240" 
            height="240" 
            style={{ filter: light ? 'invert(1)' : 'none' }}
          />
        </g>

        {/* Right Side Text Block (Shifted to right for 2x globe size) */}
        <g transform="translate(280, 50)">
          <text 
            x="0" 
            y="65" 
            fill={mainColor} 
            style={{ 
              fontFamily: "var(--font-manrope), Manrope, sans-serif", 
              fontWeight: 800, 
              fontSize: "94px", 
              letterSpacing: "-1.5px" 
            }}
          >
            GLOBAL
          </text>
          
          <rect x="0" y="82" width="356" height="11" fill={accentColor} rx="1.5" />
          
          <text 
            x="0" 
            y="132" 
            fill={mainColor} 
            style={{ 
              fontFamily: "var(--font-manrope), Manrope, sans-serif", 
              fontWeight: 700, 
              fontSize: "45px", 
              letterSpacing: "1.2px" 
            }}
          >
            SPEAKER PARTS
          </text>
        </g>

        {/* Tagline under both (Centered in expanded viewbox) */}
        <text 
          x="340" 
          y="255" 
          fill={light ? "#A3A3A8" : "#5C5C63"} 
          textAnchor="middle"
          style={{ 
            fontFamily: "var(--font-manrope), Manrope, sans-serif", 
            fontWeight: 700, 
            fontSize: "17.5px", 
            letterSpacing: "5.6px" 
          }}
        >
          MANUFACTURING <tspan fill={accentColor} dy="-1.5">•</tspan><tspan dy="1.5"> WHOLESALE </tspan><tspan fill={accentColor} dy="-1.5">•</tspan><tspan dy="1.5"> EXPORT</tspan>
        </text>
      </svg>
    </div>
  );
}
