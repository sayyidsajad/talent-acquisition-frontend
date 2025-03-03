import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  @Output() messageSend = new EventEmitter<string>();
  message = '';
  pdfUploaded: boolean = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  parsedText: string = '';

  constructor(private chatService: ChatService) {
    this.chatService.pdfUploaded$.subscribe((status) => {
      this.pdfUploaded = status;
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadFile(userId: string) {
    if (!this.selectedFile) return;

    this.chatService.uploadPdf(userId, this.selectedFile).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.chatService.setPdfUploaded(true);
        if (event.body && event.body.firstQuestion) {
          const firstQuestionMessage: ChatMessage = {
            sender: 'ai',
            message: event.body.firstQuestion,
            id: '',
            userId,
            createdAt: new Date().toISOString(),
          };

          this.chatService.addMessage(firstQuestionMessage);
        }
      }
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.messageSend.emit(this.message);
      this.message = '';
    }
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  handleEnter(event: any): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
