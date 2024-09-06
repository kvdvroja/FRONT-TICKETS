import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prioridad } from '../../../interfaces/selects/Prioridad/prioridad';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class PrioridadService {
  private apiUrl = environment.prioridadApiUrl; // Utiliza la URL específica para los endpoints de Prioridad

  constructor(private http: HttpClient) { }

  getPrioridad(): Observable<Prioridad[]> {
    return this.http.get<Prioridad[]>(this.apiUrl);
  }

  getPrioridadById(id: string): Observable<Prioridad> {
    return this.http.get<Prioridad>(`${this.apiUrl}${id}`);
  }

  getPrioridadByCodi(codi: string): Observable<Prioridad[]> {
    return this.http.get<Prioridad[]>(`${this.apiUrl}codi/${codi}`);
  }

  getPrioridadByUnidCodi(unidCodi: string): Observable<Prioridad[]> {
    return this.http.get<Prioridad[]>(`${this.apiUrl}unid_codi/${unidCodi}`);
  }

  getPrioridadByDescripcion(descripcion: string): Observable<Prioridad[]> {
    return this.http.get<Prioridad[]>(`${this.apiUrl}descripcion/${descripcion}`);
  }

  getPrioridadByIdUsuario(idUsuario: string): Observable<Prioridad[]> {
    return this.http.get<Prioridad[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }

  createPrioridad(prioridad: Prioridad): Observable<Prioridad> {
    return this.http.post<Prioridad>(this.apiUrl, prioridad);
  }

  updatePrioridad(id: string, prioridad: Prioridad): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, prioridad);
  }

  deletePrioridad(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }
}
