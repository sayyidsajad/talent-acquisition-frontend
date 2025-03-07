import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { JobService } from './services/job.service';
import { Job, JobResponse } from './models/job.model';

@Component({
  selector: 'app-job-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-feed.component.html',
})
export class JobFeedComponent {
  jobs: Job[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.fetchJobs();
  }
  fetchJobs(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: (response: JobResponse) => {
        this.jobs = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load jobs';
        console.error('Error fetching jobs:', err);
        this.loading = false;
      },
    });
  }
}
