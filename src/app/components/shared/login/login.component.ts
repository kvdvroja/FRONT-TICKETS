import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { Router } from '@angular/router';
import { ApiSSOService } from 'src/app/services/SSO/apissoservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    // this.ingresarSSO('');
  }

  onLogin(): void {
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

  // async  ingresarSSO(rol :string) {
    
  //   const parametros = {
  //     code: '+uijn7BO5SJKMZdKEE5ay6h+mOMUMRPNamRRVlr5toU=',
  //     client_id: 'canvas_2345',
  //     client_secret: 'aXQnc2FzZWNyZXRmb3JjYW52YXN1cGFvMjAyMw==',
  //     redirect_uri:
  //       'https%3a%2f%2fsso.beta.canvaslms.com%2flogin%2foauth2%2fcallback',
  //     grant_type: 'authorization_code',
  //     refresh_token: '15000',
  //   };
  
  //   this.apissoService.postSSOToken(parametros).subscribe({
  //    next: response => {
  //      console.log(response);
  //      this.token_access = response.access_token;


  //      if ((<any>response).status == 200) {
  //        console.log(200);
  //        this.resp = response;


  //      }
  //      if ((<any>response).success == '2') {
  //        //         this.msgDatosPer = "Experiencia Laboral no registrada.";
  //      }
  //    },
  //    complete: () => {
  //      this.loginWithCanvas(this.token_access, rol);
  //    },

  //    error: err => { console.error('ERR Error en la solicitud HTTP:', err); }
  //  })

  // } 

  // async loginWithCanvas(token: string, rol: string) {
  //   const clientId = 'canvas_2345';
  //   const redirectUri = encodeURIComponent('http://localhost:4200/Login/');
  //   const responseType = 'code';
  //   const scope = 'openid';
  //   const state = token; // Reemplazar con el token obtenido de la API
  //   const authUrl = `client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

  //   const urlApiSSO2 = "http://localhost:7681/Account/Login?"

  //   localStorage.setItem("ROL", rol);

  //   window.location.href = urlApiSSO2 + authUrl;
  // }

  
}
