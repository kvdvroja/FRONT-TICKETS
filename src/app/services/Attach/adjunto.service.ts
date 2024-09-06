import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdjuntoInfo } from 'src/app/interfaces/AdjuntoInfo';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta es correcta
import { FileUploadResponse } from 'src/app/interfaces/FileUploafResponse';

@Injectable({
  providedIn: 'root'
})
export class AdjuntoService {
  private baseUrl = environment.adjuntoApiUrl;
  constructor(private http: HttpClient) { }

  getAdjuntosByTicketId(ticketId: string): Observable<AdjuntoInfo[]> {
    return this.http.get<AdjuntoInfo[]>(`${this.baseUrl}${ticketId}/adjuntos`);
  }

  getAdjuntoById(id: string): Observable<AdjuntoInfo[]> {
    return this.http.get<AdjuntoInfo[]>(`${this.baseUrl}${id}`);
  }

  createAdjunto(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}upload`, formData);
  }

  updateAdjunto(id: string, adjunto: AdjuntoInfo[]): Observable<any> {
    return this.http.put(`${this.baseUrl}${id}`, adjunto);
  }

  deleteAdjunto(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}`);
  }

  getAdjuntosByRespuestaId(respuestaId: string): Observable<AdjuntoInfo[]> {
    return this.http.get<AdjuntoInfo[]>(`${this.baseUrl}respuesta/${respuestaId}/adjuntos`);
  }

  uploadFiles(files: File[]): Observable<FileUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    return this.http.post<FileUploadResponse>(`${this.baseUrl}FileUpload`, formData);
  }
}
