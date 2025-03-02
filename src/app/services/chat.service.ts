import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/chat';
  private chatHistory = new BehaviorSubject<
    { sender: string; message: string }[]
  >([]);

  constructor(private http: HttpClient) {}

  getChatHistory() {
    return this.chatHistory.asObservable();
  }

  sendMessage(userId: string, message: string) {
    this.chatHistory.next([
      ...this.chatHistory.value,
      { sender: 'user', message },
    ]);

    this.http
      .post<{ message: string }>(this.apiUrl, { userId, message })
      .subscribe((response) => {
        this.chatHistory.next([
          ...this.chatHistory.value,
          { sender: 'ai', message: response.message },
        ]);
      });
  }
}
