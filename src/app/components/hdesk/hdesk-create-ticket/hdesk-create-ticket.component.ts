import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { SequenceService } from 'src/app/services/sequence.service';
import { Ticket } from 'src/app/interfaces/ticket';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserSearchDialogComponent } from '../../shared/user-search-dialog/user-search-dialog.component';
import { AssignDialogComponent } from '../../shared/assign-dialog/assign-dialog.component';
import { ViaRecepcionService } from 'src/app/services/selects/ViaRecepcion/via-recepcion.service';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { FileUploadResponse } from 'src/app/interfaces/FileUploafResponse';
import { AdjuntoInfo } from 'src/app/interfaces/AdjuntoInfo';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { CatalogoDialogComponent } from '../../shared/catalogo-dialog/catalogo-dialog.component';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { AsignarTicketService } from 'src/app/services/Assign/asignar-ticket.service';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { RegistrarTareasService } from 'src/app/services/RegistrarTareas/registrar-tareas.service';

import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-hdesk-create-ticket',
  templateUrl: './hdesk-create-ticket.component.html',
  styleUrls: ['./hdesk-create-ticket.component.css'],
})
export class HdeskCreateTicketComponent implements OnInit {
  @ViewChild('ticketForm') ticketForm!: NgForm;
  searchTerms = new Subject<string>();
  searchTermsORGN = new Subject<string>();
  searchQueryORGN = '';
  searchQuery = '';
  selectedUsers: { [cateCodi: string]: Usuarios[] } = {};
  loading: boolean = false;
  unidCodiFlag = '';

  public editorInstance: Quill | null = null;
  descEditor: string = '';
  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  public Editor: any = ClassicEditor;
  public ticket: Ticket = {
    id: '',
    ticketID: '',
    idUsuario: '',
    unidCodi: '1',
    nombre: '',
    asunto: '',
    descripcion: '',
    organizacion: '',
    tipologia: '',
    viaRecepcion: '',
    prioridad: '',
    idUsuarioAdd: '',
    fechaActividad: '',
    fechaCierre: '',
    fechaCreacion: '',
    catalogo: '',
    mensaje_final: '',
    estado: 'Recibido',
    ind_estado_adjunto: '',
    idUsuario_adjunto: '',
    cate_codi_asignar: [],
    url_adjunto:'',
    idUsuario_asignar: '',
    adjuntos: [],
  };

  organizaciones: Organizacion[] = [];
  categorias: Categoria[] = [];
  prioridades: Prioridad[] = [];
  tipologias: Tipologia[] = [];
  vias: viaRecepcion[] = [];
  selectedUnidad: string = "";
  selectedFiles: File[] = [];
  catalogos: Catalogo[] = [];
  userDetail: UserDetail | null = null;
  selectedTasks: { [cateCodi: string]: any[] } = {};

  n1Options: any[] = [];
  n2Options: any[] = [];
  n3Options: any[] = [];

  catalogPath: string = '';

