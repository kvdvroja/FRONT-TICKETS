// catalogo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private catalogoUrl = environment.catalogoApiUrl;

  constructor(private http: HttpClient) { }

  createCatalogo(catalogo: Catalogo): Observable<Catalogo> {
    return this.http.post<Catalogo>(this.catalogoUrl, catalogo).pipe(
      catchError(this.handleError<Catalogo>('createCatalogo'))
    );
  }

  updateCatalogo(id: string, catalogo: Catalogo): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.catalogoUrl}${id}`, catalogo).pipe(
      catchError(this.handleError<Catalogo>('updateCatalogo'))
    );
  }

  deleteCatalogo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.catalogoUrl}${id}`).pipe(
      catchError(this.handleError<void>('deleteCatalogo'))
    );
  }
  getCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(this.catalogoUrl);
  }



  getCatalogosActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.catalogoUrl}active`).pipe(
      catchError(this.handleError<any[]>('getCatalogosActivos', []))
    );
  }

  getCatalogosFilter(): Observable<any[]> {
    return this.http.get<any[]>(`${this.catalogoUrl}filter`).pipe(
      catchError(this.handleError<any[]>('getCatalogosActivos', []))
    );
  }

  searchCatalogo(query: string): Observable<any[]> {
    const params = new HttpParams().set('nombre', query);
    return this.http.get<any[]>(`${this.catalogoUrl}search`, { params }).pipe(
      map((response: any[]) => response || []),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          // Retornar un arreglo vacío si no se encuentra nada
          return of<any[]>([]);
        } else {
          // Manejar otros errores
          console.error(`searchCatalogo failed: ${error.message}`);
          return of([]);
        }
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getCatalogoByID(id: string): Observable<any> {
    return this.http.get<any>(`${this.catalogoUrl}${id}`);
  }

  getCatalogoByCodi(codi: string): Observable<any> {
    return this.http.get<any>(`${this.catalogoUrl}codi/${codi}`);
  }
  getCatalogoNameByID(id: string): Observable<any> {
    return this.http.get<any>(`${this.catalogoUrl}name/${id}`);
  }
}
