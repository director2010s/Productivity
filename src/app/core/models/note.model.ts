export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  voiceTranscription?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}