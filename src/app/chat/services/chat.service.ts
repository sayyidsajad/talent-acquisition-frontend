import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'ai';
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/chat';

  private chatHistory = new BehaviorSubject<ChatMessage[]>([]);
  chatHistory$ = this.chatHistory.asObservable();
  private messages: ChatMessage[] = [];

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.chatHistory.next(this.messages);
  }

  sendMessage(userId: string, message: string): Observable<ChatMessage> {
    const userMessage: ChatMessage = {
      sender: 'user',
      message,
      id: '',
      userId: '',
      createdAt: '',
    };
    this.messages.push(userMessage);
    this.chatHistory.next([...this.messages]);

    this.loadingSubject.next(true);

    return this.http.post<ChatMessage>(this.apiUrl, { userId, message }).pipe(
      tap((response) => {
        this.messages.push({
          sender: 'ai',
          message: response.message,
          id: '',
          userId: '',
          createdAt: '',
        });
        this.chatHistory.next([...this.messages]);
        this.loadingSubject.next(false);
      })
    );
  }

  fetchChatHistory(userId: string) {
    this.http
      .get<{ history: ChatMessage[] }>(`${this.apiUrl}/chat/${userId}/history`)
      .subscribe((response) => {
        this.chatHistory.next(response.history);
      });
  }
}
