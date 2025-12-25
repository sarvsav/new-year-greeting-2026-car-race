import React from 'react';

interface TrackProps {
  distance: number;
}

export const Track: React.FC<TrackProps> = ({ distance }) => {
  // Generate static audience data to prevent re-renders randomizing them
  const audience = React.useMemo(() => Array.from({ length: 80 }), []);
  
  const messages = [
    "GREAT WORK THIS YEAR",
    "YOU DID IT",
    "FULL SPEED AHEAD",
    "HELLO 2026",
    "KEEP PUSHING",
    "CHAMPION",
    "STAY FAST",
    "NICE DRIVING",
    "THE FUTURE IS BRIGHT",
    "POLE POSITION"
  ];

  return (
    <div className="absolute top-0 left-0 w-[5000px] h-full" style={{ transform: `translateX(${-distance}px)` }}>
      
      {/* Crowd / Audience Layer (Behind the road) */}
      {/* Adjusted top position and padding for better mobile visibility */}
      <div className="absolute top-[15%] sm:top-[22%] left-0 w-full flex items-end space-x-1 sm:space-x-3 px-2 sm:px-10 h-24 sm:h-24 overflow-visible pointer-events-none z-0">
         <style>{`
            @keyframes armWave {
                0%, 100% { transform: rotate(-25deg); }
                50% { transform: rotate(25deg); }
            }
         `}</style>
         {audience.map((_, i) => {
             const color = ['#f87171', '#60a5fa', '#facc15', '#4ade80', '#c084fc', '#fb923c', '#e879f9'][i % 7];
             const bounceDelay = Math.random();
             const bounceDuration = 0.5 + Math.random() * 0.5;
             
             return (
             <div key={i} className="relative flex-shrink-0 flex flex-col items-center justify-end pb-4">
                 <div className="relative animate-bounce" 
                      style={{ 
                          animationDuration: `${bounceDuration}s`,
                          animationDelay: `${bounceDelay}s`
                      }}>
                     
                     {/* Head */}
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full mx-auto mb-0.5 relative z-10 shadow-sm" style={{ backgroundColor: color }}></div>
                     
                     {/* Body Group */}
                     <div className="relative flex justify-center">
                        {/* Left Arm */}
                        <div className="absolute -left-0.5 sm:-left-1 top-0 w-1 sm:w-1.5 h-3.5 sm:h-5 rounded-full origin-bottom opacity-90"
                             style={{ 
                                 backgroundColor: color, 
                                 animation: `armWave ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
                                 animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                                 transformOrigin: 'bottom center'
                             }}></div>
                        
                        {/* Right Arm */}
                        <div className="absolute -right-0.5 sm:-right-1 top-0 w-1 sm:w-1.5 h-3.5 sm:h-5 rounded-full origin-bottom opacity-90"
                             style={{ 
                                 backgroundColor: color,
                                 animation: `armWave ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
                                 animationDirection: i % 2 === 0 ? 'reverse' : 'normal',
                                 transformOrigin: 'bottom center'
                             }}></div>

                        {/* Torso */}
                        <div className="w-3.5 sm:w-5 h-5 sm:h-7 rounded-t-lg relative z-10 shadow-inner" style={{ backgroundColor: color }}></div>
                     </div>
                 </div>
             </div>
         )})}
         <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800/10"></div> {/* Ground shadow */}
      </div>

      {/* Safety Barrier */}
      <div className="absolute top-[calc(25%+2rem)] left-0 w-full h-8 bg-gradient-to-r from-slate-300 to-slate-200 border-t-2 border-slate-400 flex items-center overflow-hidden z-0">
           {/* Barrier Sponsors */}
           {Array.from({ length: 20 }).map((_, i) => (
               <div key={i} className="flex-shrink-0 w-64 h-full border-r border-slate-400 flex items-center justify-center bg-white/50">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-50">
                     {messages[i % messages.length]}
                   </span>
               </div>
           ))}
      </div>

      {/* Road Surface */}
      <div className="absolute top-[calc(25%+4rem)] w-full h-32 sm:h-40 bg-slate-800 border-y-4 border-slate-700">
          
          {/* Start Line - 2025 */}
          <div className="absolute left-[100px] -top-[100px] flex flex-col items-center z-10">
            <div className="text-6xl sm:text-8xl font-black text-slate-900/50 mb-4 transform -skew-x-12">2025</div>
            <div className="w-8 h-64 bg-white skew-x-12 relative overflow-hidden border-x-2 border-slate-500">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
            </div>
          </div>

          {/* Lane Markings */}
          <div className="absolute top-1/2 left-0 w-full flex justify-between px-20">
             {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-24 h-2 sm:h-4 bg-yellow-500 rounded-sm skew-x-[50deg]"></div>
             ))}
          </div>
          
          {/* Finish Line - 2026 */}
          <div className="absolute left-[4000px] -top-[150px] sm:-top-[200px] h-[500px] flex flex-col items-center justify-center z-10">
            <div className="relative">
                 {/* Arch */}
                 <div className="w-[280px] sm:w-[350px] h-[300px] sm:h-[400px] border-[16px] sm:border-[20px] border-slate-800 border-b-0 rounded-t-full flex justify-center pt-10 bg-slate-900/50 backdrop-blur-sm">
                     <div className="text-5xl sm:text-6xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse mt-4">2026</div>
                 </div>
                 {/* Posts */}
                 <div className="absolute bottom-0 left-0 w-[20px] h-[200px] bg-slate-800"></div>
                 <div className="absolute bottom-0 right-0 w-[20px] h-[200px] bg-slate-800"></div>
            </div>
            {/* Checkered Floor Strip */}
            <div className="w-12 h-64 bg-white relative overflow-hidden mt-[-50px] border-x-2 border-slate-500">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]"></div>
            </div>
          </div>
      </div>

      {/* Foreground Elements (Palm Trees passing by) */}
      <div className="absolute top-[calc(25%+4rem+32px)] left-0 w-full h-full pointer-events-none">
           {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="absolute bottom-0 w-24 sm:w-48 h-64 sm:h-96 opacity-20 blur-sm transform scale-x-[-1]" 
                    style={{ left: `${500 + i * 600}px` }}>
                   {/* Simplified Palm Tree Trunk */}
                   <div className="w-4 sm:w-8 h-full bg-slate-800 mx-auto rounded-full skew-x-6"></div>
                   {/* Leaves */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-64 h-32 sm:h-64 rounded-full border-t-8 border-slate-800 rotate-[-20deg]"></div>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-64 h-32 sm:h-64 rounded-full border-t-8 border-slate-800 rotate-[20deg]"></div>
               </div>
           ))}
      </div>

    </div>
  );
};