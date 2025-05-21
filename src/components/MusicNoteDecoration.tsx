import React from 'react';

type MusicNoteDecorationProps = {
  lightModeOpacity?: string;
  darkModeOpacity?: string;
};

export function MusicNoteDecoration({
  lightModeOpacity = "0.05",
  darkModeOpacity = "0.04"
}: MusicNoteDecorationProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="absolute inset-0 pointer-events-none z-[-1]"
      style={{
        opacity: "var(--tw-text-opacity, 1)",
      }}
    >
      {/* Musical notes with multi-directional floating animations */}
      <div className="absolute top-[10%] left-[5%] text-2xl rotate-12 animate-float-1 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.3s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♩</div>
      <div className="absolute top-[25%] right-[15%] text-4xl -rotate-6 animate-float-2 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.2s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♪</div>
      <div className="absolute top-[65%] left-[25%] text-3xl rotate-3 animate-float-3 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.8s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♫</div>
      <div className="absolute top-[35%] right-[20%] text-5xl -rotate-12 animate-float-4 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "2.1s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♬</div>
      <div className="absolute top-[75%] right-[5%] text-3xl rotate-9 animate-float-1 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.5s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♩</div>
      <div className="absolute top-[45%] left-[8%] text-4xl -rotate-3 animate-float-2 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.7s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♪</div>
      <div className="absolute top-[15%] right-[30%] text-2xl rotate-6 animate-float-3 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.9s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♫</div>
      <div className="absolute top-[85%] left-[40%] text-4xl -rotate-9 animate-float-4 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.4s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♬</div>
      <div className="absolute top-[55%] left-[65%] text-3xl rotate-15 animate-float-2 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.1s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♩</div>
      <div className="absolute top-[32%] left-[45%] text-2xl -rotate-9 animate-float-3 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.6s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♪</div>
      <div className="absolute top-[8%] left-[80%] text-4xl rotate-3 animate-float-1 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.7s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♬</div>
      <div className="absolute top-[90%] right-[25%] text-3xl -rotate-6 animate-float-4 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "2.3s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♫</div>

      {/* Additional notes for the left side to balance the distribution */}
      <div className="absolute top-[20%] left-[18%] text-3xl rotate-8 animate-float-2 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.3s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♪</div>
      <div className="absolute top-[40%] left-[22%] text-4xl -rotate-5 animate-float-3 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.5s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♫</div>
      <div className="absolute top-[60%] left-[12%] text-2xl rotate-10 animate-float-1 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "2.0s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♩</div>
      <div className="absolute top-[80%] left-[15%] text-5xl -rotate-8 animate-float-4 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "0.9s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♬</div>
      <div className="absolute top-[28%] left-[3%] text-3xl rotate-15 animate-float-2 opacity-[var(--note-opacity)] dark:opacity-[var(--note-dark-opacity)]" style={{ animationDelay: "1.8s", "--note-opacity": lightModeOpacity, "--note-dark-opacity": darkModeOpacity } as React.CSSProperties}>♪</div>
    </div>
  );
}
