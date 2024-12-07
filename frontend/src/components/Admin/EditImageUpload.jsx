import { useState } from 'react';
import { toast } from 'react-toastify';

const ImageUpload = ({ images, setImages, setCropperOpen, setIsNewImage }) => {
  const MAX_IMAGES = 4; // Limit to 4 images

  const handleImageChange = (files) => {
    const newImages = [...images];  // Copy the current images state
    let addedCount = 0;  // Track how many new images have been added

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }

      if (addedCount + newImages.filter(img => img !== null).length < MAX_IMAGES) {
        const firstNullIndex = newImages.findIndex((image) => image === null);

        if (firstNullIndex !== -1) {
          newImages[firstNullIndex] = URL.createObjectURL(file); // Add the new image
          addedCount++;

          // Update `isNewImage` for newly added images
          setIsNewImage((prev) => {
            const newIsNewImage = [...prev];
            newIsNewImage[firstNullIndex] = true; // Mark this image as new
            return newIsNewImage;
          });
        } else if (newImages.length < MAX_IMAGES) {
          newImages.push(URL.createObjectURL(file));
          addedCount++;

          // Update `isNewImage` for newly added images
          setIsNewImage((prev) => {
            const newIsNewImage = [...prev, true];
            return newIsNewImage;
          });
        }
      }
    });

    if (addedCount + newImages.filter(img => img !== null).length >= MAX_IMAGES) {
      toast.warning("You can upload up to 4 images.");
    }

    setImages(newImages);  // Update the images state
  };

  const handleCropOpen = (index) => {
    setCropperOpen((prev) => {
      const newOpen = Array.isArray(prev) ? [...prev] : [false, false, false, false];
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
                <img src={image} alt={`Product preview ${index + 1}`} className="w-24 h-24 object-cover" />
                <button
                  type="button"
                  className="absolute top-0 left-0 bg-black text-white p-1 text-xs"
                  onClick={() => handleCropOpen(index)}
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