  constructor(
    private ticketService: TicketService,
    private matIconRegistry: MatIconRegistry,
    private viarecepcionService: ViaRecepcionService,
    private categoriaService: CategoriaService,
    private organizacionService: OrganizacionService,
    private prioridadService: PrioridadService,
    private tipologiaService: TipologiaService,
    private sequenceService: SequenceService,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private catalogoService: CatalogoService,
    private asignarTicketService: AsignarTicketService,
    private asignacionService: AsignacionService,
    private registrarTareasService: RegistrarTareasService,
    private snackBar: MatSnackBar,
    private unidadService: UnidadService
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unidadService.unidadSeleccionada$.subscribe(unidCodi => {
        this.unidCodiFlag = unidCodi !== 'Seleccione' ? unidCodi : this.userDetail?.unid_codi || '';
        this.cargarVias();
        this.cargarPrioridad();
        this.cargarTipologia();
        this.cargarCategorias();
    });

    this.cargarOrganizaciones();
    this.loadCatalogos();
    this.initializeSearch();
    this.initializeSearchORGN();

    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      });
    });
}

  handleCatalogChange(catalogId: string): void {
    this.loadCatalogHierarchy(catalogId);
    // Aquí puedes añadir más lógica que necesites ejecutar cuando cambie el catálogo
  }

  loadCatalogHierarchy(catalogId: string): void {
    if (!catalogId) return;
    this.catalogPath = ''; // Limpiar el camino actual
    this.appendCatalogParent(catalogId);
  }

  appendCatalogParent(catalogId: string): void {
    if (!catalogId) {
      return;
    }

    this.catalogoService.getCatalogoByCodi(catalogId).subscribe({
      next: (catalogo) => {
        // Comprobar si el id del catálogo es 1 y, en ese caso, no agregarlo a la ruta
        if (catalogo.codi !== '1') {
          this.catalogPath = ` > ${catalogo.nombre}` + this.catalogPath;
        }
        // Continuar con el padre solo si este existe y no es el id 1
        if (catalogo.padre && catalogo.padre !== '1') {
          this.appendCatalogParent(catalogo.padre);
        }
      },
      error: (error) => console.error('Error al cargar la jerarquía del catálogo:', error)
    });
  }

  initializeSearch() {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
          return term === ''
            ? this.catalogoService.getCatalogosActivos()
            : this.catalogoService.searchCatalogo(term);
        })
      )
      .subscribe({
        next: (results) => {
          this.catalogos = results;
          if (results.length === 0) {
            this.snackBar.open('No hay catalogo con el nombre ingresado.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['mat-toolbar', 'mat-warn']
            });
          }
        },
        error: (error) => {
          console.error('Error en la búsqueda de catálogo:', error);
          this.snackBar.open('Error en la búsqueda de catálogo.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  initializeSearchORGN() {
    this.searchTermsORGN
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termORGN: string) => {
          return termORGN === ''
            ? this.organizacionService.getOrganizacionActivos()
            : this.organizacionService.searchOrganizacion(termORGN);
        })
      )
      .subscribe({
        next: (results) => {
          this.organizaciones = results;
          if (results.length === 0) {
            this.snackBar.open('No hay organización con el nombre ingresado.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['mat-toolbar', 'mat-warn']
            });
          }
        },
        error: (error) => {
          console.error('Error en la búsqueda de organización:', error);
          this.snackBar.open('Error en la búsqueda de organización.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      });
  }

  searchORGN(termORGN: string): void {
    this.searchTermsORGN.next(termORGN);
  }

  loadCatalogos() {
    this.catalogoService.getCatalogosActivos().subscribe({
      next: (data) => {
        this.catalogos = data;
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los catalogos', error);
        }
      }
    });
  }

  buscarUsuarioPorId(): void {
    // Rellena el ID de usuario con ceros al principio si es necesario
    this.ticket.idUsuario = this.ticket.idUsuario.padStart(9, '0');

    this.usuariosService.getUsuariosById(this.ticket.idUsuario).subscribe({
      next: (usuarios: Usuarios[]) => {
        if (usuarios.length > 0) {
          this.ticket.nombre = usuarios[0].nombre_completo;
        }
      },
      error: (err) => console.error(err)
    });
  }

  setFechaHora(): string {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Lima'
    });

    const hora = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
      hour12: true
    });

    return `${fecha} - ${hora}`;
  }

  openUserSearchDialog() {
    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ticket.idUsuario = result.idUsuario;
        this.ticket.nombre = result.nombre_completo; // Asumiendo que result es del tipo Usuarios
      }
    });
  }

  openCatalogo() {
    const dialogRef = this.dialog.open(CatalogoDialogComponent, {
      width: '1200px',
      height: '800px'
    });
  
    this.searchQuery = '';
    this.search('');
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { catalogo, usuarios } = result;
        this.ticket.catalogo = catalogo.codi;
        this.handleCatalogChange(this.ticket.catalogo);
  
        // Usar `this.ticket.catalogo` como clave común
        if (!this.selectedUsers[this.ticket.catalogo]) {
          this.selectedUsers[this.ticket.catalogo] = [];
        }
        usuarios.forEach((usuario: Usuarios) => {
          if (!this.selectedUsers[this.ticket.catalogo].some(u => u.idUsuario === usuario.idUsuario)) {
            this.selectedUsers[this.ticket.catalogo].push(usuario);
          }
        });
      }
    });
  }
  
  openAssignDialog() {
    const dialogRef = this.dialog.open(AssignDialogComponent, {
      width: '500px',
      data: { coordinaciones: this.ticket.cate_codi_asignar, userDetail: this.userDetail }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Usuarios seleccionados:', result);
        Object.keys(result.selectedUsers).forEach(cateCodi => {
          // Usar `cateCodi` directamente
          if (!this.selectedUsers[cateCodi]) {
            this.selectedUsers[cateCodi] = [];
          }
          result.selectedUsers[cateCodi].forEach((user: Usuarios) => {
            if (!this.selectedUsers[cateCodi].some(u => u.idUsuario === user.idUsuario)) {
              this.selectedUsers[cateCodi].push(user);
            }
          });
        });
  
        Object.keys(result.selectedTasks).forEach(cateCodi => {
          if (!this.selectedTasks[cateCodi]) {
            this.selectedTasks[cateCodi] = [];
          }
          result.selectedTasks[cateCodi].forEach((task: any) => {
            if (!this.selectedTasks[cateCodi].some(t => t.user.idUsuario === task.user.idUsuario)) {
              this.selectedTasks[cateCodi].push(task);
            }
          });
        });
      } else {
        console.log('No se seleccionaron usuarios.');
      }
    });
  }
  

  removeAssignedUser(user: Usuarios, cateCodi: string): void {
    const index = this.selectedUsers[cateCodi].indexOf(user);
    if (index > -1) {
      this.selectedUsers[cateCodi].splice(index, 1);
    }
    // Eliminar también si es del catálogo
    if (cateCodi === this.ticket.catalogo && index > -1) {
      this.selectedUsers[cateCodi].splice(index, 1);
    }
  }
  
  manejarErrorImagen(usuario: Usuarios): void {
    if (usuario.fotoUsuario) {
      if (usuario.fotoUsuario.includes('/f1/')) {
        usuario.fotoUsuario = `https://static.upao.edu.pe/upload/f/${usuario.idUsuario}.jpg`;
      } else if (usuario.fotoUsuario.includes('/f/')) {
        usuario.fotoUsuario = 'assets/UserSinFoto.svg';
      }
    } else {
      usuario.fotoUsuario = 'assets/UserSinFoto.svg';
    }
  }

  cargarOrganizaciones(): void {
    this.organizacionService.getOrganizaciones().subscribe({
      next: (data) => {
        this.organizaciones = data;
      },
      error: (error) => console.error('Error al obtener organizaciones', error)
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategoriasByUnidCodi(this.unidCodiFlag).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => console.error('Error al obtener categorías', error)
    });
  }

  cargarVias(): void {
    this.viarecepcionService.getViasByUnidCodi(this.unidCodiFlag).subscribe({
        next: (data) => {
            this.vias = data;
        },
        error: (error) => console.error('Error al obtener las Vias de Recepcion', error)
    });
}

