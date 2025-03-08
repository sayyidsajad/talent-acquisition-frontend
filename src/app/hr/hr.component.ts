import { Component } from '@angular/core';
import { JobUploadComponent } from "./components/job-upload/job-upload.component";

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [JobUploadComponent],
  templateUrl: './hr.component.html',
})
export class HrComponent {

}
