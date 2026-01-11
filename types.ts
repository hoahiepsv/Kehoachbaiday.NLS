
export enum AIModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  content: string; // Base64
  previewUrl?: string;
}

export interface LessonPlan {
  stt: string;
  tuan: string;
  chuong: string;
  tenBai: string;
  noiDung: string;
  nls: string; // Năng lực số
}
