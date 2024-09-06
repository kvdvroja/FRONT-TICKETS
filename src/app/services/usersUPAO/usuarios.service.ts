import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.usuariosApiUrl; // Utiliza la URL específica para los endpoints de Usuarios

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(this.apiUrl);
  }

  getUsuariosById(id: string): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.apiUrl}search/${id}`);
  }

  getUsuariosByName(nombre: string): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.apiUrl}search/name/${nombre}`);
  }

  // Nuevo método para buscar por pidm
  getUsuariosByPidm(pidm: string): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.apiUrl}search/pidm/${pidm}`);
  }

  getUsuariosByPidmList(pidms: string[]): Observable<Usuarios[]> {
    const pidmList = pidms.join(',');
    return this.http.get<Usuarios[]>(`${this.apiUrl}search/pidms/${pidmList}`);
  }
}
