import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImageCropper = ({ imageURL, setCroppedImage, setCropperOpen, onCropComplete }) => {
  const cropperRef = useRef(null);

  const getCroppedImg = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedImage); // Set the cropped image
      onCropComplete(); // Notify the parent to close the cropper
    }
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
          <button onClick={() => setCropperOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
