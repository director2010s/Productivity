import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private isRecordingSubject = new BehaviorSubject<boolean>(false);
  isRecording$ = this.isRecordingSubject.asObservable();
  
  private transcriptionSubject = new BehaviorSubject<string>('');
  transcription$ = this.transcriptionSubject.asObservable();

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecordingSubject.next(true);
      // Initialize speech recognition
      // Implementation will be added in the next iteration
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  stopRecording(): void {
    this.isRecordingSubject.next(false);
    // Stop recording logic will be implemented
  }
}