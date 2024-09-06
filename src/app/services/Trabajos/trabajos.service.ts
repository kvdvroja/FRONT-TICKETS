import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajos } from 'src/app/interfaces/Trabajos/Trabajos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajosService {
  private apiUrl = environment.trabajosApiUrl;

  constructor(private http: HttpClient) {}

  // Obtener todos los trabajos
  getTrabajos(): Observable<Trabajos[]> {
    return this.http.get<Trabajos[]>(this.apiUrl);
  }

  // Obtener un trabajo por ID
  getTrabajo(id: string): Observable<Trabajos> {
    return this.http.get<Trabajos>(`${this.apiUrl}${id}`);
  }

  // Crear un nuevo trabajo
  createTrabajo(trabajo: Trabajos): Observable<Trabajos> {
    return this.http.post<Trabajos>(this.apiUrl, trabajo);
  }

  // Actualizar un trabajo existente
  updateTrabajo(id: string, trabajo: Trabajos): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, trabajo);
  }

  // Eliminar un trabajo por ID
  deleteTrabajo(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`,{ responseType: 'text' } );
  }
  

  // Obtener trabajos por código
  getTrabajosByCodi(codi: string): Observable<Trabajos[]> {
    return this.http.get<Trabajos[]>(`${this.apiUrl}codi/${codi}`);
  }

  // Obtener trabajos por nombre
  getTrabajosByNombre(nombre: string): Observable<Trabajos[]> {
    return this.http.get<Trabajos[]>(`${this.apiUrl}nombre/${nombre}`);
  }

  // Obtener trabajos por unidad
  getTrabajosByUnidCodi(unidCodi: string): Observable<Trabajos[]> {
    return this.http.get<Trabajos[]>(`${this.apiUrl}unid_codi/${unidCodi}`);
  }

  // Obtener trabajos por ID de usuario
  getTrabajosByIdUsuario(idUsuario: string): Observable<Trabajos[]> {
    return this.http.get<Trabajos[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }
}
