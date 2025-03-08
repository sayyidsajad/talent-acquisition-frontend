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
  parsedText: string = '';

  constructor() {}

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
