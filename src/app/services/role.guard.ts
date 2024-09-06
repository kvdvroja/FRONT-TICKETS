import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      console.log('No hay usuario autenticado, redirigiendo a /login');
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data['roles'] as Array<string>;
    const allowedCategories = route.data['categories'] as Array<string>;
    const allowedUserId = route.data['allowedUserId'] as string;
    const allowedCargos = route.data['cargos'] as Array<string>;

    // Verificar si el usuario tiene el ID permitido
    if (allowedUserId && user.idUsuario === allowedUserId) {
        console.log('El usuario tiene un ID permitido, acceso concedido');
        return true;
    }

    // Verificar si el usuario tiene un cargo permitido
    if (allowedCargos && allowedCargos.includes(user.cargo_codi!)) {
        console.log('El usuario tiene un cargo permitido, acceso concedido');
        return true;
    }

    const hasRole = allowedRoles ? allowedRoles.includes(user.rols_codi) : true;

    // Verificar si el usuario pertenece a una de las categorías permitidas
    const hasCategory = allowedCategories ? allowedCategories.includes(user.cate_codi) : true;

    if (hasRole || hasCategory) {
        return true;
    } else {
        console.log('El usuario no tiene permisos suficientes, redirigiendo a /unauthorized');
        this.router.navigate(['/unauthorized']);
        return false;
    }
  }
}
