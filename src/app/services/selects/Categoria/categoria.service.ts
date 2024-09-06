import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../../../interfaces/selects/Categoria/categoria';
import { environment } from 'src/environments/environment';  // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = environment.categoriaApiUrl; // Utiliza la URL específica para los endpoints de Categoria

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getCategoriasByID(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}${id}`);
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  updateCategoria(id: string, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}${id}`, categoria);
  }

  deleteCategoria(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}${id}`, { responseType: 'text' });
  }

  getCategoriabyCodi(codi: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}name/${codi}`);
  }

  getCategoriasByIndServUser(indServUser: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}indServUser/${indServUser}`);
  }

  getCategoriasByPadreCodi(padreCodi: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}padreCodi/${padreCodi}`);
  }

  getCategoriasByEstado(estado: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}estado/${estado}`);
  }

  getCategoriasByUnidCodi(unidCodi: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}unidCodi/${unidCodi}`);
  }

  getCategoriasByCodigoBanner(codigoBanner: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}codigoBanner/${codigoBanner}`);
  }
}
