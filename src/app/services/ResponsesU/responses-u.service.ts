import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponsesU } from 'src/app/interfaces/Responses/responsesU';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta


@Injectable({
  providedIn: 'root'
})
export class ResponsesUService {
  private apiUrl = environment.respuestaUsuarioApiUrl; // Utiliza la URL específica para los endpoints de Respuesta

  constructor(private http: HttpClient) { }

  getResponses(): Observable<ResponsesU[]> {
    return this.http.get<ResponsesU[]>(this.apiUrl);
  }

  getResponsesByID(id: string): Observable<ResponsesU> {
    return this.http.get<ResponsesU>(`${this.apiUrl}${id}`);
  }

  createResponses(responses: ResponsesU): Observable<ResponsesU> {
    return this.http.post<ResponsesU>(this.apiUrl, responses);
  }

  updateResponses(id: string, responses: ResponsesU): Observable<ResponsesU> {
    return this.http.put<ResponsesU>(`${this.apiUrl}${id}`, responses);
  }

  deleteResponses(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getResponsesByTicketId(ticketId: string): Observable<ResponsesU[]> {
    return this.http.get<ResponsesU[]>(`${this.apiUrl}search/${ticketId}`);
  }

  createResponseWithAttachments(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}respuesta-con-adjunto`, formData);
  }

  deleteResponsesByTicketId(ticketId: string): Observable<string> {
    console.log(`Eliminando respuestas para el ticket con ID: ${ticketId}`);
    return this.http.delete<string>(`${this.apiUrl}ticket/${ticketId}`);
  }

}
