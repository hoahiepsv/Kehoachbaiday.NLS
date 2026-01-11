
import React, { useState, useMemo } from 'react';
import { Sparkles, Brain, FileText, Download, RotateCcw, ShieldCheck, GraduationCap, ChevronRight, Activity } from 'lucide-react';
import FileUpload from './components/FileUpload';
import MathRenderer from './components/MathRenderer';
import { AIModelType, LessonPlan } from './types';
import { generateLessonPlan } from './services/geminiService';
import { exportToWord } from './services/wordExport';

const App: React.FC = () => {
  const [model, setModel] = useState<AIModelType>(AIModelType.FLASH);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');

  // Sorting and Grouping Logic - Ensures all items are shown even if they have duplicate weeks or names
  const processedResult = useMemo(() => {
    if (!result || result.length === 0) return [];
    
    // Sort primarily by week (numeric)
    const sorted = [...result].sort((a, b) => {
      const weekA = parseInt(a.tuan.replace(/\D/g, '')) || 0;
      const weekB = parseInt(b.tuan.replace(/\D/g, '')) || 0;
      // If same week, preserve original sequence by STT if possible
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
      // Add a header only if the chapter changes to help visualize structure
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
      alert("Đã xảy ra lỗi khi phân tích dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden">
      {/* Trademark/Copyright Badge */}
      <div className="hidden lg:block absolute top-4 right-4 z-50 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm">
        Hoà Hiệp AI – 0983.676.470
      </div>

      <header className="bg-white border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-2 ring-blue-50">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase">Kế Hoạch Bài Dạy</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest text-blue-500">Lồng ghép năng lực số</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Trạng thái AI</p>
              <div className="flex items-center justify-end gap-1">
                 <span className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                 <span className="text-xs font-bold text-slate-600 uppercase">{model === AIModelType.PRO ? 'Thông minh' : 'Nhanh'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Chọn Model AI
            </h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setModel(AIModelType.FLASH)}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg text-xs font-bold transition ${
                  model === AIModelType.FLASH ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Sparkles size={16} /> FLASH (NHANH)
              </button>
              <button 
                onClick={() => setModel(AIModelType.PRO)}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg text-xs font-bold transition ${
                  model === AIModelType.PRO ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Brain size={16} /> PRO (THÔNG MINH)
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Nhập Phân Phối Chương Trình
            </h3>
            <div className="space-y-3">
              <textarea 
                placeholder="Nhập tên chương, bài học hoặc ghi chú..."
                className="w-full h-32 p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 ring-blue-100 outline-none resize-none transition bg-slate-50/50"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              <FileUpload files={files} onFilesChange={setFiles} />
            </div>
            <button 
              onClick={handleProcess}
              disabled={loading || (!inputPrompt && files.length === 0)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200"
            >
              {loading ? <RotateCcw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
              XÂY DỰNG KẾ HOẠCH
            </button>
          </div>
        </div>

        {/* Main Preview */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 h-[700px] flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <Activity size={20} className="animate-pulse" />
                <h2 className="font-bold uppercase text-sm tracking-widest">Kế Hoạch Bài Dạy - Preview</h2>
              </div>
              {result.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleProcess} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition" title="Phân tích lại">
                    <RotateCcw size={18} />
                  </button>
                  <button onClick={() => exportToWord(result)} className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-full font-bold text-xs hover:bg-blue-50 transition shadow-sm">
                    <Download size={16} /> TẢI FILE WORD
                  </button>
                </div>
              )}
            </div>

            {/* Content area with custom vertical scrollbar */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 scrollbar-custom">
              {processedResult.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
                    <table className="w-full text-[13px] border-collapse font-times">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <th className="p-4 text-center font-bold border-r border-slate-200 w-12">STT</th>
                          <th className="p-4 text-center font-bold border-r border-slate-200 w-16">Tuần</th>
                          <th className="p-4 text-left font-bold border-r border-slate-200">Tên Bài</th>
                          <th className="p-4 text-left font-bold border-r border-slate-200">Nội Dung Đảm Bảo</th>
                          <th className="p-4 text-left font-bold bg-blue-50 text-blue-600">Năng Lực Số (NLS)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResult.map((item, idx) => {
                          if ('isHeader' in item) {
                            return (
                              <tr key={`header-${idx}`} className="bg-blue-600 text-white font-black">
                                <td colSpan={5} className="p-3 text-center uppercase tracking-widest">
                                  <MathRenderer content={item.title} />
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={`row-${idx}`} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                              <td className="p-4 border-r border-slate-200 text-center font-medium text-slate-400">{item.stt}</td>
                              <td className="p-4 border-r border-slate-200 text-center font-bold text-slate-700">{item.tuan}</td>
                              <td className="p-4 border-r border-slate-200 font-bold text-slate-900 leading-relaxed">
                                <MathRenderer content={item.tenBai} />
                              </td>
                              <td className="p-4 border-r border-slate-200 text-slate-600 leading-relaxed">
                                <MathRenderer content={item.noiDung} />
                              </td>
                              <td className="p-4 bg-blue-50/10 font-medium text-blue-700 italic border-l-2 border-l-blue-400">
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
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6 py-24">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100">
                    <Sparkles size={48} className="text-blue-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-black text-slate-700 tracking-tight text-xl uppercase tracking-widest">Sẵn sàng khởi tạo</p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto px-4">Vui lòng tải lên nội dung phân phối chương trình hoặc nhập yêu cầu để AI xây dựng toàn bộ kế hoạch.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500" /> Hệ thống bảo mật 2 lớp active</span>
              <span>Create by Hoà Hiệp AI – 0983.676.470</span>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
};

export default App;
