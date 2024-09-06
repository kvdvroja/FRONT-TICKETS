import { Component, OnInit, ViewChild } from '@angular/core';
import { map, catchError, switchMap, forkJoin, of, EMPTY, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { ConfigUsuario } from 'src/app/interfaces/Config/configUsuario';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { Asignacion } from 'src/app/interfaces/Asignacion/Asignacion';
import { CargosService } from 'src/app/services/selects/Cargos/cargos.service';
import { Cargos } from 'src/app/interfaces/selects/Cargos/cargos';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { ExtendedConfigUsuario } from 'src/app/interfaces/Config/configUsuario';
import { UserLogin } from 'src/app/interfaces/Login/UserLogin';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CambiarClaveComponent } from '../../shared/cambiar-clave/cambiar-clave.component';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { AddConfigUserComponent } from '../add-config-user/add-config-user.component';
@Component({
  selector: 'app-config-user',
  templateUrl: './config-user.component.html',
  styleUrls: ['./config-user.component.css'],
})
export class ConfigUserComponent implements OnInit {
  @ViewChild('configUsuarioForm') configUsuarioForm!: NgForm;

  // Lógica para limpiar HTML
  limpiarHTML(contenidoHTML: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = contenidoHTML;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  // Propiedades del componente
  public configUsuario: ConfigUsuario = {
    id: '',
    codi: '',
    pidm: '',
    idUsuario: '',
    rols_codi: '',
    fechaActividad: '',
    fechaVigencia: '',
    ind_estado: '',
    unid_codi: '',
    password: '',
  };

  public asignacion: Asignacion = {
    id: '',
    codi: '',
    pidm: '',
    unid_codi: '',
    orgn_codi: '',
    cate_codi: '',
    carg_codi: '',
    nivel_atencion: '',
    fechaActividad: '',
    idUsuario: '',
  };

  isLoading: boolean = false;

  filteredConfigUsuario: ExtendedConfigUsuario[] = [];
  configsU: ConfigUsuario[] = [];
  userDetail: UserDetail | null = null;
  imagenUsuario: string = '';

  organizaciones: Organizacion[] = [];
  cargos: Cargos[] = [];
  categorias: Categoria[] = [];
  selectCargos: string = '';
  selectOrganizacion: string = '';
  selectCategoria: string = '';
  selectNivelAtencion: string = '';

  selectCargosE: string = '';
  selectOrganizacionE: string = '';
  selectCategoriaE: string = '';
  selectNivelAtencionE: string = '';

  inputId: string = '';
  userID: string ='';
  userName: string = '';
  userPidm: string = '';
  userRol: string = '';
  userEstado: string = '';
  userUnidad: string = '';
  userOrganizacion: string = '';
  userCategoria: string = 'Sin Categoria';
  userCargo: string = 'Sin Cargo';
  userNivelAtencion: string = '';
  userUnidCodi: string = '';

  flagCategoria: string = '';
  flagCargo: string = '';
  flagNivel: string = '';

  mostrarSinAsignar: boolean = false;
  mostrarAsignado: boolean = false;

  mostrarPanelUsuario: boolean = false;
  mostrarPanelUsuarioEditar: boolean = false;
  mostrarPanelUsuarioAsignar: boolean = false;
  mostrarListaUsuarios: boolean = true;
  mostrarAgregarUsuario: boolean = false;

  // Propiedades para el registro de nuevos usuarios
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

  constructor(
    private organizacionService: OrganizacionService,
    private categoriaService: CategoriaService,
    private configUsuariosService: ConfigUsuariosService,
    private cargosService: CargosService,
    private usuariosService: UsuariosService,
    private asignacionService: AsignacionService,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private unidadService: UnidadService
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();

    const unidCodi = this.unidadService.getUnidadSeleccionada() || this.userDetail?.unid_codi;
    if (unidCodi) {
      this.cargarCargos(unidCodi);
      this.cargarCategorias(unidCodi);
      this.ListarUsuarios(unidCodi);
    } else {
      console.error("No se pudo determinar el 'unid_codi' para cargar los datos.");
    }

    // Suscribirse a los cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unidCodi => {
      if (unidCodi && unidCodi !== 'Seleccione') {
        this.cargarCargos(unidCodi);
        this.cargarCategorias(unidCodi);
        this.ListarUsuarios(unidCodi);
      }
    });
  }

