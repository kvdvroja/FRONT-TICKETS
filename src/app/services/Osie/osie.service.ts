import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OsieUsers } from 'src/app/interfaces/Osie/osie-users';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class OsieService {
  private apiUrl = environment.osieApiUrl; // Utiliza la URL específica para los endpoints de Osie

  constructor(private http: HttpClient) { }

  getOsie(): Observable<OsieUsers[]> {
    return this.http.get<OsieUsers[]>(this.apiUrl);
  }
}
