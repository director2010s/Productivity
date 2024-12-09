import { Timestamp } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

export class DateUtils {
  static toDate(date: Date | Timestamp | string | null | undefined): Date | null {
    if (!date) return null;

    try {
      if (date instanceof Timestamp) {
        return date.toDate();
      }
      
      if (date instanceof Date) {
        return date;
      }
      
      if (typeof date === 'string') {
        return parseISO(date);
      }
      
      return null;
    } catch (error) {
      console.error('Error converting date:', error);
      return null;
    }
  }

  static format(date: Date | Timestamp | string | null | undefined, formatStr: string = 'MMM d, yyyy'): string {
    const convertedDate = this.toDate(date);
    if (!convertedDate) return '';
    
    try {
      return format(convertedDate, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  static isValidDate(date: Date | Timestamp | string | null | undefined): boolean {
    const convertedDate = this.toDate(date);
    return convertedDate !== null && !isNaN(convertedDate.getTime());
  }

  static toTimestamp(date: Date | Timestamp | string | null | undefined): Timestamp | null {
    const convertedDate = this.toDate(date);
    if (!convertedDate) return null;
    
    try {
      return Timestamp.fromDate(convertedDate);
    } catch (error) {
      console.error('Error converting to timestamp:', error);
      return null;
    }
  }
}
