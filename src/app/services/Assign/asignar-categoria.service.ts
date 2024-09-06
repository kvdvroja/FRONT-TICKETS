import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, of } from 'rxjs';
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class AsignarCategoriaService {
  private apiUrl = environment.asignarCategoriaApiUrl; // Utiliza la URL específica para los endpoints de AsignarCategoria

  constructor(private http: HttpClient) { }

  getAsignacionCategoria(): Observable<AsignarCategoria[]> {
    return this.http.get<AsignarCategoria[]>(this.apiUrl);
  }

  getAsignacionCategoriaByID(id: string): Observable<AsignarCategoria> {
    return this.http.get<AsignarCategoria>(`${this.apiUrl}${id}`);
  }

  createAsignacionCategoria(asignarCategoria: AsignarCategoria): Observable<AsignarCategoria> {
    return this.http.post<AsignarCategoria>(this.apiUrl, asignarCategoria);
  }

  updateAsignacionCategoria(id: string, asignarCategoria: AsignarCategoria): Observable<AsignarCategoria> {
    return this.http.put<AsignarCategoria>(`${this.apiUrl}${id}`, asignarCategoria);
  }

  deleteAsignacionCategoria(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getAsignacionCategoriaByBreq(breqCodi: string): Observable<AsignarCategoria[]> {
    return this.http.get<AsignarCategoria[]>(`${this.apiUrl}breq/${breqCodi}`);
  }

  
  getAsignarCategoriaByBreqCodiAndCateCodi(breq_codi: string, cate_codi: string): Observable<AsignarCategoria[]> {
    return this.http.get<AsignarCategoria[]>(`${this.apiUrl}breq/${breq_codi}/cate/${cate_codi}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching AsignarCoordinador:', error);
          return of([]); // Devolver una lista vacía en caso de error
        })
      );
  }

  deleteAsignacionesByTicketId(ticketId: string): Observable<string> {
    console.log(`Eliminando asignaciones para el ticket con ID: ${ticketId}`);
    return this.http.delete<string>(`${this.apiUrl}ticket/${ticketId}`);
  }
}
