// src/app/services/inactivity.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  timeoutId: any;
  userActivity: Subject<any> = new Subject();

  constructor(private authService: AuthService) {
    this.setTimeout();
    this.userActivity.subscribe(() => this.resetTimer());
  }

  setTimeout() {
    this.timeoutId = setTimeout(() => this.authService.logout(), 60 * 60 * 1000); // 15 minutos
  }

  resetTimer() {
    clearTimeout(this.timeoutId);
    this.setTimeout();
  }

  initializeInactivityTimer() {
    document.body.addEventListener('click', () => this.userActivity.next(undefined));
    // Aquí puedes agregar otros eventos como 'keypress' o 'mousemove'
  }
}
