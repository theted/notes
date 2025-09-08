import React from 'react';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const TopBar: React.FC<Props> = ({ left, right }) => (
  <div className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur">
    <div className="max-w-4xl mx-auto h-16 px-6 flex items-center gap-3">
      <div className="min-w-0 flex items-center gap-2">{left}</div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">{right}</div>
    </div>
  </div>
);

export default TopBar;
