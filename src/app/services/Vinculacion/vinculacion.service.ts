import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vinculacion } from 'src/app/interfaces/Vinculacion/Vinculacion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VinculacionService {
  private apiUrl = environment.vinculacionApiUrl;

  constructor(private http: HttpClient) { }

  getVinculaciones(): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(this.apiUrl);
  }

  getVinculacionById(id: string): Observable<Vinculacion> {
    return this.http.get<Vinculacion>(`${this.apiUrl}/${id}`);
  }

  createVinculacion(vinculacion: Vinculacion): Observable<Vinculacion> {
    return this.http.post<Vinculacion>(this.apiUrl, vinculacion);
  }

  updateVinculacion(id: string, vinculacion: Vinculacion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, vinculacion);
  }

  deleteVinculacion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVinculacionesByCodi(codi: string): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(`${this.apiUrl}/codi/${codi}`);
  }

  getVinculacionesByBreqCodi(breqCodi: string): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(`${this.apiUrl}/breq_codi/${breqCodi}`);
  }

  getVinculacionesByVincBreqCodi(vincBreqCodi: string): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(`${this.apiUrl}/vinc_breq_codi/${vincBreqCodi}`);
  }

  getVinculacionesByFechaActividad(fechaActividad: string): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(`${this.apiUrl}/fecha_actividad/${fechaActividad}`);
  }

  getVinculacionesByIdUsuario(idUsuario: string): Observable<Vinculacion[]> {
    return this.http.get<Vinculacion[]>(`${this.apiUrl}/id_usuario/${idUsuario}`);
  }

  deleteVinculacionByCriteria(breqCodi: string, vincBreqCodi: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteByCodiPair?breq_codi=${breqCodi}&vinc_breq_codi=${vincBreqCodi}`);
  }
  
  
  
}
