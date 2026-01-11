
import React, { useState } from 'react';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { RefreshCw, Copy, Send, Activity } from 'lucide-react';

interface PythonPlotProps {
  spec: {
    type: string;
    code: string;
    title?: string;
  };
  onRedraw: (reason: string) => void;
  onCopyOriginal: () => void;
  isLoading?: boolean;
}

const PythonPlot: React.FC<PythonPlotProps> = ({ spec, onRedraw, onCopyOriginal, isLoading }) => {
  const [showRedrawInput, setShowRedrawInput] = useState(false);
  const [redrawReason, setRedrawReason] = useState('');

  const mockData = [
    { name: 'Tiết 1', val: 400 },
    { name: 'Tiết 2', val: 300 },
    { name: 'Tiết 3', val: 600 },
    { name: 'Tiết 4', val: 800 },
  ];

  const handleRedrawSubmit = () => {
    if (redrawReason.trim()) {
      onRedraw(redrawReason);
      setShowRedrawInput(false);
      setRedrawReason('');
    }
  };

  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm relative group overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center animate-pulse">
          <Activity className="text-blue-600 animate-spin mb-2" />
          <span className="text-xs font-bold text-blue-700">Đang vẽ lại...</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-blue-700 font-semibold text-sm flex items-center gap-2">
          <Activity size={16} /> {spec.title || 'Hình vẽ kỹ thuật'}
        </h4>
        <div className="flex gap-1">
          <button 
            onClick={() => setShowRedrawInput(!showRedrawInput)}
            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition"
            title="Vẽ lại theo yêu cầu"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={onCopyOriginal}
            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition"
            title="Sử dụng hình gốc (Cắt ảnh)"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded relative">
        {spec.type.includes('chart') ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-400 text-sm italic text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <Activity className="text-blue-500" />
            </div>
            [Bản vẽ Matplotlib: {spec.type}]<br/>
            <code className="text-[10px] block mt-2 opacity-60 font-mono">
              {spec.code.substring(0, 80)}...
            </code>
          </div>
        )}
      </div>

      {showRedrawInput && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100 flex gap-2 animate-in slide-in-from-top-2 duration-200">
          <input 
            type="text" 
            placeholder="VD: Đổi sang màu đỏ, thêm lưới tọa độ..."
            className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded outline-none focus:ring-1 ring-blue-500 bg-white"
            value={redrawReason}
            onChange={(e) => setRedrawReason(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRedrawSubmit()}
          />
          <button 
            onClick={handleRedrawSubmit}
            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PythonPlot;
