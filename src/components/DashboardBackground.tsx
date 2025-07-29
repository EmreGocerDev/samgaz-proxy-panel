"use client";

import React from 'react';

const DashboardBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-gray-950">
      {/* Mavi Işıma */}
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-r from-blue-900/50 to-blue-700/30 opacity-50 blur-3xl"></div>
      {/* Mor ve Kırmızı Işıma */}
      <div className="absolute bottom-[-10%] right-[-20%] top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-red-800/40 to-purple-800/40 opacity-60 blur-3xl"></div>
    </div>
  );
};

export default DashboardBackground;