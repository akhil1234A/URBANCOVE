import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  images: (string | null)[];
  setImages: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  setCropperOpen: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, setImages, setCropperOpen }) => {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = [...images];
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed');
          return;
        }
        const emptyIndex = newImages.findIndex(img => img === null);
        if (emptyIndex !== -1) {
          newImages[emptyIndex] = URL.createObjectURL(file);
        } else {
          toast.error('Maximum 4 images allowed');
        }
      });
      setImages(newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleCropOpen = (index: number) => {
    setCropperOpen((prev) => {
      const newOpen = [...prev];
      newOpen[index] = true;
      return newOpen;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="mb-2"
      />
      <div className="flex gap-4 flex-wrap">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            {image && (
              <div className="relative">
                <img src={image} alt={`Product preview ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                <button
                  onClick={() => handleCropOpen(index)}
                  className="absolute bottom-0 left-0 bg-blue-500 text-white text-sm rounded px-1"
                >
                  Crop
                </button>
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
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

