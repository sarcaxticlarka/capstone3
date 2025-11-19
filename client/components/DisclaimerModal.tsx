"use client";

import React, { useEffect, useState } from 'react';

export default function DisclaimerModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('disclaimer_seen');
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('disclaimer_seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-xl text-center ring-[0.5px] ring-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-white">Disclaimer</h2>
        <p className="mb-6 text-md text-gray-200">
          This project is made solely for educational and personal learning purposes. I do not support or promote piracy, unauthorized distribution, or misuse of any software, assets, or content. All resources, tools, and techniques demonstrated here are intended to help developers learn and experiment within legal and ethical boundaries.
        </p>
        <button
          onClick={handleClose}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition duration-200 cursor-pointer"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