private initializeUserList(): void {
  const unidCodi = this.userDetail?.unid_codi || this.unidadService.getUnidadSeleccionada();
  if (unidCodi) {
      this.ListarUsuarios(unidCodi);
  } else {
      console.error("No se pudo determinar el 'unid_codi' para listar los usuarios.");
  }
}


ListarUsuarios(unidCodi: string): void {
  this.configUsuariosService.getConfigs().pipe(
    switchMap(configs => {
      this.configsU = configs;
      return forkJoin(
        configs.map(config =>
          this.usuariosService.getUsuariosById(config.idUsuario).pipe(
            map(users => users && users.length > 0 ? users[0] : undefined),
            catchError(() => of(undefined))
          )
        )
      );
    })
  ).subscribe(results => {
    // Filtramos los usuarios por `unid_codi`
    this.filteredConfigUsuario = this.configsU
      .map((config, index) => ({
        ...config,
        userData: results[index],
        userEstado: this.determineUserState(config),
      }))
      .filter(user => user.unid_codi === unidCodi); // Usamos `unidCodi` del selector o del `userDetail`
  }, error => {
    console.error('Error al obtener configuraciones de usuario', error);
  });
}
  
  determineUserState(config: ConfigUsuario): string {
    if (!config.rols_codi || config.rols_codi === '4' || config.rols_codi === 'Sin rol') {
      return 'Sin Asignar';
    } else {
      return 'Asignado';
    }
  }

  mostrarPanelAgregarUsuario(): void {
    const dialogRef = this.dialog.open(AddConfigUserComponent, {
        width: '400px',
        data: { registerData: this.registerData } // Envía los datos iniciales si es necesario
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            // Si es necesario, realiza alguna acción tras el cierre del modal
            this.refreshUserList();
        }
    });
}

onRegister(): void {
    // Valida las contraseñas antes de enviar los datos
    if (this.registerData.password !== this.confirmPassword) {
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
            console.log("Registro Exitoso para el usuario", userDetail.idUsuario);
            this.resetForms();
            this.refreshUserList();
        },
        error: (error) => {
            // Manejo de errores
        }
    });
}

private resetForms(): void {
    this.mostrarPanelUsuario = false;
    this.mostrarPanelUsuarioEditar = false;
    this.mostrarPanelUsuarioAsignar = false;
    this.mostrarListaUsuarios = true;
    this.mostrarAgregarUsuario = false;
}


