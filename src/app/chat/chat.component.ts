import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatMessage, ChatService } from './services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  first,
  fromEvent,
  interval,
  merge,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import { ChatMessagesComponent } from './components/chat-messages/chat-messages.component';
import { ChatInputComponent } from './components/chat-input/chat-input.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChatMessagesComponent,
    ChatInputComponent,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  chatHistory$!: Observable<ChatMessage[]>;
  loading = false;
  jobId!: string;
  isInterviewActive = false;
  private routeSubscription: Subscription | null = null;
  private subscriptions: Subscription[] = [];
  private idleTimer: Subscription | null = null;
  private readonly IDLE_TIMEOUT = 300000;
  private readonly MAX_PASTE_ATTEMPTS = 3;
  private pasteAttempts = 0;
  private focusLostCount = 0;
  private readonly MAX_FOCUS_LOST = 5;
  private lastInteractionTime = Date.now();
  private isPageVisible = true;
  private originalTitle = document.title;
  private fullscreenActive = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.originalTitle = document.title;
    this.forceFullScreen();
    this.disableBrowserShortcuts();
    this.startIdleMonitoring();
    this.monitorVisibility();
    this.monitorFullscreenChanges();

    this.chatHistory$ = this.chatService.chatHistory$;

    const loadingSub = this.chatService.loading$.subscribe(
      (isLoading) => (this.loading = isLoading)
    );
    this.subscriptions.push(loadingSub);

    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const newJobId = params['jobId'];
      if (newJobId && newJobId !== this.jobId) {
        this.jobId = newJobId;
        this.loadChatHistory();
      } else if (!newJobId) {
        this.router.navigate(['/']);
      }
    });

    const historySub = this.chatHistory$.subscribe((messages) => {
      this.chatService.setPdfUploaded(messages.length > 0);
      this.scrollToBottom();
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage?.sender === 'ai' &&
        (lastMessage.message.includes('You are a good fit for the role') ||
          lastMessage.message.includes('You are not a good fit for the role'))
      ) {
        this.handleInterviewCompletion(lastMessage.message);
      }
    });
    this.subscriptions.push(historySub);

    window.addEventListener('beforeunload', this.preventRefresh);
    document.addEventListener('copy', this.preventCopy);
    document.addEventListener('cut', this.preventCut);
    document.addEventListener('paste', this.handlePaste);

    const userInteractions = merge(
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'touchstart')
    );

    const interactionSub = userInteractions.subscribe(() => {
      this.lastInteractionTime = Date.now();
    });
    this.subscriptions.push(interactionSub);
  }

  private monitorFullscreenChanges() {
    document.addEventListener(
      'fullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'webkitfullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'mozfullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'MSFullscreenChange',
      this.handleFullscreenChange.bind(this)
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  private loadChatHistory() {
    this.chatService.fetchChatHistory(this.jobId);
    this.chatHistory$
      .pipe(first((messages) => messages.length === 0))
      .subscribe(() => {
        this.chatService.initializeInterview(this.jobId).subscribe(() => {
          this.chatService.fetchChatHistory(this.jobId);
        });
      });
  }

  sendMessage(message: string) {
    if (!message.trim()) return;

    this.lastInteractionTime = Date.now();

    this.loading = true;
    this.chatService.sendMessage(this.jobId, message.trim()).subscribe({
      next: () => (this.loading = false),
      error: () => {
        this.loading = false;
      },
    });
  }

  private handleInterviewCompletion(lastMessage: string) {
    localStorage.setItem('interviewCompleted', 'true');
    this.router.navigate(['/']);
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('cut', this.preventCut);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'webkitfullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'mozfullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'MSFullscreenChange',
      this.handleFullscreenChange
    );
    window.removeEventListener('beforeunload', this.preventRefresh);
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.idleTimer?.unsubscribe();

    this.exitFullScreen();

    alert(`Interview has been completed, ${lastMessage}`);
  }

  private startIdleMonitoring() {
    this.idleTimer = interval(30000).subscribe(() => {
      const currentTime = Date.now();
      if (currentTime - this.lastInteractionTime > this.IDLE_TIMEOUT) {
        this.handleUserIdle();
      }
    });
    this.subscriptions.push(this.idleTimer);
  }

  private handleUserIdle() {
    const confirmContinue = confirm(
      'You have been inactive for a while. Do you want to continue with the interview?'
    );
    if (confirmContinue) {
      this.lastInteractionTime = Date.now();
    } else {
      this.router.navigate(['/']);
    }
  }

  private monitorVisibility() {
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.isPageVisible = false;
      document.title = '⚠️ Return to your interview!';
      this.focusLostCount++;

      if (this.focusLostCount >= this.MAX_FOCUS_LOST) {
        this.ngZone.run(() => {
          alert(
            'You have switched tabs/windows too many times. This behavior may be flagged.'
          );
        });
      }
    } else {
      this.isPageVisible = true;
      document.title = this.originalTitle;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  private preventRefresh(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue =
      'You have an ongoing interview. Are you sure you want to leave?';
  }

  @HostListener('contextmenu', ['$event'])
  private onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('window:keydown', ['$event'])
  private disableDevTools(event: KeyboardEvent) {
    if (
      event.key === 'F12' ||
      (event.ctrlKey &&
        event.shiftKey &&
        (event.key === 'I' || event.key === 'J')) ||
      (event.ctrlKey && event.key === 'U') ||
      (event.altKey && event.key === 'I') ||
      (event.altKey && event.key === 'C')
    ) {
      event.preventDefault();
    }
  }

  @HostListener('window:keydown', ['$event'])
  private blockShortcuts(event: KeyboardEvent): void {
    const blockedKeys = [
      'r',
      'R',
      't',
      'T',
      'w',
      'W',
      'p',
      'P',
      's',
      'S',
      'F5',
      'Escape', // We'll catch 'Escape' here for fullscreen exit
      'Esc',
    ];
  
    if (
      (event.ctrlKey && blockedKeys.includes(event.key)) ||
      (event.metaKey && blockedKeys.includes(event.key)) ||
      (event.altKey && event.key === 'Tab') ||
      (event.altKey && event.key === 'F4')
    ) {
      event.preventDefault();
      event.stopPropagation();
  
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (!document.fullscreenElement) {
          // If not in full-screen mode, do nothing
          return;
        }
  
        const confirmExit = confirm(
          'You are attempting to exit full-screen mode. Click "Cancel" to stay in full-screen.'
        );
  
        if (!confirmExit) {
          // If the user cancels, stay in full-screen mode
          this.forceFullScreen();
        } else {
          // If the user confirms, allow the exit (this will happen naturally)
          this.exitFullScreen();
        }
      } else {
        alert('Action is blocked during the interview process.');
      }
  
      return;
    }
  }
  private forceFullScreen() {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      alert('Please enable full-screen mode for the interview.');
    }
  }

  private handleFullscreenChange() {
    const isFullscreenNow =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;
  
    this.fullscreenActive = !!isFullscreenNow;
  
    if (!this.fullscreenActive && this.isInterviewActive) {
      setTimeout(() => {
        this.forceFullScreen();
        alert('Fullscreen mode is required for this interview');
      }, 100);
    }
  }

  @HostListener('document:fullscreenchange')
  onFullScreenChange() {
    if (!document.fullscreenElement) {
      setTimeout(() => {
        this.forceFullScreen();
      }, 100);
    }
  }

  // @HostListener('window:blur', ['$event'])
  // onWindowBlur() {
  //   const confirmExit = confirm('Are you sure you want to leave? Your interview may be interrupted.');
  
  //   if (!confirmExit) {
  //     // If user cancels, force full-screen
  //     this.forceFullScreen();
  //   } else {
  //     // If user confirms, navigate to the home page
  //     this.router.navigate(['/']);
  //   }
  // }

  private preventCopy = (event: Event) => {
    event.preventDefault();
    alert('Copying is not allowed during the interview process.');
  };

  private preventCut = (event: Event) => {
    event.preventDefault();
    alert('Cutting is not allowed during the interview process.');
  };

  private handlePaste = (event: Event) => {
    this.pasteAttempts++;
    if (this.pasteAttempts > this.MAX_PASTE_ATTEMPTS) {
      event.preventDefault();
      alert('Too many paste attempts detected. This will be flagged.');
    }
  };

  private disableBrowserShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['n', 'N', 'o', 'O'].includes(event.key)
      ) {
        event.preventDefault();
        alert('Opening a new window is disabled during the interview.');
      }
    });
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }

    this.fullscreenActive = false;
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.idleTimer?.unsubscribe();

    window.removeEventListener('beforeunload', this.preventRefresh);
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('cut', this.preventCut);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'webkitfullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'mozfullscreenchange',
      this.handleFullscreenChange
    );
    document.removeEventListener(
      'MSFullscreenChange',
      this.handleFullscreenChange
    );

    this.exitFullScreen();
  }
}
