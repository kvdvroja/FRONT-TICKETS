import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Progreso } from 'src/app/interfaces/Progreso/Progreso';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgresoService {
  private apiUrl = environment.progresoApiUrl;

  constructor(private http: HttpClient) { }

   // Obtener todos los progresos
   getProgresos(): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(this.apiUrl);
  }

  // Obtener un progreso por ID
  getProgresoById(id: string): Observable<Progreso> {
    return this.http.get<Progreso>(`${this.apiUrl}${id}`);
  }

  // Crear un nuevo progreso
  createProgreso(progreso: Progreso): Observable<Progreso> {
    return this.http.post<Progreso>(this.apiUrl, progreso);
  }

  // Actualizar un progreso existente
  updateProgreso(id: string, progreso: Progreso): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, progreso);
  }

  // Eliminar un progreso por ID
  deleteProgreso(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`,{responseType: 'text'});
  }

  // Obtener progresos por código
  getProgresosByCodi(codi: string): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(`${this.apiUrl}codi/${codi}`);
  }

  // Obtener progresos por nombre
  getProgresosByNombre(nombre: string): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(`${this.apiUrl}nombre/${nombre}`);
  }

  // Obtener progresos por código de unidad
  getProgresosByUnidCodi(unidCodi: string): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(`${this.apiUrl}unid_codi/${unidCodi}`);
  }

  // Obtener progresos por ID de usuario
  getProgresosByIdUsuario(idUsuario: string): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }
}
