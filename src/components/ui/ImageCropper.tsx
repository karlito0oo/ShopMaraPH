import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropType?: 'product' | 'hero';
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // Default to 1:1 for square crops
  cropType = 'product'
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

    // Calculate output dimensions based on aspect ratio and crop type
    let outputWidth: number;
    let outputHeight: number;

    if (cropType === 'hero') {
      // For hero images, use higher resolution
      if (aspectRatio === 2/1) {
        // Desktop hero: 2:1 ratio (better for hero sections)
        outputWidth = 1600;
        outputHeight = 800;
      } else if (aspectRatio === 16/9) {
        // Traditional desktop hero: 16:9 ratio
        outputWidth = 1920;
        outputHeight = 1080;
      } else if (aspectRatio === 3/4) {
        // Mobile hero: 3:4 ratio
        outputWidth = 1080;
        outputHeight = 1440;
      } else {
        // Fallback for other ratios
        const baseSize = 1200;
        if (aspectRatio > 1) {
          outputWidth = baseSize;
          outputHeight = baseSize / aspectRatio;
        } else {
          outputHeight = baseSize;
          outputWidth = baseSize * aspectRatio;
        }
      }
    } else {
      // For product images, keep square 400x400
      outputWidth = 400;
      outputHeight = 400;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Enable better image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
      outputWidth,
      outputHeight
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg', cropType === 'hero' ? 0.95 : 0.9); // Higher quality for hero images
    });
  }, [aspectRatio, cropType]);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    }
  }, [completedCrop, getCroppedImg, onCropComplete]);

  // Get dynamic content based on crop type
  const getContentConfig = () => {
    if (cropType === 'hero') {
      const isDesktop = aspectRatio === 2/1;
      const isTraditionalDesktop = aspectRatio === 16/9;
      const isMobile = aspectRatio === 3/4;
      
      return {
        title: isDesktop ? 'Crop Image for Desktop Hero Section' : 
               isTraditionalDesktop ? 'Crop Image for Widescreen Hero Section' :
               isMobile ? 'Crop Image for Mobile Hero Section' : 
               'Crop Image for Hero Section',
        description: isDesktop ? 
          '🖥️ Desktop hero images will be displayed at 2:1 aspect ratio (1600×800px) on screens ≥768px wide - perfect for hero sections!' :
          isTraditionalDesktop ?
          '🖥️ Widescreen hero images will be displayed at 16:9 aspect ratio (1920×1080px) on screens ≥768px wide.' :
          isMobile ?
          '📱 Mobile hero images will be displayed at 3:4 aspect ratio (1080×1440px) on screens <768px wide.' :
          '🖼️ This image will be used for the hero section background.',
        dimensions: isDesktop ? '1600×800px (2:1 ratio)' :
                   isTraditionalDesktop ? '1920×1080px (16:9 ratio)' :
                   isMobile ? '1080×1440px (3:4 ratio)' :
                   `Custom ratio (${aspectRatio.toFixed(2)}:1)`,
        previewText: isDesktop ? 
          '👀 Preview: This is exactly how your image will appear on desktop hero section' :
          isTraditionalDesktop ?
          '👀 Preview: This is exactly how your image will appear on widescreen hero section' :
          isMobile ?
          '👀 Preview: This is exactly how your image will appear on mobile hero section' :
          '👀 Preview: This is exactly how your image will appear on hero section'
      };
    } else {
      return {
        title: 'Crop Image for Product Card',
        description: '📐 Perfect fit guaranteed! Adjust the crop area to fit your image perfectly for the product card.',
        dimensions: '400×400px (1:1 ratio)',
        previewText: '👀 Preview: This is exactly how your image will appear on product cards'
      };
    }
  };

  const contentConfig = getContentConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg p-6 max-w-5xl max-h-[95vh] overflow-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{contentConfig.title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p><strong>Perfect fit guaranteed!</strong> {contentConfig.description}</p>
          <p>📏 The image will be cropped to {contentConfig.dimensions}.</p>
          <p className="text-indigo-600 font-medium">{contentConfig.previewText}</p>
          {cropType === 'hero' && (
            <p className="text-green-700 font-medium mt-2">
              ✨ The cropped image will display exactly as shown in the crop preview!
            </p>
          )}
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