private refreshUserList(): void {
  const unidCodi = this.unidadService.getUnidadSeleccionada() || this.userDetail?.unid_codi;
  if (unidCodi) {
      this.ListarUsuarios(unidCodi);
  } else {
      console.error("No se pudo determinar el 'unid_codi' para refrescar la lista de usuarios.");
  }
}


  //SELECTS

  cargarOrganizaciones(): void {
    this.organizacionService.getOrganizaciones().subscribe({
      next: (data) => {
        this.organizaciones = data;
      },
      error: (error) => console.error('Error al obtener organizaciones', error),
    });
  }

  cargarCargos(unidCodi: string): void {
    this.cargosService.getCargosByUnidCodi(unidCodi).subscribe({
      next: (data) => {
        this.cargos = data;
      },
      error: (error) => console.error('Error al obtener cargos', error),
    });
  }

  cargarCategorias(unidCodi: string): void {
    this.categoriaService.getCategoriasByUnidCodi(unidCodi).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => console.error('Error al obtener categorías', error),
    });
  }

  buscarUsuarioYMostrarImagen(): void {
    this.isLoading = true;
    if (!this.inputId || this.inputId.trim().length === 0) {
        alert('Por favor, ingrese un ID válido.');
        this.isLoading = false;
        return; 
    }

    this.configUsuariosService.getConfigsById(this.inputId).subscribe({
        next: (configs) => {
            if (configs && configs.length > 0) {
                this.imagenUsuario = this.obtenerUrlImagen(this.inputId, 1);
                this.infoConfiguracion();
            } else {
                alert('El usuario ingresado no está registrado.');
                this.mostrarPanelUsuario = false;
            }
            this.isLoading = false;
        },
        error: (error) => {
            console.error('Error al buscar el usuario:', error);
            alert('Ocurrió un error al buscar el usuario.');
            this.mostrarListaUsuarios = true;
            this.mostrarPanelUsuario = false;
            this.isLoading = false;
        },
    });

    this.mostrarPanelUsuarioAsignar = false;
    this.mostrarPanelUsuarioEditar = false;
    this.mostrarListaUsuarios = false;
}

  obtenerUrlImagen(idUsuario: string, intento: number): string {
    if (intento === 1) {
      return `https://static.upao.edu.pe/upload/f1/${idUsuario}.jpg`;
    } else {
      return `https://static.upao.edu.pe/upload/f/${idUsuario}.jpg`;
    }
  }

  manejarErrorImagen(): void {
    if (this.imagenUsuario) {
      if (this.imagenUsuario.includes('/f1/')) {
        this.imagenUsuario = `https://static.upao.edu.pe/upload/f/${this.inputId}.jpg`;
      } else if (this.imagenUsuario.includes('/f/')) {
        this.imagenUsuario = 'assets/UserSinFoto.svg';
      }
    } else {
      this.imagenUsuario = 'assets/UserSinFoto.svg';
    }
  }

  infoConfiguracion(): void {
    if (!this.inputId) {
        console.error('userId no está definido');
        return;
    }

    this.userCategoria = 'Sin Categoría';
    this.userID = this.inputId;
    this.userCargo = 'Sin Cargo';
    this.userEstado = '';
    this.userUnidad = '';
    this.userPidm = '';
    this.userRol = '';
    this.userNivelAtencion = '';

    this.usuariosService.getUsuariosById(this.inputId)
        .pipe(
            switchMap((usuarios: Usuarios[]) => {
                if (usuarios.length > 0) {
                    this.userName = usuarios[0].nombre_completo;
                    this.userPidm = usuarios[0].pidm;
                    
                    // Almacenar userPidm en localStorage
                    localStorage.setItem('userPidm', this.userPidm);

                    return forkJoin({
                        infoConfig: this.configUsuariosService.getConfigsById(this.userID).pipe(catchError(() => of([]))),
                        infoAsign: this.asignacionService.getAsignacionesByExactPIDM(this.userPidm).pipe(catchError(() => of([]))),
                    });
                } else {
                    return throwError(() => new Error('No se encontraron usuarios'));
                }
            }),
            catchError((error) => {
                console.error('Error al obtener información del usuario:', error);
                return EMPTY;
            })
        )
        .subscribe({
            next: ({ infoConfig, infoAsign }) => {
                if (infoConfig.length > 0) {
                    this.userEstado = infoConfig[0].rols_codi;
                    this.userUnidad = infoConfig[0].unid_codi;
                    this.userRol = infoConfig[0].rols_codi;
                    if (['1'].includes(this.userEstado) && this.userDetail?.rols_codi == '2') {
                      if(this.userID == this.userDetail.idUsuario){
                        this.userEstado = infoConfig[0].rols_codi;
                      }
                      else{
                        this.mostrarPanelUsuarioEditar = false;
                        this.mostrarPanelUsuarioAsignar = false;
                        this.mostrarPanelUsuario = false;
                        alert('No se pueden configurar permisos para este usuario.');
                        return;
                      }
                    }
                    if(['2'].includes(this.userEstado) && this.userDetail?.rols_codi == '2'){
                      if(this.userID == this.userDetail.idUsuario){
                        this.userEstado = infoConfig[0].rols_codi;
                      }
                      else{
                        this.mostrarPanelUsuarioEditar = false;
                        this.mostrarPanelUsuarioAsignar = false;
                        this.mostrarPanelUsuario = false;
                        alert('No se pueden configurar permisos para este usuario.');
                        return;
                      }
                    }
                } else {
                    this.userEstado = '4';
                }

                if (infoAsign.length > 0) {
                    this.mostrarPanelUsuario = true;
                    this.selectCargosE = infoAsign[0].carg_codi;
                    this.selectCategoriaE = infoAsign[0].cate_codi;
                    this.selectNivelAtencionE = infoAsign[0].nivel_atencion!;
                } else {
                    this.mostrarPanelUsuario = false;
                }

                if (infoAsign && infoAsign.length > 0) {
                    this.flagCategoria = infoAsign[0].cate_codi;
                    this.flagCargo = infoAsign[0].carg_codi;
                    this.userNivelAtencion = infoAsign[0].nivel_atencion!;

                    this.categoriaService
                        .getCategoriabyCodi(this.flagCategoria)
                        .subscribe({
                            next: (categoria: Categoria) => {
                                this.userCategoria = categoria.descripcion;
                            },
                            error: (err) => console.error(err),
                        });

                    this.cargosService.getCargosbyCodi(this.flagCargo).subscribe({
                        next: (cargos: Cargos) => {
                            this.userCargo = cargos.descripcion;
                        },
                        error: (err) => console.error(err),
                    });
                } else {
                    this.userCategoria = 'Sin Categoría';
                    this.userCargo = 'Sin Cargo';
                }

                if (this.userEstado === '4' || !this.userEstado || this.userEstado === 'Sin rol') {
                    this.mostrarPanelUsuario = true;
                    this.mostrarPanelUsuarioAsignar = true;
                    this.mostrarPanelUsuarioEditar = false;
                    this.mostrarSinAsignar = true;
                    this.mostrarAsignado = false;
                } else {
                    this.mostrarPanelUsuario = true;
                    this.mostrarPanelUsuarioEditar = true;
                    this.mostrarPanelUsuarioAsignar = false;
                    this.mostrarSinAsignar = false;
                    this.mostrarAsignado = true;
                }
            },
            error: (error) => console.error('Error al procesar la información del usuario:', error),
        });
}

  editarAsignado(): void {
    console.log("userID EN ASIGNADO: " + this.userID);
    console.log("inputID EN ASIGNADO: " + this.inputId);

    // Recuperar userPidm de localStorage
    this.userPidm = localStorage.getItem('userPidm') || '';

    console.log("PIDM EN ASIGNADO: " + this.userPidm);

    if (!this.userPidm) {
        console.error('this.userPidm no está definido o está vacío antes de la conversión.');
        return;
    }

    this.userPidm = this.userPidm.toString();
    console.log("PIDM convertido a cadena: " + this.userPidm);

    this.asignacionService.getAsignacionesByPIDM(this.userPidm).subscribe({
        next: (asigns) => {
            if (asigns && asigns.length > 0) {
                console.log("Asignaciones obtenidas:", asigns);
                console.log("Valores de pidm en las asignaciones:", asigns.map(asign => asign.pidm));
                console.log("Tipo de this.userPidm:", typeof this.userPidm);
                if (asigns.length > 0) {
                    console.log("Tipo de asign.pidm:", typeof asigns[0].pidm);
                }

                const asignacionCorrecta = asigns.find(asign => {
                    const asignPidm = asign.pidm.toString();
                    console.log(`Comparando asign.pidm (${asignPidm}) con this.userPidm (${localStorage.getItem('userPidm')})`);
                    return asignPidm === localStorage.getItem('userPidm');
                });
                console.log("ASIGNACION CORRECTA:", asignacionCorrecta);

                if (asignacionCorrecta) {
                    const asignId = asignacionCorrecta.id;
                    console.log("AsignId correcto: " + asignId);
                    this.actualizarAsignacion(asignId!, this.asignacion);

                    // Limpiar userPidm de localStorage
                    localStorage.removeItem('userPidm');
                } else {
                    console.error('No se encontraron configuraciones para este usuario.');
                }
            } else {
                console.error('No se encontraron configuraciones para este usuario.');
            }
        },
        error: (err) => {
            console.error('Error al obtener la configuración del usuario:', err);
        }
    });

    this.mostrarPanelUsuario = false;
    this.buscarUsuarioYMostrarImagen();
  }

  Asignar(): void {
    if (!this.inputId || !this.userDetail || !this.userDetail.idUsuario) {
        console.error('Información del usuario no está completamente definida.');
        return;
    }

    this.configUsuariosService.getConfigsById(this.inputId).subscribe({
        next: (configs) => {
            if (configs && configs.length > 0) {
                const configId = configs[0].id;
                this.userUnidCodi = configs[0].unid_codi; // Asegurarte de que se asigna aquí
                console.log('unid_codi asignado:', this.userUnidCodi); // Verifica que se esté asignando
                this.actualizarConfigUsuario(configId, this.configUsuario);

                // Crear nueva asignación después de que `userUnidCodi` esté asegurado
                const nuevaAsignacion: Asignacion = {
                    pidm: this.userPidm,
                    unid_codi: this.userUnidCodi,
                    orgn_codi: '1',
                    cate_codi: this.selectCategoria,
                    carg_codi: this.selectCargos,
                    nivel_atencion: this.selectNivelAtencion,
                    fechaActividad: this.formatFecha(new Date()),
                    idUsuario: this.userDetail!.idUsuario,
                };

                this.asignacionService.createAsignacion(nuevaAsignacion).subscribe({
                    next: (asignacionCreada) => {
                        console.log('Asignación creada con éxito:', asignacionCreada);
                    },
                    error: (errorAsignacion) => {
                        console.error('Error al crear la asignación', errorAsignacion);
                    },
                });

            } else {
                console.error('No se encontraron configuraciones para este usuario.');
            }
        },
        error: (err) => console.error('Error al asignar:', err),
    });

    // Limpiar userPidm de localStorage
    localStorage.removeItem('userPidm');

    this.mostrarPanelUsuario = false;
    this.buscarUsuarioYMostrarImagen();
}

  actualizarConfigUsuario(
    configId: string,
    configUsuario: ConfigUsuario
  ): void {
    this.configUsuario.rols_codi = '3';
    this.configUsuario.fechaActividad = this.formatFecha(new Date());
    this.configUsuario.id = configId;
    this.configUsuariosService.updateConfig(configId, configUsuario).subscribe({
      next: (responseConfig) => {
        console.log(
          'Configuración del usuario actualizada con éxito:',
          responseConfig
        );
      },
      error: (errorConfig) => {
        console.error(
          'Error al actualizar la configuración del usuario',
          errorConfig
        );
      },
    });
  }

  actualizarConfigUsuarioAdmin(configId: string, configUsuario: ConfigUsuario): void {
    this.configUsuario.rols_codi = '2';
    this.configUsuario.fechaActividad = this.formatFecha(new Date());
    this.configUsuario.id = configId;
    this.configUsuariosService.updateConfig(configId, configUsuario).subscribe({
      next: (responseConfig) => {
        this.snackbar.open('El usuario se convirtio en admin.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-primary']
        });
        console.log(
          'Configuración del usuario actualizada con éxito:',
          responseConfig
        );
      },
      error: (errorConfig) => {
        console.error(
          'Error al actualizar la configuración del usuario',
          errorConfig
        );
      },
    });
  }
  
  actualizarAsignacion(asignId: string, asignacion: Asignacion): void {
    this.asignacion.carg_codi = this.selectCargosE;
    this.asignacion.cate_codi = this.selectCategoriaE;
    this.asignacion.orgn_codi = "1";
    this.asignacion.nivel_atencion = String(this.selectNivelAtencionE);
    this.asignacion.fechaActividad = this.formatFecha(new Date());
    this.asignacion.id = asignId;
    console.log("ACTUALIZAR ASIGNACION: " + asignId);
    this.asignacionService.updateAsignacion(asignId, asignacion).subscribe({
      next: (responseAsign) => {
        console.log('Asignacion del usuario actualizada con éxito:', responseAsign);
      },
      error: (errorAsign) => {
        console.error('Error al actualizar la Asignacion del usuario', errorAsign);
      },
    });
  }

  private showError(message: string): void {
    alert(message);
  }

  hacerAdmin(): void{
    this.configUsuariosService.getConfigsById(this.inputId).subscribe({
      next: (configs) => {
        if (configs && configs.length > 0) {
          const configId = configs[0].id;
          this.actualizarConfigUsuarioAdmin(configId, this.configUsuario);
        } else {
          console.error('No se encontraron configuraciones para este usuario.');
        }
      },
      error: (err) =>
        console.error('Error al asignar:', err),
    });
  }

  hacerUsuario(): void{
    this.configUsuariosService.getConfigsById(this.inputId).subscribe({
      next: (configs) => {
        if (configs && configs.length > 0) {
          const configId = configs[0].id;
          this.actualizarConfigUsuario(configId, this.configUsuario);
        } else {
          console.error('No se encontraron configuraciones para este usuario.');
        }
      },
      error: (err) =>
        console.error('Error al asignar:', err),
    });
  }

  regresar(): void {
    this.mostrarPanelUsuario = false;
    this.mostrarPanelUsuarioEditar = false;
    this.mostrarPanelUsuarioAsignar = false;
    this.mostrarListaUsuarios = true;
    this.mostrarAgregarUsuario = false;

    const unidCodi = this.unidadService.getUnidadSeleccionada() || this.userDetail?.unid_codi;
    if (unidCodi) {
        this.ListarUsuarios(unidCodi);  // Pasar el `unidCodi` a `ListarUsuarios`
    }
}


  cambiarclave():void{
    const dialogRef = this.dialog.open(CambiarClaveComponent, {
      width: '500px',
      data: { pidm: this.userPidm}
    });
  
    dialogRef.afterClosed().subscribe(result => {
     
    });

  }

  private formatFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const periodo = hora >= 12 ? 'p. m.' : 'a. m.';
    const horaFormato12 = hora % 12 || 12;
  
    return `${dia}/${mes}/${anio} - ${horaFormato12}:${minuto} ${periodo}`;
  }

  
  
}
