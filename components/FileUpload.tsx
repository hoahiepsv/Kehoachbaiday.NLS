
import React, { useRef } from 'react';
import { Upload, File, X, Camera } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer group"
        >
          <Upload className="text-blue-500 mb-2 group-hover:scale-110 transition" size={28} />
          <span className="text-blue-700 font-medium">Tải tài liệu lên</span>
          <span className="text-blue-400 text-xs mt-1">PDF, DOCX, Hình ảnh...</span>
        </button>
        
        <button 
          onClick={() => cameraInputRef.current?.click()}
          className="w-1/4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          <Camera className="text-slate-400 mb-2" size={24} />
          <span className="text-slate-600 text-xs font-medium">Chụp ảnh</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        hidden 
        accept=".pdf,.doc,.docx,image/*" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        capture="environment" 
        accept="image/*" 
        hidden 
      />

      {files.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-100 text-blue-600 rounded">
                  <File size={16} />
                </div>
                <span className="text-sm text-slate-700 truncate">{file.name}</span>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
