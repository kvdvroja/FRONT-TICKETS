import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Responses } from 'src/app/interfaces/Responses/responses';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class ResponsesService {
  private apiUrl = environment.respuestaApiUrl; // Utiliza la URL específica para los endpoints de Respuesta

  constructor(private http: HttpClient) { }

  getResponses(): Observable<Responses[]> {
    return this.http.get<Responses[]>(this.apiUrl);
  }

  getResponsesByID(id: string): Observable<Responses> {
    return this.http.get<Responses>(`${this.apiUrl}${id}`);
  }

  createResponses(responses: Responses): Observable<Responses> {
    return this.http.post<Responses>(this.apiUrl, responses);
  }

  updateResponses(id: string, responses: Responses): Observable<Responses> {
    return this.http.put<Responses>(`${this.apiUrl}${id}`, responses);
  }

  deleteResponses(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getResponsesByTicketId(ticketId: string): Observable<Responses[]> {
    return this.http.get<Responses[]>(`${this.apiUrl}search/${ticketId}`);
  }

  createResponseWithAttachments(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}respuesta-con-adjunto`, formData);
  }

  deleteResponsesByTicketId(ticketId: string): Observable<string> {
    console.log(`Eliminando respuestas para el ticket con ID: ${ticketId}`);
    return this.http.delete<string>(`${this.apiUrl}ticket/${ticketId}`);
  }
}
