// src/app/services/auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authApiUrl;
  private isAuthenticated = false;
  private currentUser: UserDetail | null = null;
  private urlApiSSO3 = environment.urlSSO + '/Token/Index';

  constructor(private http: HttpClient, private router: Router) {
    this.initializeLoginStatus();
  }

  login(credentials: UserLogin): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.apiUrl}/login`, credentials).pipe(
      tap(userDetail => {
        if (userDetail && userDetail.token) {
          this.isAuthenticated = true;
          this.currentUser = userDetail;
          localStorage.setItem('currentUserToken', userDetail.token);
          localStorage.setItem('currentUser', JSON.stringify(userDetail));
        }
      })
    );
  }

  register(credentials: UserLogin): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.apiUrl}/register`, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(error.error.message));
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getCurrentUser(): UserDetail | null {
    return this.currentUser;
  }

  public postToken(params: any): Observable<any> {
    return this.http.post<any>(this.urlApiSSO3, params);
  }

  logout(): void {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('currentUserToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
  }

  initializeLoginStatus(): void {
    const token = localStorage.getItem('currentUserToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      this.isAuthenticated = true;
      this.currentUser = JSON.parse(user);
    }
  }
}
