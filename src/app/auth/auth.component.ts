import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './auth.component.html',
})
export class AuthComponent {

}
