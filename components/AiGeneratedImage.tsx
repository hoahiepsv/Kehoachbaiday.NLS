
import React, { useState } from 'react';
import { Wand2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AiGeneratedImageProps {
  prompt: string;
  onRefresh: () => void;
}

const AiGeneratedImage: React.FC<AiGeneratedImageProps> = ({ prompt, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  /**
   * Generates an image using gemini-2.5-flash-image based on the lesson plan prompt.
   */
  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      // Create a new instance right before making the call as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      });

      // Iterate through candidates and parts to find the image part (inlineData)
      const candidate = response.candidates?.[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            setImageUrl(`data:${mimeType};base64,${base64EncodeString}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Không thể tạo hình ảnh lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-indigo-200 rounded-lg overflow-hidden bg-white shadow-sm mt-4">
      <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center">
        <span className="text-indigo-700 text-sm font-medium flex items-center gap-2">
          <Wand2 size={16} /> Hình ảnh 3D minh họa (AI)
        </span>
        <button 
          onClick={generate}
          disabled={loading}
          className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="aspect-video bg-indigo-900/5 flex items-center justify-center relative">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-indigo-600 font-medium">Đang vẽ hình...</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
        ) : (
          <button 
            onClick={generate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition"
          >
            Tạo hình ảnh
          </button>
        )}
      </div>
      {prompt && !loading && (
        <p className="p-3 text-[10px] text-slate-400 italic bg-slate-50 border-t border-slate-100">
          Prompt: {prompt}
        </p>
      )}
    </div>
  );
};

export default AiGeneratedImage;
