import { useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImageCropper = ({ imageURL, setCroppedImage, setCropperOpen, onCropComplete }) => {
  const cropperRef = useRef(null);

  const getCroppedImg = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedImage);
      onCropComplete();
    } else {
      toast.error('Error: Cropper instance is not available.');
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <Cropper
          src={imageURL}
          ref={cropperRef}
          aspectRatio={1}
          guides={false}
          style={{ width: 400, height: 400 }}
        />
        <div className="flex justify-between mt-4">
          <button onClick={getCroppedImg} className="bg-blue-500 text-white p-2 rounded">Save Crop</button>
          <button
            onClick={() => setCropperOpen(false)}
            className="bg-red-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
