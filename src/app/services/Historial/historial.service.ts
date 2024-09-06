import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = environment.historialApiUrl;

  constructor(private http: HttpClient) { }

  getHistoriales(): Observable<Historial[]> {
    return this.http.get<Historial[]>(this.apiUrl);
  }

  getHistorialById(id: string): Observable<Historial> {
    return this.http.get<Historial>(`${this.apiUrl}/${id}`);
  }

  createHistorial(historial: Historial): Observable<Historial> {
    return this.http.post<Historial>(this.apiUrl, historial);
  }

  updateHistorial(id: string, historial: Historial): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, historial);
  }

  deleteHistorial(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getHistorialesByCodi(codi: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/codi/${codi}`);
  }

  getHistorialesByBreqCodi(breqCodi: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/breq_codi/${breqCodi}`);
  }

  getHistorialesByPidm(pidm: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/pidm/${pidm}`);
  }

  getHistorialesByDescripcion(descripcion: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/descripcion/${descripcion}`);
  }

  getHistorialesByTipo(tipo: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  getHistorialesByFechaActividad(fechaActividad: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/fecha_actividad/${fechaActividad}`);
  }

  getHistorialesByIdUsuario(idUsuario: string): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/id_usuario/${idUsuario}`);
  }
  
}
