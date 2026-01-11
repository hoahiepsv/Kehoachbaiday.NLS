
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop } from 'lucide-react';

interface ImageCropperProps {
  sourceImage: string;
  onCrop: (croppedDataUrl: string) => void;
  onClose: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ sourceImage, onCrop, onClose }) => {
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPos) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (!startPos || !currentPos) return;
    // Just finalizing position, keep startPos for cropping action
  };

  const executeCrop = () => {
    if (!startPos || !currentPos || !imgRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(startPos.x - currentPos.x);
    const height = Math.abs(startPos.y - currentPos.y);

    // Scaling factor if img size is different from natural size
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = width * scaleX;
    canvas.height = height * scaleY;

    ctx.drawImage(
      imgRef.current,
      x * scaleX, y * scaleY, width * scaleX, height * scaleY,
      0, 0, canvas.width, canvas.height
    );

    onCrop(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Crop size={20} className="text-blue-600" /> QUÉT CHỌN VÙNG ẢNH GỐC
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-200 flex items-center justify-center relative select-none">
          <div 
            className="relative cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img 
              ref={imgRef}
              src={sourceImage} 
              alt="Source" 
              className="max-w-full pointer-events-none"
            />
            {startPos && currentPos && (
              <div 
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: Math.min(startPos.x, currentPos.x),
                  top: Math.min(startPos.y, currentPos.y),
                  width: Math.abs(startPos.x - currentPos.x),
                  height: Math.abs(startPos.y - currentPos.y)
                }}
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Hủy</button>
          <button onClick={executeCrop} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
            <Check size={20} /> CHÈN HÌNH NÀY
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
