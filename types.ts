export interface Memory {
  id: string;
  content: string;
  timestamp: number;
  category: string;
  emotionalResponse: string;
  trustLevel: number;
  importance: number;
  relatedTo?: string[];
  context?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}