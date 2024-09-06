// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/Auth/auth.service';
import { InactivityService } from './services/Auth/inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TicketsUpao';

  constructor(public authService: AuthService,
    private inactivityService: InactivityService) {}

  ngOnInit() {
      this.inactivityService.initializeInactivityTimer();
  }
}
