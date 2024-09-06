import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigUsuario } from 'src/app/interfaces/Config/configUsuario';
import { ConfigFull } from 'src/app/interfaces/Config/configUsuario';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class ConfigUsuariosService {
  private apiUrl = environment.configUsuarioApiUrl; // Utiliza la URL específica para los endpoints de ConfigUsuario

  constructor(private http: HttpClient) { }

  getConfigs(): Observable<ConfigUsuario[]> {
    return this.http.get<ConfigUsuario[]>(this.apiUrl);
  }

  getConfigsFull(): Observable<ConfigFull[]> {
    return this.http.get<ConfigFull[]>(`${this.apiUrl}full/user`);
  }

  getConfigsByID(id: string): Observable<ConfigUsuario> {
    return this.http.get<ConfigUsuario>(`${this.apiUrl}${id}`);
  }

  updateConfig(id: string, configUsuario: ConfigUsuario): Observable<ConfigUsuario> {
    return this.http.put<ConfigUsuario>(`${this.apiUrl}${id}`, configUsuario);
  }

  deleteConfig(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getConfigsById(id: string): Observable<ConfigUsuario[]> {
    return this.http.get<ConfigUsuario[]>(`${this.apiUrl}search/${id}`);
  }

  changePassword(userPidm: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}changePassword/${userPidm}`, { oldPassword, newPassword });
  }

  updatePasswordAsAdmin(pidm: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}changePasswordAdmin/${pidm}`, { newPassword });
  }
}
