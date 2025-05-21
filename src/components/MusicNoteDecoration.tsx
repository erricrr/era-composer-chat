import React from 'react';

type MusicNoteDecorationProps = {
  lightModeOpacity?: string;
  darkModeOpacity?: string;
};

export function MusicNoteDecoration({
  lightModeOpacity = "10%",
  darkModeOpacity = "10%"
}: MusicNoteDecorationProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`absolute inset-0 pointer-events-none opacity-[${lightModeOpacity}] dark:opacity-[${darkModeOpacity}]`}
    >
      {/* Musical notes with multi-directional floating animations */}
      <div className="absolute top-[10%] left-[5%] text-2xl rotate-12 animate-float-1" style={{ animationDelay: "0.3s" }}>♩</div>
      <div className="absolute top-[25%] right-[15%] text-4xl -rotate-6 animate-float-2" style={{ animationDelay: "1.2s" }}>♪</div>
      <div className="absolute top-[65%] left-[25%] text-3xl rotate-3 animate-float-3" style={{ animationDelay: "0.8s" }}>♫</div>
      <div className="absolute top-[35%] right-[20%] text-5xl -rotate-12 animate-float-4" style={{ animationDelay: "2.1s" }}>♬</div>
      <div className="absolute top-[75%] right-[5%] text-3xl rotate-9 animate-float-1" style={{ animationDelay: "1.5s" }}>♩</div>
      <div className="absolute top-[45%] left-[8%] text-4xl -rotate-3 animate-float-2" style={{ animationDelay: "0.7s" }}>♪</div>
      <div className="absolute top-[15%] right-[30%] text-2xl rotate-6 animate-float-3" style={{ animationDelay: "1.9s" }}>♫</div>
      <div className="absolute top-[85%] left-[40%] text-4xl -rotate-9 animate-float-4" style={{ animationDelay: "0.4s" }}>♬</div>
      <div className="absolute top-[55%] left-[65%] text-3xl rotate-15 animate-float-2" style={{ animationDelay: "1.1s" }}>♩</div>
      <div className="absolute top-[32%] left-[45%] text-2xl -rotate-9 animate-float-3" style={{ animationDelay: "0.6s" }}>♪</div>
      <div className="absolute top-[8%] left-[80%] text-4xl rotate-3 animate-float-1" style={{ animationDelay: "1.7s" }}>♬</div>
      <div className="absolute top-[90%] right-[25%] text-3xl -rotate-6 animate-float-4" style={{ animationDelay: "2.3s" }}>♫</div>

      {/* Additional notes for the left side to balance the distribution */}
      <div className="absolute top-[20%] left-[18%] text-3xl rotate-8 animate-float-2" style={{ animationDelay: "1.3s" }}>♪</div>
      <div className="absolute top-[40%] left-[22%] text-4xl -rotate-5 animate-float-3" style={{ animationDelay: "0.5s" }}>♫</div>
      <div className="absolute top-[60%] left-[12%] text-2xl rotate-10 animate-float-1" style={{ animationDelay: "2.0s" }}>♩</div>
      <div className="absolute top-[80%] left-[15%] text-5xl -rotate-8 animate-float-4" style={{ animationDelay: "0.9s" }}>♬</div>
      <div className="absolute top-[28%] left-[3%] text-3xl rotate-15 animate-float-2" style={{ animationDelay: "1.8s" }}>♪</div>
    </div>
  );
}
