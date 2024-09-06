import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViaRecepcionService {
  private apiUrl = environment.viaRecepcionApiUrl;

  constructor(private http: HttpClient) { }

  getVias(): Observable<viaRecepcion[]> {
    return this.http.get<viaRecepcion[]>(this.apiUrl);
  }

  getViaById(id: string): Observable<viaRecepcion> {
    return this.http.get<viaRecepcion>(`${this.apiUrl}${id}`);
  }

  getViasByCodi(codi: string): Observable<viaRecepcion[]> {
    return this.http.get<viaRecepcion[]>(`${this.apiUrl}codi/${codi}`);
  }

  getViasByUnidCodi(unidCodi: string): Observable<viaRecepcion[]> {
    return this.http.get<viaRecepcion[]>(`${this.apiUrl}unid_codi/${unidCodi}`);
  }

  getViasByDescripcion(descripcion: string): Observable<viaRecepcion[]> {
    return this.http.get<viaRecepcion[]>(`${this.apiUrl}descripcion/${descripcion}`);
  }

  getViasByIdUsuario(idUsuario: string): Observable<viaRecepcion[]> {
    return this.http.get<viaRecepcion[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }

  createVia(via: viaRecepcion): Observable<viaRecepcion> {
    return this.http.post<viaRecepcion>(this.apiUrl, via);
  }

  updateVia(id: string, via: viaRecepcion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, via);
  }

  deleteVia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}
