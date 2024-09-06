import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Organizacion } from '../../../interfaces/selects/Organizacion/organizacion';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class OrganizacionService {
  private apiUrl = environment.organizacionApiUrl; 

  constructor(private http: HttpClient) { }

  getOrganizaciones(): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(this.apiUrl);
  }

  getOrganizacionesById(id: string): Observable<Organizacion> {
    return this.http.get<Organizacion>(`${this.apiUrl}${id}`);
  }

  createOrganizacion(organizacion: Organizacion): Observable<Organizacion> {
    return this.http.post<Organizacion>(this.apiUrl, organizacion);
  }

  updateOrganizacion(id: string, organizacion: Organizacion): Observable<Organizacion> {
    return this.http.put<Organizacion>(`${this.apiUrl}${id}`, organizacion);
  }

  deleteOrganizacion(Id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${Id}`, { responseType: 'text' });
  }

  getOrganizacionActivos(): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(`${this.apiUrl}active`).pipe(
      catchError(this.handleError<Organizacion[]>('getOrganizacionActivos', []))
    );
  }

  searchOrganizacion(descripcion: string): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(`${this.apiUrl}search`, { params: { descripcion } }).pipe(
      map((response: Organizacion[]) => response || []),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          // Retornar un arreglo vacío si no se encuentra nada
          return of<Organizacion[]>([]);
        } else {
          // Manejar otros errores
          console.error(`searchOrganizacion failed: ${error.message}`);
          return of([]);
        }
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
