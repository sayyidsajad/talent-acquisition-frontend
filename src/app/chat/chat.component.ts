import { Component, OnInit } from '@angular/core';
import { ChatMessage, ChatService } from './services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatMessagesComponent } from './components/chat-messages/chat-messages.component';
import { ChatInputComponent } from './components/chat-input/chat-input.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChatMessagesComponent,
    ChatInputComponent,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {
  userId = 'user123';
  chatHistory$!: Observable<ChatMessage[]>;
  loading = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatHistory$ = this.chatService.chatHistory$;
    this.chatService.fetchChatHistory(this.userId);
  }


  sendMessage(message: string) {
    if (!message.trim()) return;

    this.loading = true;
    this.chatService.sendMessage(this.userId, message.trim()).subscribe({
      next: () => {
        this.chatService.fetchChatHistory(this.userId);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
