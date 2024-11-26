import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { Router } from '@angular/router';
import { ApiSSOService } from 'src/app/services/SSO/apissoservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: UserLogin = {
    idUsuario: '',
    password: '',
    id: '',
    codi: '',
    pidm: '',
    rols_codi: '',
    fechaActividad: '',
    fechaVigencia: '',
    ind_estado: '',
    unid_codi: '',
    email: ''
    // Asumiendo que no utilizas token aquí, pero si lo haces, puedes agregarlo también
    // token: ''
  };

  token_access: string = ''
  resp : any

  

  constructor(private authService: AuthService, private router: Router, private apissoService : ApiSSOService,private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.onLogin();
    // this.ingresarSSO('');
  }

  onLogin2(): void {
    this.authService.login(this.loginData).subscribe({
      next: (userDetail) => {
        //console.log('Inicio de sesión exitoso', userDetail);
        // No hay necesidad de actualizar los detalles del usuario después del inicio de sesión,
        // el backend ya ha manejado esto durante el proceso de autenticación.
        this.router.navigate(['/menu/inicio']); // Navega a donde necesites después del inicio de sesión
      },
      error: (loginError) => {
        console.error('Error de autenticación', loginError);
        this.snackBar.open(loginError.error.message || 'Error de autenticación', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });
  }

  register():void{
    this.router.navigate(['/register']);
  }

  onLogin() {
    this.llamarSSO();
  }

  async llamarSSO(){
      const clientId = environment.clientAdmi;
      const redirectUri = encodeURIComponent(environment.urlAngular + '/traer');
      const grant_type = 'authorization_code';
      const scope = 'openid';
      const responseType = 'code';
      const state = '';
      const authUrl = `client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
      const urlApiSSO2 = '/Account/Login?';
      window.location.href = environment.urlSSO + urlApiSSO2 + authUrl;
  }
  
}
