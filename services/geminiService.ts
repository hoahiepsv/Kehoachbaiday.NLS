
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIModelType } from "../types";

const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia giáo dục cao cấp của "Hoà Hiệp AI". Nhiệm vụ: Thiết kế KẾ HOẠCH BÀI DẠY (KHBD) lồng ghép Năng lực số (NLS).

QUY ĐỊNH CHẶT CHẼ VỀ NỘI DUNG:
1. ĐẦY ĐỦ TẤT CẢ CÁC TUẦN: Đây là yêu cầu quan trọng nhất. Bạn phải liệt kê ĐẦY ĐỦ tất cả các tuần dạy từ tuần 1 cho đến tuần cuối cùng có trong phân phối chương trình (ví dụ từ tuần 1 đến tuần 35 hoặc tuần 37). KHÔNG được bỏ sót bất kỳ tuần nào.
2. ĐẦY ĐỦ BÀI HỌC: Tuyệt đối KHÔNG bỏ sót bất kỳ bài học nào từ dữ liệu đầu vào. Đảm bảo đúng số lượng tiết/bài theo phân phối chương trình.
3. XỬ LÝ TRÙNG LẶP: Nếu trong một TUẦN có nhiều bài học hoặc các bài học có TÊN TRÙNG NHAU, bạn phải liệt kê đầy đủ tất cả các dòng, KHÔNG được gộp hay lược bỏ.
4. SẮP XẾP: Kết quả phải được sắp xếp theo TUẦN DẠY (Tuần 1, Tuần 2, ...).
5. TÊN BÀI: Tên bài trong kết quả phải bao gồm số thứ tự bài, định dạng: "Bài [Số]: [Tên bài]" (Ví dụ: "Bài 1: Tập hợp Q các số hữu tỉ").
6. CHƯƠNG: Xác định rõ Chương cho mỗi bài học. Nếu bài học thuộc cùng một chương, hãy lặp lại tên chương đó trong JSON.
7. TOÁN HỌC & LATEX (QUAN TRỌNG):
   - Thay \\Longrightarrow thành \\Rightarrow
   - Thay \\Longleftarrow thành \\Leftarrow
   - Thay aligned thành align
   - Thay angel thành \\widehat
   - Phép nhân: dùng dấu "." ($2 . 3$) thay vì "x".
   - BẮT BUỘC bao quanh TOÀN BỘ toán học bằng dấu $. 
   - Biến đơn ($x$, $y$), điểm ($A, B$), cạnh ($AB, CD$), giá trị % cũng phải nằm trong $.
   - LƯU Ý KỸ VỀ JSON: Khi xuất kết quả JSON, mọi dấu gạch chéo ngược (\\) trong LaTeX PHẢI được thoát (double-escaped) để chuỗi JSON hợp lệ. Ví dụ: "$\\widehat{A}$" là SAI, phải là "$\\widehat{A}$".

8. CẤU TRÚC KẾ HOẠCH:
   - Phân tích input để trích xuất: STT, Tuần, Chương, Tên bài, Nội dung cốt lõi.
   - Sáng tạo cột "Năng lực số (NLS)": Đề xuất cách lồng ghép công nghệ, tư duy thuật toán, an toàn số vào bài học một cách cụ thể và thiết thực.

JSON OUTPUT FORMAT (CHỈ TRẢ VỀ JSON):
[
  {
    "stt": "...",
    "tuan": "...",
    "chuong": "...",
    "tenBai": "Bài ...: ...",
    "noiDung": "...",
    "nls": "..."
  }
]
`;

export const generateLessonPlan = async (
  model: AIModelType,
  inputData: string,
  files: { mimeType: string; data: string }[],
  history?: any[]
): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = [
    { text: `Yêu cầu: ${inputData}. Dựa trên các tài liệu đã tải lên, hãy tạo kế hoạch bài dạy lồng ghép NLS. 
    LƯU Ý QUYẾT ĐỊNH: Phải tạo ĐỦ TẤT CẢ CÁC TUẦN và Tên bài học. Nếu trùng tuần hoặc bài học, vẫn phải viết lặp lại đầy đủ. Không được tóm tắt hay bỏ qua bất kỳ tuần nào.` },
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
    console.warn("Failed to parse AI response, attempting sanitization of backslashes:", error);
    try {
      const sanitized = responseText.replace(/\\(?![/"\\bfnrtu])/g, '\\\\');
      return JSON.parse(sanitized);
    } catch (innerError) {
      console.error("Sanitization also failed to parse JSON:", innerError);
      return [];
    }
  }
};
