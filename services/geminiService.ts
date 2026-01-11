
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIModelType } from "../types";

const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia giáo dục cao cấp của "Hoà Hiệp AI". Nhiệm vụ: Thiết kế KẾ HOẠCH BÀI DẠY (KHBD) lồng ghép Năng lực số (NLS).

QUY ĐỊNH CHẶT CHẼ VỀ NỘI DUNG (KHÔNG ĐƯỢC VI PHẠM):
1. ĐẦY ĐỦ TUYỆT ĐỐI: Phải liệt kê ĐẦY ĐỦ TẤT CẢ CÁC TUẦN (ví dụ từ Tuần 1 đến Tuần 35) và TẤT CẢ CÁC BÀI HỌC có trong dữ liệu đầu vào. KHÔNG ĐƯỢC tóm tắt, KHÔNG ĐƯỢC dùng "...".
2. XỬ LÝ TRÙNG LẶP: Nếu trong một TUẦN có nhiều bài học hoặc các bài học có TÊN TRÙNG NHAU, bạn phải liệt kê đầy đủ tất cả các dòng riêng biệt.
3. SẮP XẾP: Kết quả phải được sắp xếp theo TUẦN DẠY (Tuần 1, Tuần 2, ...).
4. TÊN BÀI: Định dạng: "Bài [Số]: [Tên bài]".
5. CHƯƠNG: Xác định rõ Chương cho mỗi bài học. Lặp lại tên chương nếu bài học thuộc cùng một chương.
6. TOÁN HỌC & LATEX (QUAN TRỌNG NHẤT CHO JSON):
   - Thay \\Longrightarrow thành \\Rightarrow
   - Thay \\Longleftarrow thành \\Leftarrow
   - Thay aligned thành align
   - Thay angel thành \\widehat
   - Phép nhân: dùng dấu "." ($2 . 3$) thay vì "x".
   - BẮT BUỘC bao quanh TOÀN BỘ toán học bằng dấu $.
   - LƯU Ý KỸ VỀ JSON: Khi xuất kết quả JSON, mọi dấu gạch chéo ngược (\\) trong LaTeX PHẢI được thoát (double-escaped) để chuỗi JSON hợp lệ. 
   - VÍ DỤ ĐÚNG: "$\\widehat{A}$" -> Phải ghi là "$\\\\widehat{A}$" trong chuỗi JSON.
   - VÍ DỤ SAI: "$\widehat{A}$".

7. CẤU TRÚC KẾ HOẠCH:
   - Trích xuất: STT, Tuần, Chương, Tên bài, Nội dung cốt lõi.
   - Cột "Năng lực số (NLS)": Đề xuất cách lồng ghép công nghệ, tư duy thuật toán, an toàn số vào bài học.

8. KHÔNG TẠO HÌNH ẢNH: Tuyệt đối không bao gồm mã code Python, Spec vẽ hình hay Prompt tạo ảnh trong kết quả trả về.

CHỈ TRẢ VỀ JSON ARRAY. KHÔNG TRẢ VỀ VĂN BẢN KHÁC.
FORMAT:
[
  {
    "stt": "...",
    "tuan": "...",
    "chuong": "...",
    "tenBai": "...",
    "noiDung": "...",
    "nls": "..."
  }
]
`;

const getApiKey = () => {
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
};

export const generateLessonPlan = async (
  model: AIModelType,
  inputData: string,
  files: { mimeType: string; data: string }[],
  history?: any[]
): Promise<any[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Vui lòng nhập API Key.");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const contents = [
    { text: `Dữ liệu đầu vào: ${inputData}. Hãy tạo Kế hoạch bài dạy lồng ghép NLS. 
    YÊU CẦU: Liệt kê ĐẦY ĐỦ TẤT CẢ CÁC TUẦN và BÀI HỌC. Đảm bảo JSON hợp lệ, thoát tất cả dấu gạch chéo ngược (\\\\).` },
    ...files.map(f => ({
      inlineData: { mimeType: f.mimeType, data: f.data }
    }))
  ];

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: contents },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const responseText = response.text || "[]";

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.warn("JSON Parse failed, attempting fallback sanitization...");
    try {
      const sanitized = responseText.replace(/\\(?![/"\\bfnrtu])/g, '\\\\');
      return JSON.parse(sanitized);
    } catch (innerError) {
      console.error("Sanitization also failed:", responseText);
      return [];
    }
  }
};
