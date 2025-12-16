import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-8 px-4 text-center">
      <h1 className="font-hand text-5xl md:text-6xl text-charcoal mb-3 drop-shadow-sm">
        Sketchify AI
      </h1>
      <p className="text-gray-600 font-sans max-w-md mx-auto">
        Turn your photos into beautiful hand-drawn pencil sketches instantly using Gemini.
      </p>
    </header>
  );
};