// ZoomModal.js
import React, { useState } from 'react';

const ZoomModal = ({ imageSrc, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1); // Initial zoom level (1 = 100%)

  // Function to adjust zoom level on scroll
  const handleScrollZoom = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1; // Zoom out on scroll down, in on scroll up
    setZoomLevel((prevZoom) => Math.min(Math.max(prevZoom + delta, 1), 5)); // Limit zoom between 1x and 5x
  };

  // Function to increase zoom on button click
  const zoomIn = () => setZoomLevel((prevZoom) => Math.min(prevZoom + 0.2, 5)); // Max zoom level 5x

  // Function to decrease zoom on button click
  const zoomOut = () => setZoomLevel((prevZoom) => Math.max(prevZoom - 0.2, 1)); // Min zoom level 1x

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onWheel={handleScrollZoom} // Attach scroll handler for zooming
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt="Zoomed view"
          style={{ transform: `scale(${zoomLevel})` }} // Apply zoom level via scale
          className="max-w-full max-h-full transition-transform duration-300" // Smooth transition for zoom
        />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-75 px-3 py-1 rounded"
        >
          Close
        </button>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={zoomOut}
            className="bg-white text-black px-3 py-1 rounded"
            disabled={zoomLevel <= 1} // Disable zoom out at min level
          >
            -
          </button>
          <button
            onClick={zoomIn}
            className="bg-white text-black px-3 py-1 rounded"
            disabled={zoomLevel >= 5} // Disable zoom in at max level
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;
