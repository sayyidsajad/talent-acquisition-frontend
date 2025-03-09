import { Component, ViewChild } from '@angular/core';
import { AddJobDialogComponent } from '../add-job-dialog/add-job-dialog.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Job } from '../../../job-feed/models/job.model';
import { JobService } from '../../../job-feed/services/job.service';

@Component({
  selector: 'app-job-upload',
  standalone: true,
  imports: [AddJobDialogComponent, CommonModule],
  templateUrl: './job-upload.component.html',
})
export class JobUploadComponent {
  @ViewChild(AddJobDialogComponent) modal!: AddJobDialogComponent;
  jobs: Job[] = [];

  constructor(private router: Router, private jobService: JobService) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.jobService.getJobs().subscribe({
      next: (response: any) => {
        this.jobs = response.data;
      },
      error: () => {
        console.error('Failed to fetch jobs');
      },
    });
  }

  openModal() {
    this.modal.open();
  }

  onJobUploaded() {
    this.fetchJobs();
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    this.router.navigate(['/auth']);
  }

  deleteJob(jobId: string, index: number) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(jobId).subscribe(() => {
        this.jobs.splice(index, 1);
      });
    }
  }
}
