import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  pdfUploaded: boolean = false;
  selectedFile: File | null = null;
  uploadProgress = 0;

  constructor(private chatService: ChatService) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadFile(userId: string) {
    if (!this.selectedFile) return;

    this.chatService.uploadPdf(userId, this.selectedFile).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.pdfUploaded = true;
      }
    });
  }
  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}
