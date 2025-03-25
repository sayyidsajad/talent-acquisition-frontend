import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobResponse } from '../models/job.model';
import { API_URLS } from '../../common/url';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.apiUrl}/job`);
  }
  getJobDetails(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`);
  }
  deleteJob(jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/job/${jobId}`);
  }
  attendInterview(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/initialize-interview/${jobId}`);
  }
}
