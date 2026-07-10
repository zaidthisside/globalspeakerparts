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
  const brandBlue = "#00315C";
  const brandOrange = "#ED5A14";
  
  const mainColor = light ? "#FFFFFF" : brandBlue;
  const textColor = light ? "#E2E8F0" : brandBlue;

  // 1. ICON ONLY VARIANT
  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            {/* Outer Ring */}
            <circle cx="80" cy="80" r="72" fill="none" stroke={mainColor} strokeWidth="6.5" />
            {/* Concentric rings representing speaker spider/cone suspensions */}
            <circle cx="80" cy="80" r="54" fill="none" stroke={mainColor} strokeWidth="5.5" />
            <circle cx="80" cy="80" r="38" fill="none" stroke={mainColor} strokeWidth="5.5" />
            <circle cx="80" cy="80" r="23" fill="none" stroke={mainColor} strokeWidth="5.5" />
            {/* Central Orange circle (dust cap) */}
            <circle cx="80" cy="80" r="11" fill={brandOrange} />
            {/* Latitude & Longitude globe grids */}
            <line x1="8" y1="80" x2="152" y2="80" stroke={mainColor} strokeWidth="3" />
            <line x1="80" y1="8" x2="80" y2="152" stroke={mainColor} strokeWidth="3" />
            {/* Elliptical globe curves */}
            <path d="M 80,8 A 50,72 0 0,0 80,152" fill="none" stroke={mainColor} strokeWidth="3" />
            <path d="M 80,8 A 50,72 0 0,1 80,152" fill="none" stroke={mainColor} strokeWidth="3" />
            <path d="M 80,8 A 82,72 0 0,0 80,152" fill="none" stroke={mainColor} strokeWidth="3" opacity="0.85" />
            <path d="M 80,8 A 82,72 0 0,1 80,152" fill="none" stroke={mainColor} strokeWidth="3" opacity="0.85" />
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
                fontFamily: "var(--font-oswald), Oswald, sans-serif", 
                fontWeight: 800, 
                fontSize: "76px", 
                letterSpacing: "-1px" 
              }}
            >
              GLOBAL
            </text>
            <rect x="10" y="74" width="330" height="9.5" fill={brandOrange} rx="1" />
            <text 
              x="10" 
              y="114" 
              fill={mainColor} 
              style={{ 
                fontFamily: "var(--font-oswald), Oswald, sans-serif", 
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

  // 3. STACKED ICON OVER TEXT VARIANT
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <svg 
          viewBox="0 0 360 320" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe Icon on Top */}
          <g transform="translate(100, 0)">
            <circle cx="80" cy="80" r="72" fill="none" stroke={mainColor} strokeWidth="6.5" />
            <circle cx="80" cy="80" r="54" fill="none" stroke={mainColor} strokeWidth="5.5" />
            <circle cx="80" cy="80" r="38" fill="none" stroke={mainColor} strokeWidth="5.5" />
            <circle cx="80" cy="80" r="23" fill="none" stroke={mainColor} strokeWidth="5.5" />
            <circle cx="80" cy="80" r="11" fill={brandOrange} />
            <line x1="8" y1="80" x2="152" y2="80" stroke={mainColor} strokeWidth="3" />
            <line x1="80" y1="8" x2="80" y2="152" stroke={mainColor} strokeWidth="3" />
            <path d="M 80,8 A 50,72 0 0,0 80,152" fill="none" stroke={mainColor} strokeWidth="3" />
            <path d="M 80,8 A 50,72 0 0,1 80,152" fill="none" stroke={mainColor} strokeWidth="3" />
            <path d="M 80,8 A 82,72 0 0,0 80,152" fill="none" stroke={mainColor} strokeWidth="3" opacity="0.85" />
            <path d="M 80,8 A 82,72 0 0,1 80,152" fill="none" stroke={mainColor} strokeWidth="3" opacity="0.85" />
          </g>

          {/* Centered Wordmarks on Bottom */}
          <g>
            <text 
              x="180" 
              y="215" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-oswald), Oswald, sans-serif", 
                fontWeight: 800, 
                fontSize: "74px", 
                letterSpacing: "-1px" 
              }}
            >
              GLOBAL
            </text>
            
            <rect x="25" y="230" width="310" height="9.5" fill={brandOrange} rx="1" />
            
            <text 
              x="180" 
              y="272" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-oswald), Oswald, sans-serif", 
                fontWeight: 700, 
                fontSize: "35px", 
                letterSpacing: "0.8px" 
              }}
            >
              SPEAKER PARTS
            </text>
            
            <text 
              x="180" 
              y="302" 
              fill={textColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "var(--font-inter), Inter, sans-serif", 
                fontWeight: 800, 
                fontSize: "11px", 
                letterSpacing: "4.2px" 
              }}
            >
              MANUFACTURING <tspan fill={brandOrange}>•</tspan> WHOLESALE <tspan fill={brandOrange}>•</tspan> EXPORT
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 4. PRIMARY HORIZONTAL VARIANT (DEFAULT)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 600 240" 
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Circle Icon (Globe & Audio Grid) */}
        <g>
          {/* Outer Ring */}
          <circle cx="110" cy="95" r="75" fill="none" stroke={mainColor} strokeWidth="6.5" />
          
          {/* Concentric rings representing speaker spider/cone suspensions */}
          <circle cx="110" cy="95" r="56" fill="none" stroke={mainColor} strokeWidth="5.5" />
          <circle cx="110" cy="95" r="39" fill="none" stroke={mainColor} strokeWidth="5.5" />
          <circle cx="110" cy="95" r="23" fill="none" stroke={mainColor} strokeWidth="5.5" />
          
          {/* Central Orange circle (dust cap / focal point) */}
          <circle cx="110" cy="95" r="14" fill={brandOrange} />

          {/* Latitude & Longitude globe grids */}
          <line x1="32" y1="95" x2="188" y2="95" stroke={mainColor} strokeWidth="3" />
          <line x1="110" y1="17" x2="110" y2="173" stroke={mainColor} strokeWidth="3" />
          
          {/* Elliptical globe curves */}
          <path d="M 110,17 A 48,78 0 0,0 110,173" fill="none" stroke={mainColor} strokeWidth="3" />
          <path d="M 110,17 A 48,78 0 0,1 110,173" fill="none" stroke={mainColor} strokeWidth="3" />
        </g>

        {/* Right Side Corporate Text Blocks */}
        <g>
          {/* Wordmark: GLOBAL */}
          <text 
            x="212" 
            y="105" 
            fill={mainColor} 
            style={{ 
              fontFamily: "var(--font-oswald), Oswald, sans-serif", 
              fontWeight: 800, 
              fontSize: "94px", 
              letterSpacing: "-1.5px" 
            }}
          >
            GLOBAL
          </text>

          {/* Separation Accent line (Division Bar) */}
          <rect x="212" y="122" width="356" height="11" fill={brandOrange} rx="1.5" />

          {/* Descriptive text: SPEAKER PARTS */}
          <text 
            x="212" 
            y="172" 
            fill={mainColor} 
            style={{ 
              fontFamily: "var(--font-oswald), Oswald, sans-serif", 
              fontWeight: 700, 
              fontSize: "45px", 
              letterSpacing: "1.2px" 
            }}
          >
            SPEAKER PARTS
          </text>
        </g>

        {/* Center-aligned Tagline under both Icon and Text */}
        <text 
          x="300" 
          y="218" 
          fill={textColor} 
          textAnchor="middle"
          style={{ 
            fontFamily: "var(--font-oswald), Oswald, sans-serif", 
            fontWeight: 700, 
            fontSize: "17.5px", 
            letterSpacing: "5.6px" 
          }}
        >
          MANUFACTURING <tspan fill={brandOrange} dy="-1.5">•</tspan><tspan dy="1.5"> WHOLESALE </tspan><tspan fill={brandOrange} dy="-1.5">•</tspan><tspan dy="1.5"> EXPORT</tspan>
        </text>
      </svg>
    </div>
  );
}
