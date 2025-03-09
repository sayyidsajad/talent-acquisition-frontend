import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { JobFeedComponent } from './job-feed/job-feed.component';
import { AuthComponent } from './auth/auth.component';
import { MagicLinkVerifyComponent } from './auth/components/magic-link-verify/magic-link-verify.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { HrComponent } from './hr/hr.component';
import { RedirectComponent } from './redirect/redirect.component';
import { ChatGuard } from './chat/guards/chat.guard';

export const routes: Routes = [
  {
    path: '',
    component: RedirectComponent,
  },
  {
    path: 'job-feed',
    component: JobFeedComponent,
    canActivate: [AuthGuard],
    data: { role: 'Candidate' },
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard],
    canDeactivate: [ChatGuard],
    data: { role: 'Candidate' },
  },
  {
    path: 'hr',
    component: HrComponent,
    canActivate: [AuthGuard],
    data: { role: 'HR' },
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth/verify',
    component: MagicLinkVerifyComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundComponent },
];
