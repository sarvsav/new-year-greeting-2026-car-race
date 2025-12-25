import React from 'react';

interface CarProps {
  isMoving: boolean;
  velocity: number;
  driver: 'male' | 'female';
}

export const Car: React.FC<CarProps> = ({ isMoving, velocity, driver }) => {
  const isBoosting = velocity > 18; // Threshold for visual boost

  // Render helper for characters
  const renderCharacter = (type: 'male' | 'female', position: 'front' | 'back') => {
    const isMale = type === 'male';
    // Front seat is slightly lower/forward (translate handled in parent group)
    // Back seat is slightly higher/back
    
    return (
      <g>
        {/* Hair/Accessories */}
        {!isMale && (
          <path 
            d="M-3 2 Q-8 5 -5 10" 
            stroke="#fcd34d" 
            strokeWidth="3" 
            fill="none" 
            className="origin-top" 
            style={{ animation: isMoving ? 'hairWhip 0.2s infinite' : 'none' }} 
          />
        )}
        
        {/* Helmet */}
        <circle 
          cx="0" 
          cy="0" 
          r={isMale ? 5 : 4.5} 
          fill={isMale ? "#3b82f6" : "#ec4899"} 
          stroke="#000" 
          strokeWidth="1.5" 
        />
        
        {/* Visor */}
        <path 
          d={isMale ? "M1 1 L5 3" : "M1 1 L4 2"} 
          stroke="#000" 
          strokeWidth="1" 
          strokeLinecap="round" 
        />
      </g>
    );
  };

  return (
    <div className={`relative w-28 sm:w-32 md:w-40 h-14 sm:h-16 md:h-20 transition-transform duration-100 ${isMoving ? 'translate-y-0.5' : ''}`}>
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(100%) scaleX(0.5); opacity: 0; }
          20% { opacity: 1; transform: translateX(0%) scaleX(1); }
          100% { transform: translateX(-150%) scaleX(1.5); opacity: 0; }
        }
        .animate-speed-line {
          animation: speedLine 0.4s linear infinite;
        }
        @keyframes particleFly {
            0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
            100% { transform: translate(-100px, -20px) scale(0); opacity: 0; }
        }
        .particle {
            position: absolute;
            background: #cbd5e1; /* slate-300 for dust */
            border-radius: 50%;
            pointer-events: none;
        }
        @keyframes hairWhip {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(15deg); }
        }
      `}</style>

      {/* Particles (Dust/Sparks) */}
      {isMoving && (
          <div className="absolute bottom-2 left-2 z-0">
             {/* We create a few static divs with different animation delays to simulate a stream */}
             {[...Array(5)].map((_, i) => (
                 <div key={i} 
                      className={`particle ${isBoosting ? 'bg-yellow-200' : 'bg-slate-400'}`}
                      style={{
                          width: isBoosting ? '6px' : '4px',
                          height: isBoosting ? '6px' : '4px',
                          left: `${Math.random() * 10}px`,
                          top: `${Math.random() * 10}px`,
                          animation: `particleFly ${0.5 - (velocity * 0.01)}s linear infinite`,
                          animationDelay: `${i * 0.1}s`,
                          boxShadow: isBoosting ? '0 0 4px orange' : 'none'
                      }}
                 />
             ))}
          </div>
      )}

      {/* Speed Lines (Only visible when boosting) */}
      <div className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-300 ${isBoosting ? 'opacity-100' : 'opacity-0'}`}>
         {/* Upper Line */}
         <div className="absolute top-[-10px] right-0 w-24 h-1 bg-cyan-300/60 rounded-full animate-speed-line" style={{ animationDelay: '0s', animationDuration: '0.3s' }}></div>
         {/* Middle Line */}
         <div className="absolute top-[30px] right-[-20px] w-32 h-0.5 bg-white/80 rounded-full animate-speed-line" style={{ animationDelay: '0.1s', animationDuration: '0.2s' }}></div>
         {/* Lower Line */}
         <div className="absolute bottom-[0px] right-[-10px] w-20 h-1 bg-cyan-300/60 rounded-full animate-speed-line" style={{ animationDelay: '0.05s', animationDuration: '0.25s' }}></div>
      </div>

      <svg viewBox="0 0 140 60" className={`w-full h-full overflow-visible transition-all duration-300 ${isBoosting ? 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] filter blur-[0.3px]' : 'drop-shadow-xl'}`}>
        <defs>
          <linearGradient id="carBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
           <filter id="motionBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={isBoosting ? "2 0" : "0"} />
          </filter>
        </defs>

        {/* Rear Wing Assembly */}
        <path d="M5 20 L5 5 L25 5 L25 10 L10 10 L10 20 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <rect x="2" y="5" width="4" height="25" fill="#450a0a" rx="1" />

        {/* Main Body - Extended cockpit for 2 people */}
        <path d="M20 35 L30 20 L45 20 L50 15 L82 15 L87 18 L125 30 L135 35 L130 42 L25 42 Z" fill="url(#carBodyGradient)" />
        
        {/* Sidepod / Air Intake */}
        <path d="M45 35 L50 25 L85 25 L90 35 Z" fill="#b91c1c" />
        <path d="M50 25 L50 35" stroke="#7f1d1d" strokeWidth="0.5" />

        {/* Cockpit Area */}
        <path d="M55 15 L53 10 L82 10 L85 15" fill="#1e293b" /> {/* Dark Headrest Area */}
        
        {/* Passenger (Back Seat) */}
        <g transform="translate(62, 9)">
            {renderCharacter(driver === 'male' ? 'female' : 'male', 'back')}
        </g>

        {/* Driver (Front Seat) */}
        <g transform="translate(76, 11)">
             {renderCharacter(driver, 'front')}
        </g>

        {/* Front Wing */}
        <path d="M125 38 L140 38 L140 42 L120 42 Z" fill="#991b1b" />
        <path d="M128 38 L128 32 L130 32 L130 38" fill="#450a0a" />

        {/* Branding */}
        <text x="55" y="32" fontSize="6" fontWeight="bold" fill="white" fontStyle="italic" style={{ userSelect: 'none' }}>2026</text>

        {/* Rear Wheel */}
        <g transform="translate(25, 40)" filter={isBoosting ? "url(#motionBlur)" : ""}>
           <circle cx="0" cy="0" r="14" fill="#171717" stroke="#0f0f0f" strokeWidth="2" />
           <circle cx="0" cy="0" r="8" fill="#262626" />
           {/* Wheel Spokes/Motion Blur */}
           <g className={isMoving ? "animate-spin" : ""} style={{ animationDuration: isBoosting ? '0.1s' : '0.2s' }}>
              <path d="M-8 0 L8 0 M0 -8 L0 8" stroke="#404040" strokeWidth="2" />
              <circle cx="0" cy="0" r="3" fill="#525252" />
           </g>
        </g>

        {/* Front Wheel */}
        <g transform="translate(110, 40)" filter={isBoosting ? "url(#motionBlur)" : ""}>
           <circle cx="0" cy="0" r="12" fill="#171717" stroke="#0f0f0f" strokeWidth="2" />
           <circle cx="0" cy="0" r="7" fill="#262626" />
           <g className={isMoving ? "animate-spin" : ""} style={{ animationDuration: isBoosting ? '0.1s' : '0.2s' }}>
              <path d="M-7 0 L7 0 M0 -7 L0 7" stroke="#404040" strokeWidth="2" />
              <circle cx="0" cy="0" r="2.5" fill="#525252" />
           </g>
        </g>
      </svg>
      
      {/* Dynamic Exhaust Flame - Increases with speed */}
      {isMoving && (
        <div className={`
            absolute top-[35px] left-[-20px] h-8 rounded-full blur-md animate-pulse mix-blend-add transition-all duration-300
            ${isBoosting ? 'w-32 bg-gradient-to-l from-blue-400 via-orange-400 to-transparent opacity-90' : 'w-20 bg-gradient-to-l from-orange-400 to-transparent opacity-80'}
        `}></div>
      )}
    </div>
  );
};