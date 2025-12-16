import React, { useState } from 'react';
import { Header } from './components/Header';
import { CameraInput } from './components/CameraInput';
import { FileInput } from './components/FileInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateSketchFromImage } from './services/geminiService';
import { AppStatus, InputMode, SketchStyle } from './types';

function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sketchStyle, setSketchStyle] = useState<SketchStyle>('bw');

  const handleImageInput = (base64: string) => {
    setOriginalImage(base64);
    setStatus(AppStatus.IDLE); // Ready to generate
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);
    try {
      const result = await generateSketchFromImage(originalImage, sketchStyle);
      setSketchImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate sketch. Please try again later.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setSketchImage(null);
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  // --- Render Functions ---

  const renderInputSelection = () => (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex bg-gray-200 p-1 rounded-full shadow-inner">
        <button
          onClick={() => setInputMode('upload')}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
            inputMode === 'upload' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Photo
        </button>
        <button
          onClick={() => setInputMode('camera')}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
            inputMode === 'camera' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Use Camera
        </button>
      </div>

      <div className="min-h-[300px] flex items-center justify-center">
        {inputMode === 'upload' ? (
          <FileInput onUpload={handleImageInput} />
        ) : (
          <CameraInput onCapture={handleImageInput} onCancel={() => setInputMode('upload')} />
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
      <div className="relative group w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
        <img 
          src={originalImage!} 
          alt="Original" 
          className="w-full h-auto object-cover max-h-[60vh]"
        />
        <div className="absolute top-2 right-2">
            <button 
                onClick={reset}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                title="Remove image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>
      
      {/* Style Selector */}
      <div className="mt-8 flex bg-gray-200 p-1 rounded-lg">
        <button 
          onClick={() => setSketchStyle('bw')}
          className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
            sketchStyle === 'bw' 
              ? 'bg-white shadow-sm text-charcoal' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Black & White
        </button>
        <button 
          onClick={() => setSketchStyle('color')}
          className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
            sketchStyle === 'color' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Color Sketch
        </button>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleGenerate}
          className="bg-charcoal text-white font-hand text-xl px-12 py-3 rounded-full hover:bg-black hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span>✨</span> Generate Sketch
        </button>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="w-full max-w-6xl mx-auto animate-fade-in p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Original */}
        <div className="space-y-4 flex flex-col items-center">
          <h3 className="text-center font-hand text-2xl text-gray-500">Original</h3>
          <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white bg-gray-50 w-full flex justify-center">
            <img 
              src={originalImage!} 
              alt="Original" 
              className="w-auto h-auto max-h-[60vh] object-contain" 
            />
          </div>
        </div>

        {/* Sketch Result */}
        <div className="space-y-4 flex flex-col items-center">
          <h3 className="text-center font-hand text-2xl text-charcoal font-bold">
            {sketchStyle === 'color' ? 'Color Sketch' : 'Pencil Sketch'}
          </h3>
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50 w-full flex justify-center">
            <img 
              src={sketchImage!} 
              alt="Sketch" 
              className="w-auto h-auto max-h-[60vh] object-contain" 
            />
            <a 
              href={sketchImage!} 
              download={`sketchify-${sketchStyle}.png`}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-charcoal px-4 py-2 rounded-full font-bold shadow-md hover:bg-white transition-colors flex items-center gap-2 text-sm z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l4.5-4.5m-4.5 4.5L7.5 8.25M12 13.5V3" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={reset}
          className="text-gray-500 hover:text-gray-800 underline font-medium"
        >
          Start New Sketch
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen sketch-pattern flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 pb-12">
        
        {status === AppStatus.PROCESSING && <LoadingSpinner />}
        
        {status === AppStatus.ERROR && (
          <div className="max-w-md mx-auto bg-red-100 text-red-700 p-4 rounded-lg text-center mb-8 border border-red-200">
            {errorMsg}
            <button onClick={() => setStatus(AppStatus.IDLE)} className="block mx-auto mt-2 text-sm font-bold underline">Try Again</button>
          </div>
        )}

        {status === AppStatus.CAPTURING && (
           <CameraInput onCapture={handleImageInput} onCancel={() => setStatus(AppStatus.IDLE)} />
        )}

        {(status === AppStatus.IDLE || status === AppStatus.ERROR) && !originalImage && (
          renderInputSelection()
        )}

        {(status === AppStatus.IDLE || status === AppStatus.ERROR) && originalImage && (
          renderPreview()
        )}

        {status === AppStatus.SUCCESS && renderResult()}
        
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;