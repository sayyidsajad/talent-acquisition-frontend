import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
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
  private pdfUploadedSubject = new BehaviorSubject<boolean>(false);
  pdfUploaded$ = this.pdfUploadedSubject.asObservable();
  private apiUrl = 'http://localhost:3000';
  private chatHistory = new BehaviorSubject<ChatMessage[]>([]);
  chatHistory$ = this.chatHistory.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(userId: string, message: string): Observable<ChatMessage> {
    const userMessage: ChatMessage = {
      sender: 'user',
      message,
      id: '',
      userId,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = this.chatHistory.value;
    this.chatHistory.next([...currentMessages, userMessage]);

    this.loadingSubject.next(true);

    return this.http
      .post<ChatMessage>(`${this.apiUrl}/chat`, { userId, message })
      .pipe(
        tap((response) => {
          const aiMessage: ChatMessage = {
            sender: 'ai',
            message: response.message,
            id: response.id || '',
            userId: userId,
            createdAt: response.createdAt || new Date().toISOString(),
          };

          this.chatHistory.next([...this.chatHistory.value, aiMessage]);
          this.loadingSubject.next(false);
        })
      );
  }

  fetchChatHistory(userId: string) {
    this.http
      .get<{ success: boolean; data: ChatMessage[] }>(
        `${this.apiUrl}/chat/${userId}/history`
      )
      .subscribe((response) => {
        if (response.success) {
          this.chatHistory.next(response.data);
        }
      });
  }

  uploadPdf(userId: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('pdf', file);
    return this.http.post<{
      success: boolean;
      message: string;
      firstQuestion: string;
    }>(`${this.apiUrl}/chat/${userId}/upload-pdf`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  addMessage(message: ChatMessage) {
    const currentMessages = this.chatHistory.value;
    this.chatHistory.next([...currentMessages, message]);
  }

  setPdfUploaded(status: boolean) {
    this.pdfUploadedSubject.next(status);
  }
}
