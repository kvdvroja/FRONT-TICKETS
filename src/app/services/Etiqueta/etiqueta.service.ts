import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etiqueta } from 'src/app/interfaces/Etiqueta/Etiqueta';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {
  private apiUrl = environment.etiquetaApiUrl;

  constructor(private http: HttpClient) { }

  getEtiquetas(): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(this.apiUrl);
  }

  getEtiquetaById(id: string): Observable<Etiqueta> {
    return this.http.get<Etiqueta>(`${this.apiUrl}${id}`);
  }

  getEtiquetaByCodi(codi: string): Observable<Etiqueta> {
    return this.http.get<Etiqueta>(`${this.apiUrl}search/${codi}`);
  }

  createEtiqueta(etiqueta: Etiqueta): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(this.apiUrl, etiqueta);
  }

  updateEtiqueta(codi: string, etiqueta: Etiqueta): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${codi}`, etiqueta);
  }

  deleteEtiqueta(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, {responseType: 'text'});
  }

  getEtiquetasByCodi(codi: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}codi/${codi}`);
  }

  getEtiquetasByUnidCodi(unidCodi: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}unid_codi/${unidCodi}`);
  }

  getEtiquetasByNombre(nombre: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}nombre/${nombre}`);
  }

  getEtiquetasByColorLetra(colorLetra: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}color_letra/${colorLetra}`);
  }

  getEtiquetasByColorFondo(colorFondo: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}color_fondo/${colorFondo}`);
  }

  getEtiquetasByFechaActividad(fechaActividad: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}fecha_actividad/${fechaActividad}`);
  }

  getEtiquetasByIdUsuario(idUsuario: string): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }
}
