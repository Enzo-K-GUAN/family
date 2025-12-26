
export enum UserRole {
  TEACHER = 'teacher',
  FAMILY = 'family',
  NONE = 'none'
}

export interface StudentWork {
  id: string;
  studentName: string;
  title: string;
  imageUrl: string;
  description: string;
  likes: number;
  tags: string[];
}

export interface CoCreationRecord {
  id: string;
  studentName: string;
  parentName: string;
  type: 'image' | 'text' | 'video';
  content: string; // Base64 for image, text content for text, or description for video
  title: string;
  timestamp: string;
  status: 'pending' | 'approved';
}

export interface EvaluationData {
  understanding: number; // 理解与复述
  creation: number;      // 创作表现
  collaboration: number; // 亲子协作
  expression: number;    // 表达与交流
  aiUsage: number;       // AIGC应用
}

export interface Vocabulary {
  word: string;
  explanation: string;
  imageUrl?: string;
}
