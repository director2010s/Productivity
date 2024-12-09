export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'excited' | 'anxious';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}