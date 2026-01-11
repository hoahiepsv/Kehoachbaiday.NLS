
import React, { useState, useMemo } from 'react';
import { Sparkles, Brain, FileText, Download, RotateCcw, ShieldCheck, GraduationCap, ChevronRight, Activity } from 'lucide-react';
import FileUpload from './components/FileUpload';
import MathRenderer from './components/MathRenderer';
import ApiKeyManager from './components/ApiKeyManager';
import { AIModelType, LessonPlan } from './types';
import { generateLessonPlan } from './services/geminiService';
import { exportToWord } from './services/wordExport';

const App: React.FC = () => {
  const [model, setModel] = useState<AIModelType>(AIModelType.FLASH);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Sorting and Grouping Logic - Đảm bảo hiển thị đủ tất cả các tuần
  const processedResult = useMemo(() => {
    if (!result || result.length === 0) return [];
    
    const sorted = [...result].sort((a, b) => {
      const weekA = parseInt(a.tuan.replace(/\D/g, '')) || 0;
      const weekB = parseInt(b.tuan.replace(/\D/g, '')) || 0;
      if (weekA === weekB) {
        const sttA = parseInt(a.stt.replace(/\D/g, '')) || 0;
        const sttB = parseInt(b.stt.replace(/\D/g, '')) || 0;
        return sttA - sttB;
      }
      return weekA - weekB;
    });

    const grouped: (LessonPlan | { isHeader: boolean, title: string })[] = [];
    let currentChapter = "";

    sorted.forEach((item) => {
      if (item.chuong && item.chuong.trim() !== "" && item.chuong !== currentChapter) {
        currentChapter = item.chuong;
        grouped.push({ isHeader: true, title: currentChapter });
      }
      grouped.push(item);
    });

    return grouped;
  }, [result]);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const fileData = await Promise.all(files.map(async file => {
        return new Promise<{ mimeType: string, data: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              const base64 = reader.result.split(',')[1] || '';
              resolve({ mimeType: file.type, data: base64 });
            } else {
              resolve({ mimeType: file.type, data: '' });
            }
          };
          reader.onerror = () => resolve({ mimeType: file.type, data: '' });
          reader.readAsDataURL(file);
        });
      }));

      const plans = await generateLessonPlan(model, inputPrompt, fileData);
      setResult(plans || []);
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi phân tích dữ liệu. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden font-inter">
      {/* Trademark Badge - Top Right */}
      <div className="hidden lg:block absolute top-4 right-4 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-blue-100 text-[10px] font-black text-blue-600 shadow-md">
        Create by Hoà Hiệp AI – 0983.676.470
      </div>

      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">KẾ HOẠCH BÀI DẠY</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Lồng ghép năng lực số (NLS)</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Status</p>
              <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                 <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                   {model === AIModelType.PRO ? 'Smart Engine (Pro)' : 'Fast Engine (Flash)'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <ApiKeyManager onKeyChange={setApiKey} />

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Brain size={16} className="text-blue-500" /> Cấu hình AI
            </h3>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setModel(AIModelType.FLASH)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all ${
                  model === AIModelType.FLASH ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles size={18} /> FLASH (NHANH)
              </button>
              <button 
                onClick={() => setModel(AIModelType.PRO)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all ${
                  model === AIModelType.PRO ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Brain size={18} /> PRO (SMART)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Dữ liệu đầu vào
            </h3>
            <div className="space-y-4">
              <textarea 
                placeholder="Nhập phân phối chương trình, yêu cầu riêng..."
                className="w-full h-40 p-4 text-sm border border-slate-200 rounded-2xl focus:ring-4 ring-blue-50 outline-none resize-none transition bg-slate-50/50 font-medium"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              <FileUpload files={files} onFilesChange={setFiles} />
            </div>
            <button 
              onClick={handleProcess}
              disabled={loading || (!inputPrompt && files.length === 0)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-200 active:scale-95"
            >
              {loading ? <RotateCcw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
              PHÂN TÍCH & LẬP KẾ HOẠCH
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 h-[850px] flex flex-col overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                   <Activity size={22} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="font-black uppercase text-sm tracking-widest">Xem trước Kế Hoạch Bài Dạy</h2>
                  <p className="text-[10px] font-medium opacity-80 italic">Đã bao gồm tích hợp Năng lực số (NLS)</p>
                </div>
              </div>
              {result.length > 0 && (
                <div className="flex gap-3">
                  <button onClick={handleProcess} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all" title="Phân tích lại">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={() => exportToWord(result)} className="flex items-center gap-3 bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-xs hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                    <Download size={18} /> XUẤT FILE WORD
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Preview Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 scrollbar-custom p-8">
              {processedResult.length > 0 ? (
                <div className="space-y-8">
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-[13px] border-collapse font-times">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-200">
                          <th className="p-5 text-center font-black border-r border-slate-200 w-16">STT</th>
                          <th className="p-5 text-center font-black border-r border-slate-200 w-20">Tuần</th>
                          <th className="p-5 text-left font-black border-r border-slate-200 min-w-[200px]">Tên Bài</th>
                          <th className="p-5 text-left font-black border-r border-slate-200 min-w-[250px]">Nội Dung</th>
                          <th className="p-5 text-left font-black bg-blue-50 text-blue-700">Năng Lực Số (NLS)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResult.map((item, idx) => {
                          if ('isHeader' in item) {
                            return (
                              <tr key={`header-${idx}`} className="bg-blue-600 text-white">
                                <td colSpan={5} className="p-4 text-center font-black uppercase tracking-[0.2em] text-xs">
                                  <MathRenderer content={item.title} />
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={`row-${idx}`} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group">
                              <td className="p-5 border-r border-slate-200 text-center font-bold text-slate-400">{item.stt}</td>
                              <td className="p-5 border-r border-slate-200 text-center font-black text-slate-800">{item.tuan}</td>
                              <td className="p-5 border-r border-slate-200 font-black text-slate-900 leading-relaxed text-sm">
                                <MathRenderer content={item.tenBai} />
                              </td>
                              <td className="p-5 border-r border-slate-200 text-slate-600 leading-relaxed">
                                <MathRenderer content={item.noiDung} />
                              </td>
                              <td className="p-5 bg-blue-50/10 font-bold text-blue-700 italic border-l-4 border-l-blue-400">
                                <MathRenderer content={item.nls} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-8 py-20">
                  <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center shadow-2xl border border-slate-50">
                    <GraduationCap size={64} className="text-blue-500" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-black text-slate-700 tracking-tight text-2xl uppercase tracking-[0.1em]">Bắt đầu lập kế hoạch</p>
                    <p className="text-sm text-slate-400 max-sm mx-auto font-medium">Nhập phân phối chương trình và nhấn nút Xây Dựng để AI phân tích và lồng ghép NLS tự động.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Copyright */}
            <footer className="px-8 py-6 border-t border-slate-100 bg-white flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                  <ShieldCheck size={14} /> Hệ thống mã hóa đầu cuối active
                </div>
              </div>
              <span className="text-slate-500">Create by Hoà Hiệp AI – 0983.676.470</span>
            </footer>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
      `}} />
    </div>
  );
};

export default App;
