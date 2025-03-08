import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Job, JobResponse } from '../models/job.model';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getJobs(): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.apiUrl}/job`);
  }
  attendInterview(jobId: string): Observable<any> {    
    return this.http.get<any>(`${this.apiUrl}/chat/generate-question/${jobId}`);
  }
}
