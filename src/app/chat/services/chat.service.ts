import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_URLS } from '../../common/url';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  userId?: string;
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

  private apiUrl = environment.apiUrl;
  private chatHistory = new BehaviorSubject<ChatMessage[]>([]);
  chatHistory$ = this.chatHistory.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(jobId: string, message: string): Observable<any> {
    const userMessage: ChatMessage = {
      sender: 'user',
      message,
      id: '',
      createdAt: new Date().toISOString(),
    };

    const currentMessages = this.chatHistory.value;
    this.chatHistory.next([...currentMessages, userMessage]);
    this.loadingSubject.next(true);

    return this.http
      .post<any>(`${this.apiUrl}/chat/message`, { jobId, message })
      .pipe(
        tap((response) => {
          const aiMessage: ChatMessage = {
            sender: 'ai',
            message: response.message,
            id: response.id || '',
            createdAt: response.createdAt || new Date().toISOString(),
          };
          this.chatHistory.next([...this.chatHistory.value, aiMessage]);
          this.loadingSubject.next(false);
        })
      );
  }

  fetchChatHistory(jobId: string) {
    this.http
      .get<{ success: boolean; data: ChatMessage[] }>(
        `${this.apiUrl}/chat/history/${jobId}`
      )
      .subscribe((response) => {
        if (response.success) {
          this.chatHistory.next(response.data);
        }
      });
  }

  addMessage(message: ChatMessage) {
    const currentMessages = this.chatHistory.value;
    this.chatHistory.next([...currentMessages, message]);
  }

  setPdfUploaded(value: boolean) {
    this.pdfUploadedSubject.next(value);
  }

  initializeInterview(jobId: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http
      .get<any>(`${this.apiUrl}/chat/initialize-interview/${jobId}`)
      .pipe(
        tap((response) => {
          if (response.success && response.message) {
            const aiMessage: ChatMessage = {
              sender: 'ai',
              message: response.message,
              id: response.id || '',
              createdAt: new Date().toISOString(),
            };
            this.chatHistory.next([aiMessage]);
          }
          this.loadingSubject.next(false);
        })
      );
  }

  uploadPdf(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('pdf', file);
    return this.http.post<{
      success: boolean;
      message: string;
      firstQuestion: string;
    }>(`${this.apiUrl}/chat/upload-pdf`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
