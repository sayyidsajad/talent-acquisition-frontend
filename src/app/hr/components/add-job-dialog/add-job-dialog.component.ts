import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '../../../chat/services/chat.service';
import { HttpEventType } from '@angular/common/http';
@Component({
  selector: 'app-add-job-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-job-dialog.component.html',
})
export class AddJobDialogComponent {
  isOpen = false;
  pdfUploaded = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  @Output() jobUploaded = new EventEmitter<void>();

  constructor(private chatService: ChatService) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.chatService.uploadPdf(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.pdfUploaded = true;
          alert('Job uploaded successfully!');
          this.jobUploaded.emit();
          this.close();
        }
      },
      error: () => {
        this.isUploading = false;
        alert('Failed to upload job.');
      }
    });
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.reset();
  }

  reset() {
    this.pdfUploaded = false;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.isUploading = false;
  }
}
