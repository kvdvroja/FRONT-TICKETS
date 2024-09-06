import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solucion } from 'src/app/interfaces/Solucion/Solucion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolucionService {
  private apiUrl = environment.solucionApiUrl;

  constructor(private http: HttpClient) { }

  getSoluciones(): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(this.apiUrl);
  }

  getSolucionById(id: string): Observable<Solucion> {
    return this.http.get<Solucion>(`${this.apiUrl}${id}`);
  }

  createSolucion(solucion: Solucion): Observable<Solucion> {
    return this.http.post<Solucion>(this.apiUrl, solucion);
  }

  updateSolucion(id: string, solucion: Solucion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, solucion);
  }

  deleteSolucion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSolucionesByCodi(codi: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/codi/${codi}`);
  }

  getSolucionesByRan1Codi(ran1Codi: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/ran1_codi/${ran1Codi}`);
  }

  getSolucionesByRan1Codi2(ran1Codi: string): Observable<Solucion> {
    return this.http.get<Solucion>(`${this.apiUrl}/ran1_codi2/${ran1Codi}`);
  }

  getSolucionesByDescripcion(descripcion: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/descripcion/${descripcion}`);
  }

  getSolucionesByNumRevision(numRevision: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/num_revision/${numRevision}`);
  }

  getSolucionesByPidm(pidm: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/pidm/${pidm}`);
  }

  getSolucionesByIndPaquete(indPaquete: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/ind_paquete/${indPaquete}`);
  }

  getSolucionesByIndScript(indScript: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/ind_script/${indScript}`);
  }

  getSolucionesByIndBd(indBd: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/ind_bd/${indBd}`);
  }

  getSolucionesByIndForma(indForma: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/ind_forma/${indForma}`);
  }

  getSolucionesByOtros(otros: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}/otros/${otros}`);
  }

  getSolucionesByModulo(modulo: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}modulo/${modulo}`);
  }

  getSolucionesByExtension(extension: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}extension/${extension}`);
  }

  getSolucionesByUrl(url: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}url/${url}`);
  }

  getSolucionesByFechaActividad(fechaActividad: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}fecha_actividad/${fechaActividad}`);
  }

  getSolucionesByIdUsuario(idUsuario: string): Observable<Solucion[]> {
    return this.http.get<Solucion[]>(`${this.apiUrl}id_usuario/${idUsuario}`);
  }
}
