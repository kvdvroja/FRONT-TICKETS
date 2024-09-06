import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrarEtiqueta } from 'src/app/interfaces/Etiqueta/RegistrarEtiqueta';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroEtiquetasService {
  private apiUrl = environment.registroEtiquetasApiUrl;

  constructor(private http: HttpClient) { }

  getRegistroEtiquetas(): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(this.apiUrl);
  }

  getRegistroEtiquetaById(id: string): Observable<RegistrarEtiqueta> {
    return this.http.get<RegistrarEtiqueta>(`${this.apiUrl}${id}`);
  }

  createRegistroEtiqueta(registroEtiqueta: RegistrarEtiqueta): Observable<RegistrarEtiqueta> {
    return this.http.post<RegistrarEtiqueta>(this.apiUrl, registroEtiqueta);
  }

  updateRegistroEtiqueta(id: string, registroEtiqueta: RegistrarEtiqueta): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, registroEtiqueta);
  }

  deleteRegistroEtiqueta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  getRegistroEtiquetasByCodi(codi: string): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(`${this.apiUrl}codi/${codi}`);
  }

  getRegistroEtiquetasByRan1Codi(ran1Codi: string): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(`${this.apiUrl}ran1_codi/${ran1Codi}`);
  }

  getRegistroEtiquetasByEtiqCodi(etiqCodi: string): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(`${this.apiUrl}etiq_codi/${etiqCodi}`);
  }

  getRegistroEtiquetasByFechaActividad(fechaActividad: string): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(`${this.apiUrl}fecha_actividad/${fechaActividad}`);
  }

  getRegistroEtiquetasByIdUsuario(idUsuario: string): Observable<RegistrarEtiqueta[]> {
    return this.http.get<RegistrarEtiqueta[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }
}
