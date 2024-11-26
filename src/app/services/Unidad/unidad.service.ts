import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Unidad } from '../../interfaces/Unidad/unidad';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadService {
  private apiUrl = environment.unidadApiUrl;

    // BehaviorSubject para manejar la unidad seleccionada
    private unidadSeleccionada = new BehaviorSubject<string>('');
  
    // Observable para que otros componentes puedan suscribirse a los cambios en la unidad seleccionada
    unidadSeleccionada$ = this.unidadSeleccionada.asObservable();
  
  constructor(private http: HttpClient) { }

  // Obtener todas las unidades
  getUnidades(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.apiUrl);
  }

  // Obtener una unidad por ID
  getUnidadById(id: string): Observable<Unidad> {
    return this.http.get<Unidad>(`${this.apiUrl}${id}`);
  }

  // Crear una nueva unidad
  createUnidad(unidad: Unidad): Observable<Unidad> {
    return this.http.post<Unidad>(this.apiUrl, unidad);
  }

  // Actualizar una unidad por ID
  updateUnidad(id: string, unidad: Unidad): Observable<Unidad> {
    return this.http.put<Unidad>(`${this.apiUrl}${id}`, unidad);
  }

  // Eliminar una unidad por ID
  deleteUnidad(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  // Obtener unidades por código
  getUnidadesByCodi(codi: string): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(`${this.apiUrl}codi/${codi}`);
  }

  setUnidadSeleccionada(unidad: string) {
    if (unidad && unidad !== 'Seleccione') {
      this.unidadSeleccionada.next(unidad);
      localStorage.setItem('unidadSeleccionada', unidad);  // Guarda en localStorage
    }
  }
  
  initializeUnidadSeleccionada(unid_codi: string) {
    //console.log("Inicializando unidad seleccionada con:", unid_codi);
    this.unidadSeleccionada.next(unid_codi);
    localStorage.setItem('unidadSeleccionada', unid_codi);  // Guarda en localStorage
  }
  
  getUnidadSeleccionada(): string {
    const unidad = this.unidadSeleccionada.value || localStorage.getItem('unidadSeleccionada');
    console.log("Valor actual de unidadSeleccionada:", unidad);
    return unidad || '';
  } 
}
