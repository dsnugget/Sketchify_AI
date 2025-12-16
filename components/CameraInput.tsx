import React, { useRef, useState, useEffect } from 'react';
import { processImage } from '../utils/imageUtils';

interface CameraInputProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

export const CameraInput: React.FC<CameraInputProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please allow permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Use a 3:4 aspect ratio (Portrait)
    const TARGET_ASPECT_RATIO = 3 / 4;
    
    // Calculate cropping to match the aspect ratio of the container
    const videoRatio = video.videoWidth / video.videoHeight;
    
    let drawWidth, drawHeight, startX, startY;

    if (videoRatio > TARGET_ASPECT_RATIO) {
        // Video is wider than target (e.g., landscape feed in portrait container)
        // Crop width (sides)
        drawHeight = video.videoHeight;
        drawWidth = video.videoHeight * TARGET_ASPECT_RATIO;
        startX = (video.videoWidth - drawWidth) / 2;
        startY = 0;
    } else {
        // Video is taller/skinnier than target (unlikely for 3:4 but possible)
        // Crop height (top/bottom)
        drawWidth = video.videoWidth;
        drawHeight = video.videoWidth / TARGET_ASPECT_RATIO;
        startX = 0;
        startY = (video.videoHeight - drawHeight) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = drawWidth;
    canvas.height = drawHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw cropped portion
      ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const processed = await processImage(blob);
          onCapture(processed);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onCancel} className="text-sm underline text-red-800">Go Back</button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-black rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 items-center">
        <button
          onClick={onCancel}
          className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          className="bg-white text-black h-16 w-16 rounded-full border-4 border-gray-300 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          aria-label="Take Photo"
        >
          <div className="w-12 h-12 bg-white rounded-full border-2 border-black" />
        </button>
      </div>
    </div>
  );
};