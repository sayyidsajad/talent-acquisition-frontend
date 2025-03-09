import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { ChatComponent } from '../chat.component';
import { Location } from '@angular/common';


@Injectable({
  providedIn: 'root',
})
export class ChatGuard implements CanDeactivate<ChatComponent> {
  constructor(private router: Router, private location: Location) {}

  canDeactivate(component: ChatComponent): boolean {
    const interviewCompleted = localStorage.getItem('interviewCompleted') === 'true';

    if (interviewCompleted) {
      localStorage.removeItem('interviewCompleted');
      return true;
    }

    const confirmLeave = confirm('Are you sure you want to leave? Your interview may be interrupted.');

    if (confirmLeave) {
      return true;
    } else {
      // this.location.back();
      return false;
    }
  }
}