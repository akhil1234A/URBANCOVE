import React, { useState } from 'react';
import { toast } from 'react-toastify'

const ImageUpload = ({ images, setImages, setCropperOpen }) => {
  const [cropIndex, setCropIndex] = useState(null); // To track which image is currently being cropped

  const handleImageChange = (files) => {
    const newImages = [...images];
    Array.from(files).forEach((file, index) => {

      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        alert('only image files are allowed')
        return;
      }

      newImages[index] = URL.createObjectURL(file);
      setImages(newImages);
    });
  };

  const handleCropOpen = (index) => {
    setCropIndex(index);
    setCropperOpen((prev) => {
      const newOpen = [...prev];
      newOpen[index] = true; // Open cropper for the selected image
      return newOpen;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImageChange(e.target.files)}
        className="mb-2"
      />
      <div className="flex gap-4">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            {image && (
              <div className="relative">
                <img src={image} alt={`Product preview ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                <button
                  onClick={() => handleCropOpen(index)}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-sm rounded px-1"
                >
                  Crop
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
