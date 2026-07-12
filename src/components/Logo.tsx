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
  const brandBlue = "#0F0F10"; // Premium Jet Black
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
            {/* Globe (Back) */}
            <circle cx="100" cy="82" r="62" fill="white" stroke={mainColor} strokeWidth="4.5" />
            <path d="M 100,20 L 100,144" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 25,62 0 0,0 100,144" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 25,62 0 0,1 100,144" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 48,62 0 0,0 100,144" fill="none" stroke={mainColor} strokeWidth="2" />
            <path d="M 100,20 A 48,62 0 0,1 100,144" fill="none" stroke={mainColor} strokeWidth="2" />
            
            <line x1="48" y1="52" x2="152" y2="52" stroke={mainColor} strokeWidth="2.5" />
            <line x1="38" y1="82" x2="162" y2="82" stroke={mainColor} strokeWidth="2.5" />
            <line x1="48" y1="112" x2="152" y2="112" stroke={mainColor} strokeWidth="2.5" />

            {/* Orbit Ring */}
            <path d="M 22,96 C 10,82 190,82 178,96 C 172,102 28,102 22,96 Z" fill="none" stroke={mainColor} strokeWidth="4.5" transform="rotate(-6 100 90)" />

            {/* Speaker Basket */}
            <path d="M 46,120 C 46,155 154,155 154,120" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <path d="M 68,142 C 68,162 132,162 132,142" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <path d="M 80,154 C 80,165 120,165 120,154" fill={mainColor} stroke={mainColor} strokeWidth="5.5" />

            {/* Speaker Gasket */}
            <ellipse cx="100" cy="116" rx="76" ry="22" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <ellipse cx="100" cy="116" rx="64" ry="17.5" fill="none" stroke={mainColor} strokeWidth="3" />
            <ellipse cx="100" cy="116" rx="52" ry="13.5" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <ellipse cx="100" cy="116" rx="16" ry="6" fill={mainColor} />
            
            <circle cx="28" cy="116" r="3.5" fill={mainColor} />
            <circle cx="172" cy="116" r="3.5" fill={mainColor} />
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
          viewBox="0 0 400 130" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <text 
              x="200" 
              y="68" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "Georgia, 'Times New Roman', serif", 
                fontWeight: 900, 
                fontSize: "72px", 
                letterSpacing: "4px"
              }}
            >
              GLOBAL
            </text>
            
            <text 
              x="200" 
              y="110" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "Georgia, 'Times New Roman', serif", 
                fontWeight: "bold", 
                fontSize: "19px", 
                letterSpacing: "4.5px"
              }}
            >
              SPEAKER PARTS
            </text>
            
            <line x1="15" y1="103" x2="88" y2="103" stroke={mainColor} strokeWidth="1.8" />
            <line x1="312" y1="103" x2="385" y2="103" stroke={mainColor} strokeWidth="1.8" />
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
          viewBox="0 0 400 350" 
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Logo Icon on Top */}
          <g transform="translate(100, 15)">
            <circle cx="100" cy="82" r="62" fill="white" stroke={mainColor} strokeWidth="4.5" />
            <path d="M 100,20 L 100,144" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 25,62 0 0,0 100,144" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 25,62 0 0,1 100,144" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <path d="M 100,20 A 48,62 0 0,0 100,144" fill="none" stroke={mainColor} strokeWidth="2" />
            <path d="M 100,20 A 48,62 0 0,1 100,144" fill="none" stroke={mainColor} strokeWidth="2" />
            
            <line x1="48" y1="52" x2="152" y2="52" stroke={mainColor} strokeWidth="2.5" />
            <line x1="38" y1="82" x2="162" y2="82" stroke={mainColor} strokeWidth="2.5" />
            <line x1="48" y1="112" x2="152" y2="112" stroke={mainColor} strokeWidth="2.5" />

            <path d="M 22,96 C 10,82 190,82 178,96 C 172,102 28,102 22,96 Z" fill="none" stroke={mainColor} strokeWidth="4.5" transform="rotate(-6 100 90)" />

            <path d="M 46,120 C 46,155 154,155 154,120" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <path d="M 68,142 C 68,162 132,162 132,142" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <path d="M 80,154 C 80,165 120,165 120,154" fill={mainColor} stroke={mainColor} strokeWidth="5.5" />

            <ellipse cx="100" cy="116" rx="76" ry="22" fill="white" stroke={mainColor} strokeWidth="5.5" />
            <ellipse cx="100" cy="116" rx="64" ry="17.5" fill="none" stroke={mainColor} strokeWidth="3" />
            <ellipse cx="100" cy="116" rx="52" ry="13.5" fill="none" stroke={mainColor} strokeWidth="2.5" />
            <ellipse cx="100" cy="116" rx="16" ry="6" fill={mainColor} />
            
            <circle cx="28" cy="116" r="3.5" fill={mainColor} />
            <circle cx="172" cy="116" r="3.5" fill={mainColor} />
          </g>

          {/* Centered Wordmarks on Bottom */}
          <g transform="translate(0, 195)">
            <text 
              x="200" 
              y="68" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "Georgia, 'Times New Roman', serif", 
                fontWeight: 900, 
                fontSize: "72px", 
                letterSpacing: "4px"
              }}
            >
              GLOBAL
            </text>
            
            <text 
              x="200" 
              y="110" 
              fill={mainColor} 
              textAnchor="middle"
              style={{ 
                fontFamily: "Georgia, 'Times New Roman', serif", 
                fontWeight: "bold", 
                fontSize: "19px", 
                letterSpacing: "4.5px"
              }}
            >
              SPEAKER PARTS
            </text>
            
            <line x1="15" y1="103" x2="88" y2="103" stroke={mainColor} strokeWidth="1.8" />
            <line x1="312" y1="103" x2="385" y2="103" stroke={mainColor} strokeWidth="1.8" />
          </g>
        </svg>
      </div>
    );
  }

  // 4. PRIMARY HORIZONTAL VARIANT (DEFAULT)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 520 180" 
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Circle Icon */}
        <g transform="translate(-10, -5)">
          <circle cx="100" cy="92" r="62" fill="white" stroke={mainColor} strokeWidth="4.5" />
          <path d="M 100,30 L 100,154" stroke={mainColor} strokeWidth="2.5" />
          <path d="M 100,30 A 25,62 0 0,0 100,154" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <path d="M 100,30 A 25,62 0 0,1 100,154" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <path d="M 100,30 A 48,62 0 0,0 100,154" fill="none" stroke={mainColor} strokeWidth="2" />
          <path d="M 100,30 A 48,62 0 0,1 100,154" fill="none" stroke={mainColor} strokeWidth="2" />
          
          <line x1="48" y1="62" x2="152" y2="62" stroke={mainColor} strokeWidth="2.5" />
          <line x1="38" y1="92" x2="162" y2="92" stroke={mainColor} strokeWidth="2.5" />
          <line x1="48" y1="122" x2="152" y2="122" stroke={mainColor} strokeWidth="2.5" />

          <path d="M 22,106 C 10,92 190,92 178,106 C 172,112 28,112 22,106 Z" fill="none" stroke={mainColor} strokeWidth="4.5" transform="rotate(-6 100 100)" />

          <path d="M 46,130 C 46,165 154,165 154,130" fill="white" stroke={mainColor} strokeWidth="5.5" />
          <path d="M 68,152 C 68,172 132,172 132,152" fill="white" stroke={mainColor} strokeWidth="5.5" />
          <path d="M 80,164 C 80,175 120,175 120,164" fill={mainColor} stroke={mainColor} strokeWidth="5.5" />

          <ellipse cx="100" cy="126" rx="76" ry="22" fill="white" stroke={mainColor} strokeWidth="5.5" />
          <ellipse cx="100" cy="126" rx="64" ry="17.5" fill="none" stroke={mainColor} strokeWidth="3" />
          <ellipse cx="100" cy="126" rx="52" ry="13.5" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <ellipse cx="100" cy="126" rx="16" ry="6" fill={mainColor} />
          
          <circle cx="28" cy="126" r="3.5" fill={mainColor} />
          <circle cx="172" cy="126" r="3.5" fill={mainColor} />
        </g>

        {/* Right Side Text Block */}
        <g transform="translate(165, 20)">
          <text 
            x="0" 
            y="65" 
            fill={mainColor} 
            style={{ 
              fontFamily: "Georgia, 'Times New Roman', serif", 
              fontWeight: 900, 
              fontSize: "65px", 
              letterSpacing: "4px"
            }}
          >
            GLOBAL
          </text>
          
          <text 
            x="0" 
            y="108" 
            fill={mainColor} 
            style={{ 
              fontFamily: "Georgia, 'Times New Roman', serif", 
              fontWeight: "bold", 
              fontSize: "17.5px", 
              letterSpacing: "4.5px"
            }}
          >
            SPEAKER PARTS
          </text>
          
          <line x1="172" y1="102" x2="310" y2="102" stroke={mainColor} strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}
