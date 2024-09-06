import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class SequenceService {
  private apiUrl = environment.sequenceApiUrl;  // Usa la URL específica para los endpoints de Sequence desde las variables de entorno

  constructor(private http: HttpClient) { }

  getNextTicketId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}ticketId`);
  }

  getNextPrioridadId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}prioridadID`);
  }

  getNextCategoriaId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}categoriaID`);
  }

  getNextOrganizacionId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}organizacionID`);
  }

  getNextViaRecepcionId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}viaRecepcionID`);
  }

  getNextTipologiaId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}tipologiaID`);
  }

  getNextRespuestaId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}respuestaID`);
  }

  getNextAdjuntoId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}adjuntoID`);
  }

  getNextAsignarCategoriaId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}asignarCategoriaID`);
  }

  getNextAsignacionId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}asignacionID`);
  }

  getNextUserRegisterId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}userRegisterID`);
  }

  getNextCargoId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}cargoID`);
  }

  getNextCatalogoId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}catalogoID`);
  }

  getNextAsignarCatalogoId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}asignarCatalogoID`);
  }

  getNextAsignarTicketId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}asignarTicketID`);
  }

  getNextAsignarTareaId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}asignarTareaID`);
  }

  getNextAsignarCoordinacion(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}coordinacionID`);
  }

  getNextTrabajosId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}trabajosID`);
  }

  getNextProgresoId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}progresoID`);
  }

  getNextRegistrarTareasId(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}registrarTareaID`);
  }
}
