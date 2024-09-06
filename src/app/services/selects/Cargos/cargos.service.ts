import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargos } from 'src/app/interfaces/selects/Cargos/cargos';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class CargosService {
  private apiUrl = environment.cargosApiUrl; // Utiliza la URL específica para los endpoints de Cargos

  constructor(private http: HttpClient) { }

  getCargos(): Observable<Cargos[]> {
    return this.http.get<Cargos[]>(this.apiUrl);
  }

  getCargosByID(id: string): Observable<Cargos> {
    return this.http.get<Cargos>(`${this.apiUrl}${id}`);
  }

  createCargos(cargos: Cargos): Observable<Cargos> {
    return this.http.post<Cargos>(this.apiUrl, cargos);
  }

  updateCargos(id: string, cargos: Cargos): Observable<Cargos> {
    return this.http.put<Cargos>(`${this.apiUrl}${id}`, cargos);
  }

  deleteCargos(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getCargosbyCodi(codi: string): Observable<Cargos> {
    return this.http.get<Cargos>(`${this.apiUrl}name/${codi}`);
  }

  getCargosByFechaActividad(fechaActividad: string): Observable<Cargos[]> {
    return this.http.get<Cargos[]>(`${this.apiUrl}fecha/${fechaActividad}`);
  }

  getCargosByEstado(indEstado: string): Observable<Cargos[]> {
    return this.http.get<Cargos[]>(`${this.apiUrl}estado/${indEstado}`);
  }

  getCargosByUnidCodi(unidCodi: string): Observable<Cargos[]> {
    return this.http.get<Cargos[]>(`${this.apiUrl}unidad/${unidCodi}`);
  }
}
