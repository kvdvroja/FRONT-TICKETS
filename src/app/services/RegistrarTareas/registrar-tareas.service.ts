import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrarTareasService {
  private apiUrl = environment.registrarTareasApiUrl;

  constructor(private http: HttpClient) { }

  getRegistrarTareas(): Observable<RegistrarTareas[]> {
    return this.http.get<RegistrarTareas[]>(this.apiUrl);
  }

  getRegistrarTareaById(id: string): Observable<RegistrarTareas> {
    return this.http.get<RegistrarTareas>(`${this.apiUrl}/${id}`);
  }

  createRegistrarTarea(registrarTareas: RegistrarTareas): Observable<RegistrarTareas> {
    return this.http.post<RegistrarTareas>(this.apiUrl, registrarTareas);
  }

  updateRegistrarTarea(id: string, registrarTarea: RegistrarTareas): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, registrarTarea);
  }

  updateRegistrarTareaCodi(id: string, registrarTarea: RegistrarTareas): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}only/${id}`, registrarTarea);
  }

  deleteRegistrarTarea(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  deleteRegistrarTareaXCodi(codi: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}codi/${codi}`);
  }

  getRegistrarTareasByRan1Codi(ran1Codi: string): Observable<RegistrarTareas[]> {
    return this.http.get<RegistrarTareas[]>(`${this.apiUrl}ran1/${ran1Codi}`);
  }
}
