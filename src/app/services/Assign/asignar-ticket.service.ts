import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { environment } from 'src/environments/environment';
import { switchMap, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { RegistrarTareasService } from '../RegistrarTareas/registrar-tareas.service';

@Injectable({
  providedIn: 'root'
})
export class AsignarTicketService {
  private apiUrl = environment.asignarTicketApiUrl; // Ajusta la URL base según tu configuración

  constructor(private http: HttpClient,
    private registrarTareasService : RegistrarTareasService
  ) { }

  getAsignarTickets(): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(this.apiUrl);
  }

  getAsignarTicketById(id: string): Observable<AsignarTicket> {
    return this.http.get<AsignarTicket>(`${this.apiUrl}/${id}`);
  }

  createAsignarTicket(asignarTicket: AsignarTicket): Observable<AsignarTicket> {
    return this.http.post<AsignarTicket>(this.apiUrl, asignarTicket);
  }

  updateAsignarTicket(id: string, asignarTicket: AsignarTicket): Observable<AsignarTicket> {
    return this.http.put<AsignarTicket>(`${this.apiUrl}${id}`, asignarTicket);
  }

  updateAsignarTicketCodi(codi: string, asignarTicket: AsignarTicket): Observable<AsignarTicket> {
    return this.http.put<AsignarTicket>(`${this.apiUrl}only/${codi}`, asignarTicket);
  }

  deleteAsignarTicket(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getAsignarTicketByCodi(codi: string): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(`${this.apiUrl}codi/${codi}`);
  }

  getAsignarTicketByBreqCodi(breqCodi: string): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(`${this.apiUrl}breqCodi/${breqCodi}`);
  }

  getAsignarTicketsByCateCodi(cateCodi: string): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(`${this.apiUrl}cateCodi/${cateCodi}`);
  }

  getAsignarTicketByIdUsuario(idUsuario: string): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(`${this.apiUrl}usuario/${idUsuario}`);
  }
  
  getAsignarTicketsByBreqCodiAndCateCodi(breqCodi: string, cateCodi: string): Observable<AsignarTicket[]> {
    return this.http.get<AsignarTicket[]>(`${this.apiUrl}breqCodi/${breqCodi}/cateCodi/${cateCodi}`);
  }

  deleteAsignarTicketConTareas(id: string): Observable<void> {
    return this.registrarTareasService.getRegistrarTareasByRan1Codi(id).pipe(
        switchMap(tareas => {
            if (tareas.length > 0) {
                const deleteTasks$ = tareas.map(tarea => this.registrarTareasService.deleteRegistrarTarea(tarea.id!));
                return forkJoin(deleteTasks$).pipe(
                    switchMap(() => this.http.delete<void>(`${this.apiUrl}${id}`))
                );
            } else {
                // Si no hay tareas asociadas, simplemente elimina el AsignarTicket
                return this.http.delete<void>(`${this.apiUrl}${id}`);
            }
        }),
        catchError(error => {
            if (error.status === 404) {
                // Si no se encontraron tareas, igual elimina el AsignarTicket
                return this.http.delete<void>(`${this.apiUrl}${id}`);
            } else {
                console.error('Error al eliminar el AsignarTicket y sus tareas:', error);
                return of();
            }
        })
    );
}

}
