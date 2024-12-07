import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImageUploadAndCrop = ({ initialImages, setImages, setCroppedImages, setRemovedImages }) => {
  const [activeImage, setActiveImage] = useState(null);
  const [localImages, setLocalImages] = useState([]);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 4;

  useEffect(() => {
    setLocalImages(initialImages || []);
  }, [initialImages]);

  const handleImageChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (files) {
      const newImages = [...localImages];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/") && newImages.filter(img => img !== null).length < MAX_IMAGES) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target.result;
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const size = Math.min(img.width, img.height);
              canvas.width = size;
              canvas.height = size;
              ctx.drawImage(
                img,
                (img.width - size) / 2,
                (img.height - size) / 2,
                size,
                size,
                0,
                0,
                size,
                size
              );
              const croppedImageData = canvas.toDataURL();
              const firstNullIndex = newImages.findIndex((image) => image === null);
              if (firstNullIndex !== -1) {
                newImages[firstNullIndex] = croppedImageData;
              } else if (newImages.length < MAX_IMAGES) {
                newImages.push(croppedImageData);
              }
              setLocalImages(newImages);
              setImages(newImages);
              setCroppedImages(newImages);
            };
            img.src = result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper && activeImage !== null) {
      const croppedImageData = cropperRef.current.cropper.getCroppedCanvas().toDataURL();
      setCroppedImages((prev) => {
        const newCroppedImages = [...prev];
        newCroppedImages[activeImage] = croppedImageData;
        return newCroppedImages;
      });
      setLocalImages((prev) => {
        const newImages = [...prev];
        newImages[activeImage] = croppedImageData;
        return newImages;
      });
      setImages((prev) => {
        const newImages = [...prev];
        newImages[activeImage] = croppedImageData;
        return newImages;
      });
      setActiveImage(null);
    }
  };

  const handleRemoveImage = (index) => {
    setLocalImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    setCroppedImages((prev) => {
      const newCroppedImages = [...prev];
      newCroppedImages[index] = null;
      return newCroppedImages;
    });
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    setRemovedImages((prev) => [...prev, index]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current.click();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <span className="text-sm text-gray-500">
          {localImages.filter(img => img !== null).length}/{MAX_IMAGES} images uploaded
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {localImages.map((image, index) => (
          image && (
            <div key={index} className="relative group">
              <div className="w-full h-32 flex items-center justify-center overflow-hidden">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-contain bg-gray-100 rounded cursor-pointer"
                  onClick={() => setActiveImage(index)}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveImage(index);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          )
        ))}
      </div>

      {activeImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
            <Cropper
              src={localImages[activeImage]}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              guides={false}
              ref={cropperRef}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImage(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCrop();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadAndCrop;

