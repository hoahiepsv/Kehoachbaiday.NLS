
import React, { useState, useEffect } from 'react';
import { Key, Save, Edit2, CheckCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  onKeyChange: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
      onKeyChange(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey);
      setIsSaved(true);
      onKeyChange(apiKey);
    }
  };

  const handleEdit = () => {
    setIsSaved(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-slate-700 font-semibold">
        <Key size={20} className="text-blue-600" />
        <span>Gemini API Key</span>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isSaved}
          placeholder="Dán API Key vào đây..."
          className={`flex-1 px-3 py-2 rounded-lg border outline-none transition ${
            isSaved ? 'bg-slate-50 border-slate-200 text-slate-500' : 'border-blue-200 focus:ring-2 ring-blue-100'
          }`}
        />
        {isSaved ? (
          <button 
            onClick={handleEdit}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 flex items-center gap-2 transition"
          >
            <Edit2 size={18} />
            <span className="hidden sm:inline">CHỈNH SỬA</span>
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Save size={18} />
            <span className="hidden sm:inline">LƯU</span>
          </button>
        )}
      </div>
      {isSaved && (
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
          <CheckCircle size={14} />
          <span>Đã lưu vào trình duyệt</span>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
