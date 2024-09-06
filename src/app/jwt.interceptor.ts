import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Obtener el token JWT del almacenamiento local o de donde lo tengas almacenado
        let token = localStorage.getItem('currentUserToken');
        
        if (token) {
            // Si el token existe, clonar la solicitud para agregarle el header de autorización
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            //console.log('JWT Token:', token);
        }
        
        // Pasar la solicitud modificada al siguiente manejador en la cadena
        return next.handle(request);
    }
}
