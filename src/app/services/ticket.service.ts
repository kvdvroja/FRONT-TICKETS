import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../interfaces/ticket';
import { PaginatedResponse } from '../interfaces/paginatedResponse';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketUrl = environment.ticketApiUrl;
  private baseUrl = environment.apiBaseUrl; // URL específica para los tickets desde variables de entorno

  constructor(private http: HttpClient) {}

  // GET todos los tickets
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.ticketUrl);
  }

  // GET ticket por ID
  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketUrl}/${id}`);
  }

  // GET ticket por ticket ID
  getTicketByTicketId(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketUrl}/${ticketId}`);
  }

  getUniqueTicketByTicketId(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketUrl}/searchCodi/${ticketId}`);
  }

  // POST para crear un nuevo ticket
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.ticketUrl, ticket);
  }

  // PUT para actualizar un ticket
  updateTicket(id: string, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketUrl}/${id}`, ticket);
  }

  deleteTicket(id: string): Observable<string> {
    console.log(`Eliminando ticket con ID: ${id}`);
    return this.http.delete<string>(`${this.ticketUrl}/${id}`);
  }

  // DELETE para eliminar un ticket
  deleteTicketxTicketID(ticketId: string): Observable<string> {
    console.log(`Eliminando ticket con TicketID: ${ticketId}`);
    return this.http.delete<string>(`${this.ticketUrl}/ticketID/${ticketId}`);
  }

  // GET búsqueda de tickets por ID de ticket
  searchTicketsByTicketId(ticketId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.ticketUrl}/search/${ticketId}`);
  }

  // GET tickets por código de categoría asignada
  getTicketsByCateCodiAsignar(cateCodisAsignar: string[]): Observable<Ticket[]> {
    let params = new HttpParams();
    cateCodisAsignar.forEach(codi => {
      params = params.append('cateCodisAsignar', codi);
    });
    return this.http.get<Ticket[]>(this.ticketUrl, { params });
  }

  // GET tickets por categoría
  getTicketsByCategoria(categoriaId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.ticketUrl}/categoria/${categoriaId}`);
  }
  // Método modificado para enviar FormData en lugar de JSON puro
  // updateTicketFormData(id: string, formData: FormData): Observable<Ticket> {
  //   return this.http.put<Ticket>(`${this.ticketUrl}/${id}`, formData);
  // }

  updateTicketFormData(id: string, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketUrl}/${id}`, ticket);
  }

  searchTickets(searchTerm: string): Observable<Ticket[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<Ticket[]>(`${this.ticketUrl}/search`, { params });
  }

  searchTicketsWithFilters(
    searchTerm: string,
    selectedOrganizacion: string,
    selectedCategoria: string,
    selectedPrioridad: string,
    selectedEstado: string,
    selectedFechaInicio: Date | null,
    rolsCodi: string,
    cateCodi: string,
    pidm: string,
    aplicarFiltroPidm: string,
    unidCodi: string,
    currentPage: number,
    pageSize: number
  ): Observable<PaginatedResponse> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('selectedOrganizacion', selectedOrganizacion)
      .set('selectedCategoria', selectedCategoria)
      .set('selectedPrioridad', selectedPrioridad)
      .set('selectedEstado', selectedEstado)
      .set('selectedFechaInicio', selectedFechaInicio?.toISOString() ?? '')
      .set('rolsCodi', rolsCodi)
      .set('cateCodi', cateCodi)
      .set('pidm', pidm)
      .set('aplicarFiltroPidm', aplicarFiltroPidm)
      .set('unidCodi', unidCodi)
      .set('page', currentPage.toString())
      .set('pageSize', pageSize.toString());
  
      return this.http.get<PaginatedResponse>(`${this.ticketUrl}/searchWithFilters`, { params });
  }

  searchTicketsByTicketID(
    searchTerm: string,
    rolsCodi: string,
    cateCodi: string,
    pidm: string,
    unidCodi: string,
    aplicarFiltroPidm: string  // Incluir el parámetro aquí
): Observable<Ticket[]> {
    const params = new HttpParams()
        .set('searchTerm', searchTerm)
        .set('rolsCodi', rolsCodi)
        .set('cateCodi', cateCodi)
        .set('pidm', pidm)
        .set('unidCodi', unidCodi)
        .set('aplicarFiltroPidm', aplicarFiltroPidm);  // Incluir el parámetro aquí

    return this.http.get<Ticket[]>(`${this.ticketUrl}/searchByTicketID`, { params });
}

  
  
  
  getTicketsPaginado(page: number, pageSize: number, rolsCodi?: string, cateCodi?: string, unidCodi?: string): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (rolsCodi) {
        params = params.set('rolsCodi', rolsCodi);
    }
    if (cateCodi) {
        params = params.set('cateCodi', cateCodi);
    }
    if (unidCodi) {
        params = params.set('unidCodi', unidCodi);
    }
    
    return this.http.get<PaginatedResponse>(`${this.ticketUrl}/AllTickets`, { params });
}
  
getTicketsByCategoriesPaginado(categories: string[], page: number, pageSize: number, rolsCodi?: string, cateCodi?: string, unidCodi?: string): Observable<PaginatedResponse> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  
  if (rolsCodi) {
      params = params.set('rolsCodi', rolsCodi);
  }
  if (cateCodi) {
      params = params.set('cateCodi', cateCodi);
  }
  if (unidCodi) {
      params = params.set('unidCodi', unidCodi);
  }
  
  categories.forEach(cat => {
    params = params.append('categories', cat);
  });
  
  return this.http.get<PaginatedResponse>(`${this.ticketUrl}/ByCategories`, { params });
}

getTicketsByUsuarioAsignado(pidm: string, unidCodi?: string): Observable<Ticket[]> {
  let params = new HttpParams().set('pidm', pidm);
  if (unidCodi) {
    params = params.set('unidCodi', unidCodi);
  }
  return this.http.get<Ticket[]>(`${this.ticketUrl}/byUsuarioAsignado`, { params });
}
  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    return this.http.post(`${this.baseUrl}FileUpload`, formData);  // Verifica si esta URL es correcta según tu API
  }

  updateTicketEstado(id: string, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketUrl}/estado/${id}`, ticket);
  }

  updateTicketState(id: string, ticket: Ticket): Observable<void> {
    return this.http.put<void>(`${this.ticketUrl}/updateEstado/${id}`, ticket);
  }
  
  getTicketsByUsuarioAndCreadorWithPagination(pidm: string, idUsuarioAdd: string, unidCodi: string, page: number, pageSize: number): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('pidm', pidm)
      .set('idUsuarioAdd', idUsuarioAdd) // Aquí se usa idUsuarioAdd para obtener los tickets creados
      .set('unidCodi', unidCodi)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get<PaginatedResponse>(`${this.ticketUrl}/byUsuarioAndCreadorWithPagination`, { params });
  }
  
  
  
  

}
