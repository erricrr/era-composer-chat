
import React from 'react';

export function MusicNoteDecoration() {
  return (
    <div className="fixed pointer-events-none inset-0 z-0 opacity-15 dark:opacity-15">
      {/* Musical notes scattered around */}
      <div className="absolute top-[10%] left-[5%] text-2xl rotate-12">♩</div>
      <div className="absolute top-[25%] right-[15%] text-4xl -rotate-6">♪</div>
      <div className="absolute top-[65%] left-[25%] text-3xl rotate-3">♫</div>
      <div className="absolute top-[35%] right-[20%] text-5xl -rotate-12">♬</div>
      <div className="absolute top-[75%] right-[5%] text-3xl rotate-9">♩</div>
      <div className="absolute top-[45%] left-[8%] text-4xl -rotate-3">♪</div>
      <div className="absolute top-[15%] right-[30%] text-2xl rotate-15">♫</div>
      <div className="absolute top-[85%] left-[40%] text-4xl -rotate-9">♬</div>
    </div>
  );
}
