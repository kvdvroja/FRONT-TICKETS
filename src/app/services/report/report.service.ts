import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private myAppUrl = environment.apiBaseUrl; // Asegúrate de usar la URL correcta de tu backend

  constructor(private http: HttpClient) { }

  downloadMonthlyReport(year: number, month: number): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}ExportMonthlyReport/export/${year}/${month}`, {
      responseType: 'blob', // Cambiado a 'blob' directamente, sin el 'as 'json''
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    });
  }
  
  downloadReport(query : string): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}ExportMonthlyReport/exports?${query}`, {
      responseType: 'blob', // Cambiado a 'blob' directamente, sin el 'as 'json''
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    });
  }

  getRecords(query : string): Observable<any[]> {
    return this.http.get<any>(`${this.myAppUrl}ExportMonthlyReport/records?${query}`);
  }
}
