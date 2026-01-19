'use client';

import React from 'react';

export const GreenBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#dff7e6_1px,transparent_1px),linear-gradient(to_bottom,#dff7e6_1px,transparent_1px)] bg-[size:4rem_3rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_900px_at_100%_180px,#bff0d6_40%,transparent_60%)] pointer-events-none" />
    </div>
  );
};

export default GreenBackground;

