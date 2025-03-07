import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { JobFeedComponent } from './job-feed/job-feed.component';
import { AuthComponent } from './auth/auth.component';
import { MagicLinkVerifyComponent } from './auth/components/magic-link-verify/magic-link-verify.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'job-feed', pathMatch: 'full' },
  { path: 'job-feed', component: JobFeedComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent, canActivate: [AuthGuard] },
  { path: 'auth/verify', component: MagicLinkVerifyComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent },
];