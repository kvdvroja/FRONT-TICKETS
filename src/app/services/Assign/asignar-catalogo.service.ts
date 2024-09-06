import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsignarCatalogo } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { AsignarCatalogoFull } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignarCatalogoService {
  private apiUrl = environment.asignarCatalogoApiUrl; // Utiliza la URL específica para los endpoints de AsignarCatalogo

  constructor(private http: HttpClient) { }

  getAsignarCatalogos(): Observable<AsignarCatalogo[]> {
    return this.http.get<AsignarCatalogo[]>(this.apiUrl);
  }

  getAsignarCatalogoById(id: string): Observable<AsignarCatalogo> {
    return this.http.get<AsignarCatalogo>(`${this.apiUrl}${id}`);
  }

  createAsignarCatalogo(asignarCatalogo: AsignarCatalogo): Observable<AsignarCatalogo> {
    return this.http.post<AsignarCatalogo>(this.apiUrl, asignarCatalogo);
  }

  updateAsignarCatalogo(id: string, asignarCatalogo: AsignarCatalogo): Observable<AsignarCatalogo> {
    return this.http.put<AsignarCatalogo>(`${this.apiUrl}${id}`, asignarCatalogo);
  }

  deleteAsignarCatalogo(id: string,idCatalogo : string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}/${idCatalogo}`, { responseType: 'text' });
  }

  getAsignarCatalogoByCataCodi(cataCodi: string): Observable<AsignarCatalogo[]> {
    return this.http.get<AsignarCatalogo[]>(`${this.apiUrl}cata/${cataCodi}`);
  }

  getAsignarCatalogoByUsunCodi(usunCodi: string): Observable<AsignarCatalogo[]> {
    return this.http.get<AsignarCatalogo[]>(`${this.apiUrl}usun/${usunCodi}`);
  }

  getAsignarCatalogoByCodi(codi: string): Observable<AsignarCatalogo[]> {
    return this.http.get<AsignarCatalogo[]>(`${this.apiUrl}codi/${codi}`);
  }
  getCatalogoFull(): Observable<AsignarCatalogoFull[]> {
    return this.http.get<AsignarCatalogoFull[]>(`${this.apiUrl}catalogo/Full`);
  }
}
