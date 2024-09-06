import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asignacion } from '../interfaces/Asignacion/Asignacion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private apiUrl = environment.asignacionApiUrl;

  constructor(private http: HttpClient) { }

  getAsignaciones(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(this.apiUrl);
  }

  getAsignacionesByID(id: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}${id}`);
  }

  getAsignacionesByPIDM(pidm: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}pidm/${pidm}`);
  }

  getAsignacionesByCodi(codi: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}codi/${codi}`);
  }

  getAsignacionesByCateCodiAndCargCodi(cateCodi: string, cargCodi: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}search?cate_codi=${cateCodi}&carg_codi=${cargCodi}`);
  }

  getAsignacionesByCateCodiAndExcept(cateCodi: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}searchExcept?cate_codi=${cateCodi}`);
  }

  getAsignacionesByCateCodi(cateCodi: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}searchAll?cate_codi=${cateCodi}`);
  }

  createAsignacion(asignacion: Asignacion): Observable<Asignacion> {
    return this.http.post<Asignacion>(this.apiUrl, asignacion);
  }

  updateAsignacion(id: string, asignacion: Asignacion): Observable<Asignacion> {
    return this.http.put<Asignacion>(`${this.apiUrl}${id}`, asignacion);
  }

  deleteAsignacion(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  getAsignacionesByExactPIDM(pidm: string): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}exact-pidm/${pidm}`);
  }
}
