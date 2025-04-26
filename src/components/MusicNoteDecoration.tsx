import React from 'react';

export function MusicNoteDecoration() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-5">
      {/* Musical notes scattered around */}
      <div className="absolute animate-float top-[10%] left-[5%] text-2xl rotate-12">♩</div>
      <div className="absolute animate-float-delayed top-[25%] right-[15%] text-4xl -rotate-6">♪</div>
      <div className="absolute animate-float top-[65%] left-[25%] text-3xl rotate-3">♫</div>
      <div className="absolute animate-float-delayed top-[35%] right-[20%] text-5xl -rotate-12">♬</div>
      <div className="absolute animate-float top-[75%] right-[5%] text-3xl rotate-9">♩</div>
      <div className="absolute animate-float-delayed top-[45%] left-[8%] text-4xl -rotate-3">♪</div>
      <div className="absolute animate-float top-[15%] right-[30%] text-2xl rotate-15">♫</div>
      <div className="absolute animate-float-delayed top-[85%] left-[40%] text-4xl -rotate-9">♬</div>
    </div>
  );
}
