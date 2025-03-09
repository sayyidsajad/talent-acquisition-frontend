import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [],
  templateUrl: './redirect.component.html',
})
export class RedirectComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    const role = localStorage.getItem('role');
    if (role === 'Candidate') {
      this.router.navigate(['/job-feed']);

    } else {
      this.router.navigate(['/hr']);

    }
  }
}
