import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  userId = 'user123';
  message = '';
  chatHistory: { sender: string; message: string }[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getChatHistory().subscribe((history) => {
      this.chatHistory = history;
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.chatService.sendMessage(this.userId, this.message.trim());
      this.message = '';
    }
  }
}
