import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubTareas } from 'src/app/interfaces/SubTareas/SubTareas';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubTareasService {
  private apiUrl = environment.subTareasApiUrl;

  constructor(private http: HttpClient) { }

  getSubTareas(): Observable<SubTareas[]> {
    return this.http.get<SubTareas[]>(this.apiUrl);
  }

  getSubTareaById(id: string): Observable<SubTareas> {
    return this.http.get<SubTareas>(`${this.apiUrl}${id}`);
  }

  getSubTareasByRan1Codi(ran1Codi: string): Observable<SubTareas[]> {
    return this.http.get<SubTareas[]>(`${this.apiUrl}ran1_codi/${ran1Codi}`);
  }

  createSubTarea(subTarea: SubTareas): Observable<SubTareas> {
    return this.http.post<SubTareas>(this.apiUrl, subTarea);
  }

  updateSubTarea(id: string, subTarea: SubTareas): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, subTarea);
  }

  deleteSubTarea(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}
