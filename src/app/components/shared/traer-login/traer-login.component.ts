import { ActivatedRoute } from '@angular/router';
import { Component,inject } from '@angular/core';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { TicketService } from 'src/app/services/ticket.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { JwtPayload } from 'src/app/interfaces/jwt-payload';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { JwtService } from 'src/app/services/jwt.service';
import { environment } from 'src/environments/environment';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-traer-login',
  templateUrl: './traer-login.component.html',
  styleUrls: ['./traer-login.component.css']
})
export class TraerLoginComponent {
  jwtService = inject(JwtService);
  id: string | null = null;
  loginData: UserLogin =  {
    idUsuario: '',
    password: '123',
    id: '',
    codi: '',
    pidm: '',
    rols_codi: '',
    fechaActividad: '',
    fechaVigencia: '',
    ind_estado: '',
    unid_codi: '',
    email: ''
  };
  constructor(
    private UsuariosService: UsuariosService,
    private TicketService: TicketService,
    private AuthService: AuthService,
    private CryptoService: CryptoService,
    private snackBar: MatSnackBar,
    private router: Router
  ){}
  usuarios: Usuarios | any = null;
  error: string = '';

  route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      const clientId = environment.clientAdmi;
      const redirectUri = '';
      const responseType = 'code';
      const client_secret = await this.jwtService.generarJWT(clientId);

      const parametros = {
        code: code,
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        client_secret: client_secret
      };
      this.AuthService.postToken(parametros).subscribe({
        next: async response => {
          if(response.success == 2000){
            const token = response.token.id_token
            const decodeToken = this.decodeToken(token);
            if(decodeToken){
              this.id = decodeToken.sub;
              let encryptedId = this.CryptoService.encrypt(decodeToken.sub);
              const jwtClient_Id = decodeToken.client_id;
              this.loginData.idUsuario = decodeToken.sub;
              this.AuthService.login(this.loginData).subscribe({
                next: (userDetail) => {
                  this.router.navigate(['/menu/inicio']);
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
          } else{
            let msg = response.error;
          }

        },
        complete: () => {
        },
        error: err => {
        }
      });
    });
  }
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
  // GetUsuario(idUsuario : string){
  //   this.UsuariosService.getUsuarioxId(idUsuario)
  //         .pipe(
  //           tap(usuario => {
  //             if (!usuario || Object.keys(usuario).length === 0) {
  //               this.error = 'No se encontró el usuario.';
  //               this.usuarios = null;
  //               this.AuthService.logout()
  //             }
  //           }),
  //           catchError(err => {
  //             this.error = 'Ocurrió un error al obtener el usuario.';
  //             console.error('Error al obtener usuario:', err);
  //             this.router.navigate(['/inicio']);
  //             this.AuthService.logout()
  //             return of(null);
  //           })
  //         )
  //         .subscribe(usuario => {
  //           if (usuario) {
  //             console.log(usuario)
  //             this.usuarios = usuario
  //             if(!usuario.COMUSER_URL_FOTO){
  //               this.ValidarFoto();
  //             }
  //             else{
  //               //this.router.navigate(['/inicio']);
  //               localStorage.setItem('usuario', JSON.stringify(this.usuarios));
  //             }
  //           }
  //         });
  // }
  // async ValidarFoto(){
  //   const imgUrl = 'https://static.upao.edu.pe/upload/f/' + this.usuarios.COMUSER_ID_USUARIO + '.jpg';
  //     await this.cargarImagen(imgUrl)
  //       .then((imagen) => {
  //         this.usuarios.COMUSER_URL_FOTO = imgUrl
  //         this.updateImage()
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //         this.usuarios.COMUSER_URL_FOTO = "https://static.upao.edu.pe/upload/f/sf.jpg"
  //         this.updateImage()
  //       });
  // }
  // updateImage(){
  //   this.UsuariosService.update(this.usuarios.Id,this.usuarios).subscribe({
  //     next: (data) => {
  //       localStorage.setItem('usuario', JSON.stringify(this.usuarios));
  //       //this.router.navigate(['/inicio']);
  //     },
  //     error: (error) => {
  //       localStorage.setItem('usuario', JSON.stringify(this.usuarios));
  //       //this.router.navigate(['/inicio']);
  //     }
  //   });
  // }
  cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img); // Resuelve la promesa cuando la imagen se ha cargado con éxito
      img.onerror = () => reject(new Error(`No se pudo cargar la imagen en la URL: ${url}`)); // Rechaza la promesa en caso de error
    });
  }
  private isValidHex(id: string): boolean {
    return /^[a-fA-F0-9]{32}$/.test(id);
  }

  // private loginTicket(): void {
  //   console.log("login tickets")
  //   this.TicketService.login(this.loginData).subscribe({
  //     next: (userDetail) => {
  //       localStorage.setItem('tokenTicket', userDetail.token);
  //     },
  //     error: (loginError) => {
  //       console.error('Error de autenticación', loginError);
  //     }
  //   });
  // }
  // private validateUserId(encryptedId: string): void {
    
  //     this.UsuariosService.validateId(encryptedId)
  //       .pipe(
  //         catchError(err => {
  //           this.error = 'Ocurrió un error al validar el ID del usuario.';
  //           console.error('Error al validar ID:', err);
  //           return of(null);
  //         })
  //       )
  //       .subscribe(response => {
  //         if (response && response.COMHTOK_TOKEN) {
  //           localStorage.setItem('token', response.COMHTOK_TOKEN);
  //           localStorage.setItem('refreshToken', response.COMHTOK_REFRESH_TOKEN);
  //           this.GetUsuario(encryptedId)
  //         } else {
  //           this.error = 'No se pudo obtener el token JWT.';
  //         }
  //       });
  //     }   
}
