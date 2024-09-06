import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.dashboardApiUrl; 
  constructor(private http: HttpClient) { }

  getTicketByEstado(month: number, year: number, unidCodi: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getTotalEstado/${month}/${year}/${unidCodi}`);
  }

  getTicketByCoordinacion(month: number, year: number, unidCodi: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getTotalCoordinacion/${month}/${year}/${unidCodi}`);
  }

  getTicketByTipologia(month: number, year: number, unidCodi: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getTotalTipologia/${month}/${year}/${unidCodi}`);
  }

  getTicketByOrganizacion(month: number, year: number, unidCodi: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getTotalOrganizacion/${month}/${year}/${unidCodi}`);
  }

  getCatalogo(month: number, year: number, unidCodi: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getCatalogo/${month}/${year}/${unidCodi}`);
  }
}


