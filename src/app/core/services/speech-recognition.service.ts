import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import OpenAI from 'openai';
import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../config/environment.config';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private openai: OpenAI;
  
  private languageSubject = new BehaviorSubject<string>('en');
  private transcriptSubject = new BehaviorSubject<string>('');
  private isListeningSubject = new BehaviorSubject<boolean>(false);

  transcript$ = this.transcriptSubject.asObservable();
  isListening$ = this.isListeningSubject.asObservable();
  currentLanguage$ = this.languageSubject.asObservable();

  private readonly SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' }
  ];

  constructor(@Inject(ENVIRONMENT_CONFIG) private config: EnvironmentConfig) {
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async startRecognition(): Promise<void> {
    if (this.isListeningSubject.value) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.transcribeAudio(audioBlob);
      };

      this.mediaRecorder.start(1000);
      this.isListeningSubject.next(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isListeningSubject.next(false);
    }
  }

  async stopRecognition(): Promise<void> {
    if (!this.mediaRecorder || !this.isListeningSubject.value) {
      return;
    }

    try {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isListeningSubject.next(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<void> {
    try {
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: 'audio/webm',
        lastModified: Date.now()
      });

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: this.languageSubject.value
      });

      const currentTranscript = this.transcriptSubject.value;
      this.transcriptSubject.next(
        currentTranscript 
          ? `${currentTranscript} ${response.text}` 
          : response.text
      );
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  }

  setLanguage(languageCode: string): void {
    if (this.SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      this.languageSubject.next(languageCode);
    }
  }

  getSupportedLanguages() {
    return this.SUPPORTED_LANGUAGES;
  }

  clearTranscript(): void {
    this.transcriptSubject.next('');
  }
}