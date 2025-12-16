import React, { useRef } from 'react';
import { processImage } from '../utils/imageUtils';

interface FileInputProps {
  onUpload: (base64Image: string) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const processed = await processImage(file);
        onUpload(processed);
      } catch (err) {
        console.error("Error processing file", err);
        alert("Failed to process image. Please try another one.");
      }
    }
  };

  return (
    <div 
      className="w-full max-w-md mx-auto h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer group shadow-sm"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <p className="text-gray-600 font-medium">Click to upload an image</p>
      <p className="text-gray-400 text-sm mt-2">JPG, PNG, WebP supported</p>
    </div>
  );
};