cargarPrioridad(): void {
    this.prioridadService.getPrioridadByUnidCodi(this.unidCodiFlag).subscribe({
        next: (data) => {
            this.prioridades = data;
            data.forEach((priority) => {
                if (priority.imagen) {
                    this.matIconRegistry.addSvgIcon(
                        `priority_${priority.codi}`,
                        this.domSanitizer.bypassSecurityTrustResourceUrl(priority.imagen)
                    );
                }
            });
        },
        error: (error) => console.error('Error al obtener prioridades', error)
    });
}

  cargarTipologia(): void {
    this.tipologiaService.getTipologiaByUnidCodi(this.unidCodiFlag).subscribe({
      next: (data) => {
        this.tipologias = data;
        data.forEach((tipologia) => {
          if (tipologia.imagen) {
            this.matIconRegistry.addSvgIcon(
              `tipologia_${tipologia.codi}`,
              this.domSanitizer.bypassSecurityTrustResourceUrl(tipologia.imagen)
            );
          }
        });
      },
      error: (error) => console.error('Error al obtener tipologias', error)
    });
  }

  createTicket(): void {
    const fechaYHora = this.setFechaHora();
    if (!this.ticketForm.valid) {
        this.snackBar.open('Faltan formularios por completar', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
        });
        return;
    }

    if (this.userDetail && this.userDetail.idUsuario) {
        this.ticket.idUsuarioAdd = this.userDetail.idUsuario;
        this.ticket.idUsuario_adjunto = this.userDetail.idUsuario;
        this.ticket.idUsuario_asignar = this.userDetail.idUsuario;
        this.ticket.fechaActividad = fechaYHora;
        this.ticket.fechaCreacion = fechaYHora;
        this.ticket.ind_estado_adjunto = 'A';

        // Asignar unidCodi basado en el flag determinado
        this.ticket.unidCodi = this.unidCodiFlag;

    } else {
        console.error('No hay usuario actual');
        return;
    }

    this.ticket.descripcion = this.ticket.descripcion;
    this.loading = true; // Iniciar el spinner de carga

    if (this.selectedFiles.length > 0) {
        this.ticketService.uploadFiles(this.selectedFiles).subscribe(
            (uploadResponse: FileUploadResponse) => {
                if (uploadResponse && uploadResponse.files && uploadResponse.files.length > 0) {
                    this.ticket.adjuntos = uploadResponse.files.map((f) => {
                        return {
                            codi: f.sequence.toString(),
                            breq_codi: '',
                            desc: f.originalName,
                            peso_adjunto: f.sizeInBytes.toString(),
                            nombre: f.name,
                            url: f.url,
                            extension: f.extension,
                            ind_estado: this.ticket.ind_estado_adjunto,
                            n_descargas: '',
                            fechaActividad: fechaYHora,
                            idUsuario: ''
                        };
                    });
                }
                this.finalizeTicketCreation();
            },
            (error: any) => {
                console.error('Error al cargar archivos', error);
                this.loading = false; // Detener el spinner en caso de error
            }
        );
    } else {
        this.finalizeTicketCreation();
    }
}


  getPrioridadImageUrl(codi: string): string {
    const basePath = 'assets/prioridades/';
    return basePath + (codi ? `${codi}.png` : 'imagen_por_defecto.png');
  }

  onFileSelected(event: any): void {
    this.selectedFiles = [];
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        this.selectedFiles.push(file);
      }
    }
  }

  finalizeTicketCreation(): void {
    this.obtainNextSequenceNumber()
      .then((sequenceNumber) => {
        this.ticket.ticketID = sequenceNumber.toString();

        this.ticketService.createTicket(this.ticket).subscribe(
          (response) => {
            console.log('Ticket creado con éxito', response);
            this.snackBar.open('Ticket creado con éxito', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['mat-toolbar', 'mat-primary']
            });

            if (this.selectedUsers && this.selectedTasks) {
              this.createAsignarTicketsAndTasks(this.ticket.ticketID);
            } else {
              console.log('No hay usuarios o tareas seleccionados.');
            }

            this.router.navigate(['/menu/list-tickets']);
            this.loading = false; // Detener el spinner cuando se complete la creación
          },
          (error) => {
            console.error('Error al crear ticket', error);
            this.loading = false; // Detener el spinner en caso de error
          }
        );
      })
      .catch((error) => {
        console.error('Error al obtener el número de secuencia', error);
        this.loading = false; // Detener el spinner en caso de error
      });
  }

  obtainNextSequenceNumber(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.sequenceService.getNextTicketId().subscribe({
        next: (sequenceNumber) => {
          resolve(sequenceNumber);
        },
        error: (error) => {
          console.error('Error al obtener el número de secuencia', error);
          reject(error);
        }
      });
    });
  }

  createAsignarTicketsAndTasks(breqCodi: string) {
    Object.keys(this.selectedUsers).forEach((cateCodi) => {
      this.selectedUsers[cateCodi].forEach((user) => {
        const task = this.selectedTasks[cateCodi]?.find((t) => t.user === user);

        if (task) {
          const { nombreTarea, fechaVencimiento } = task;
          this.createTaskAndAssignUsers(user, cateCodi, nombreTarea, fechaVencimiento, breqCodi);
        }
      });
    });

    // Crear AsignarTickets y tareas para usuarios seleccionados desde el catálogo
    if (this.selectedUsers[this.ticket.catalogo]) {
      this.selectedUsers[this.ticket.catalogo].forEach((user) => {
        const nombreTarea = `Tarea para el usuario ${user.nombre}`;
        this.asignacionService.getAsignacionesByPIDM(user.pidm).subscribe((asignaciones) => {
          asignaciones.forEach((asignacion) => {
            const cateCodi = asignacion.cate_codi; // Obtener el cate_codi de la asignación
            this.createTaskAndAssignUsers(user, cateCodi!, nombreTarea, null, breqCodi);
          });
        });
      });
    }
  }

  createTaskAndAssignUsers(user: Usuarios, cateCodi: string, nombreTarea: string, fechaVencimiento: string | null, breqCodi: string) {
    const fechaActividad = this.setFechaHora();

    const fechaVencimientoFormatted = fechaVencimiento ? fechaVencimiento : '';

    this.sequenceService.getNextAsignarTicketId().subscribe((asignarTicketId) => {
      const nuevoAsignarTicket: AsignarTicket = {
        codi: asignarTicketId.toString(),
        breq_codi: breqCodi,
        klog_codi: '1',
        prog_codi: '1',
        cate_codi: cateCodi,
        fecha_inicio: '',
        fecha_fin: fechaVencimientoFormatted,
        nombre: nombreTarea,
        descripcion: '',
        fecha_actividad: fechaActividad,
        ind_estado: 'A',
        idUsuario: this.userDetail?.idUsuario || ''
      };

      this.asignarTicketService.createAsignarTicket(nuevoAsignarTicket).subscribe((response) => {
        console.log('AsignarTicket creado:', response);

        const nuevaRegistrarTareas: RegistrarTareas = {
          codi: '',
          ran1_codi: asignarTicketId.toString(),
          pidm: user.pidm,
          fechaActividad: fechaActividad,
          idUsuario: this.userDetail?.idUsuario || ''
        };

        this.registrarTareasService.createRegistrarTarea(nuevaRegistrarTareas).subscribe((registrarResponse) => {
          console.log('RegistrarTareas creado:', registrarResponse);
        });
      });
    });
  }

  showTipologia(): boolean {
    const ocultarTipologia = this.userDetail?.rols_codi === '3' && this.userDetail?.cate_codi === '1' && (this.userDetail?.cargo_codi === '5' || this.userDetail?.cargo_codi === '6');
    return !ocultarTipologia;
  }

  public setEditorInstance(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.descEditor = this.editorInstance!.root.innerHTML;
    });
  }

  public onEditorChange(event: any): void {
    const content = event.editor.root.innerHTML;
    this.ticket.descripcion = content;
  }
}
