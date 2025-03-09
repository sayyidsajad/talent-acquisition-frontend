import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { JobService } from './services/job.service';
import { Job, JobResponse } from './models/job.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-feed.component.html',
})
export class JobFeedComponent {
  jobs: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private jobService: JobService, private router: Router) {}

  ngOnInit(): void {
    this.fetchJobs();
  }
  fetchJobs(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: (response: JobResponse) => {
        this.jobs = response.data.map(job => ({
          ...job,
          attended: job.interviews?.length > 0,
        }));

        this.jobs.sort((a, b) => Number(a.attended) - Number(b.attended));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
        this.loading = false;
      },
    });
  }
  attendInterview(jobId: string) {
    this.router.navigate(['/chat'], { queryParams: { jobId } });
  }
  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    this.router.navigate(['/auth']);
  }
}
