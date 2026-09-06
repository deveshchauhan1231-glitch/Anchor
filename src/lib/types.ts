export interface Subject {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string | null;
  colorCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    videos: number;
    notes: number;
    todos: number;
  };
  videos?: Video[];
  notes?: Note[];
  todos?: Todo[];
}

export interface Video {
  id: string;
  subjectId: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  timestamps?: TimestampNote[];
  _count?: {
    timestamps: number;
  };
}

export interface TimestampNote {
  id: string;
  videoId: string;
  timeSeconds: number;
  timeLabel: string;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string; // Markdown
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    title: string;
    colorCode: string | null;
  };
}

export interface Todo {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    title: string;
    colorCode: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    cached?: boolean;
    count?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
