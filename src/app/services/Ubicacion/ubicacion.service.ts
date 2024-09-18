import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ubicacion } from 'src/app/interfaces/Ubicacion/Ubicacion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private apiUrl = environment.ubicacionApiUrl; // Asegúrate de que esté definido en el archivo de configuración

  constructor(private http: HttpClient) { }

  // Obtener todas las ubicaciones
  getUbicaciones(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.apiUrl);
  }

  // Obtener una ubicación por ID
  getUbicacionByID(id: string): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.apiUrl}${id}`);
  }

  // Buscar ubicaciones por Campus
  getUbicacionesByCampus(campus: string): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(`${this.apiUrl}search?campus=${campus}`);
  }

  // Crear una nueva ubicación
  createUbicacion(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.apiUrl, ubicacion);
  }

  // Actualizar una ubicación existente
  updateUbicacion(id: string, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}${id}`, ubicacion);
  }

  // Eliminar una ubicación por ID
  deleteUbicacion(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }
}
