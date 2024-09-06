import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class TipologiaService {
  private apiUrl = environment.tipologiaApiUrl; // Utiliza la URL específica para los endpoints de Tipologia

  constructor(private http: HttpClient) { }

  getTipologia(): Observable<Tipologia[]> {
    return this.http.get<Tipologia[]>(this.apiUrl);
  }

  getTipologiaById(id: string): Observable<Tipologia> {
    return this.http.get<Tipologia>(`${this.apiUrl}${id}`);
  }

  getTipologiaByUnidCodi(unidCodi: string): Observable<Tipologia[]> {
    return this.http.get<Tipologia[]>(`${this.apiUrl}unidCodi/${unidCodi}`);
  }

  getTipologiaByIndEstado(indEstado: string): Observable<Tipologia[]> {
    return this.http.get<Tipologia[]>(`${this.apiUrl}estado/${indEstado}`);
  }

  getTipologiaByDescripcion(descripcion: string): Observable<Tipologia[]> {
    return this.http.get<Tipologia[]>(`${this.apiUrl}descripcion/${descripcion}`);
  }

  getTipologiaByCodigoBanner(codigoBanner: string): Observable<Tipologia[]> {
    return this.http.get<Tipologia[]>(`${this.apiUrl}codigoBanner/${codigoBanner}`);
  }

  createTipologia(tipologia: Tipologia): Observable<Tipologia> {
    return this.http.post<Tipologia>(this.apiUrl, tipologia);
  }

  updateTipologia(id: string, tipologia: Tipologia): Observable<Tipologia> {
    return this.http.put<Tipologia>(`${this.apiUrl}${id}`, tipologia);
  }

  deleteTipologia(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }
}
