import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: UserLogin = {
    id: '',
    codi: '',
    pidm: '',
    idUsuario: '',
    rols_codi: '4',
    fechaActividad: '',
    fechaVigencia: '',
    ind_estado: '',
    unid_codi: '',
    email: '',
    password: ''
  };
  
  confirmPassword: string = '';

  constructor(private authService: AuthService,private router: Router) {}

  onRegister(): void {
    if (this.registerData.password !== this.confirmPassword) {
      // Manejar error de contraseñas que no coinciden
      this.showError('Las contraseñas no coinciden.');
      return;
    }

    this.authService.register(this.registerData).pipe(
      catchError((error) => {
        this.showError(error.message);
        return throwError(() => new Error(error.message));
      })
    ).subscribe({
      next: (userDetail) => {
        this.router.navigate(['/login']);
        console.log("Registro Exitoso para el usuario", userDetail.idUsuario)
      },
      error: (error) => {
        // Ya se manejó el error en catchError
      }
    });
  }

  private showError(message: string): void {
    // Aquí puedes implementar cómo quieres mostrar los errores, por ejemplo, usando una alerta o un componente de notificación.
    alert(message);
  }
}
