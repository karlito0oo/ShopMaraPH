import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  aspectRatio = 1 // Default to 1:1 for square crops
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Calculate crop size based on aspect ratio and image dimensions
    let cropWidth = width;
    let cropHeight = height;
    
    if (width / height > aspectRatio) {
      cropWidth = height * aspectRatio;
    } else {
      cropHeight = width / aspectRatio;
    }
    
    const cropWidthPercent = (cropWidth / width) * 100;
    const cropHeightPercent = (cropHeight / height) * 100;
    const x = (100 - cropWidthPercent) / 2;
    const y = (100 - cropHeightPercent) / 2;
    
    setCrop({
      unit: '%',
      width: cropWidthPercent,
      height: cropHeightPercent,
      x,
      y
    });
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to match the desired output (square for ProductCard)
    const targetSize = 400; // 400x400 for good quality
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Calculate the scale factor
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      targetSize,
      targetSize
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg', 0.9);
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    }
  }, [completedCrop, getCroppedImg, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg p-6 max-w-5xl max-h-[95vh] overflow-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Crop Image for Product Card</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p>📐 <strong>Perfect fit guaranteed!</strong> Adjust the crop area to fit your image perfectly for the product card.</p>
          <p>📏 The image will be cropped to a square format (1:1 aspect ratio) at 400x400 pixels.</p>
          <p className="text-indigo-600 font-medium">👀 Preview: This is exactly how your image will appear on product cards</p>
        </div>

        <div className="flex justify-center mb-6">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-w-full"
            style={{ maxHeight: '60vh' }}
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={src}
              onLoad={onImageLoad}
              className="max-w-full object-contain"
              style={{ maxHeight: '60vh' }}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!completedCrop}
          >
            Apply Crop & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
