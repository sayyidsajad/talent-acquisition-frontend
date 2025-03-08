import { Component, ViewChild } from '@angular/core';
import { AddJobDialogComponent } from '../add-job-dialog/add-job-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-upload',
  standalone: true,
  imports: [AddJobDialogComponent],
  templateUrl: './job-upload.component.html',
})
export class JobUploadComponent {
  @ViewChild(AddJobDialogComponent) modal!: AddJobDialogComponent;

  constructor(private router: Router) {}

  openModal() {
    this.modal.open();
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    this.router.navigate(['/auth']);
  }
}
