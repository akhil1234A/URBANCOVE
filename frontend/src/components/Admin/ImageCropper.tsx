import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropperProps {
  imageURL: string;
  setCroppedImage: (croppedImage: string) => void;
  setCropperOpen: (open: boolean) => void;
  onCropComplete: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageURL, setCroppedImage, setCropperOpen, onCropComplete }) => {
  const cropperRef = useRef<Cropper>(null);

  const getCroppedImg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedImage);
      onCropComplete();
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setCropperOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <Cropper
          src={imageURL}
          style={{ height: 400, width: 400 }}
          initialAspectRatio={1}
          aspectRatio={1}
          guides={false}
          ref={cropperRef}
        />
        <div className="flex justify-between mt-2">
          <button onClick={getCroppedImg} className="bg-green-500 text-white px-4 py-2 rounded">Crop</button>
          <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;

