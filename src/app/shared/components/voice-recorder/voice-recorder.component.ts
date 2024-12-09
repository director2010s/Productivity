import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeechRecognitionService } from '../../../core/services/speech-recognition.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-voice-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="voice-recorder">
      <div class="controls">
        <button
          (click)="toggleRecording()"
          [class.recording]="isListening$ | async"
          class="record-button"
          [attr.aria-label]="(isListening$ | async) ? 'Stop Recording' : 'Start Recording'"
        >
          {{ (isListening$ | async) ? 'Stop Recording' : 'Start Recording' }}
        </button>
        
        <select
          [disabled]="isListening$ | async"
          (change)="onLanguageChange($event)"
          class="language-select"
        >
          <option
            *ngFor="let lang of supportedLanguages"
            [value]="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
      </div>

      <div class="transcript-container" *ngIf="transcript$ | async as transcript">
        <p class="transcript-text">{{ transcript }}</p>
        <button
          *ngIf="transcript"
          (click)="clearTranscript()"
          class="clear-button"
        >
          Clear
        </button>
      </div>
    </div>
  `,
  styles: [`
    .voice-recorder {
      padding: 1rem;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .record-button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      min-width: 120px;
    }

    .record-button.recording {
      background-color: #dc3545;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .language-select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .transcript-container {
      margin: 1rem 0;
      padding: 1rem;
      background-color: white;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .transcript-text {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    .clear-button {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: none;
      background-color: #6c757d;
      color: white;
      cursor: pointer;
    }
  `]
})
export class VoiceRecorderComponent {
  @Input() autoSave = false;
  @Output() transcriptionComplete = new EventEmitter<string>();

  isListening$ = this.speechService.isListening$;
  transcript$ = this.speechService.transcript$;
  supportedLanguages = this.speechService.getSupportedLanguages();

  constructor(private speechService: SpeechRecognitionService) {}

  async toggleRecording(): Promise<void> {
    try {
      const isListening = await firstValueFrom(this.isListening$);
      if (isListening) {
        await this.speechService.stopRecognition();
      } else {
        await this.speechService.startRecognition();
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      alert('Unable to access microphone. Please ensure microphone permissions are granted and try again.');
    }
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.speechService.setLanguage(select.value);
  }

  clearTranscript(): void {
    this.speechService.clearTranscript();
  }
}