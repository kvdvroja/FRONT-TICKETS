import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { TicketService } from 'src/app/services/ticket.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { UserSearchDialogComponent } from '../../shared/user-search-dialog/user-search-dialog.component';
import { AssignDialogComponent } from '../../shared/assign-dialog/assign-dialog.component';
import { ViaRecepcionService } from 'src/app/services/selects/ViaRecepcion/via-recepcion.service';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { Ticket } from 'src/app/interfaces/ticket';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { AdjuntoInfo } from 'src/app/interfaces/AdjuntoInfo';
import { AdjuntoService } from 'src/app/services/Attach/adjunto.service';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { ResponsesService } from 'src/app/services/Responses/responses.service';
import { Responses } from 'src/app/interfaces/Responses/responses';
import { FileUploadResponse } from 'src/app/interfaces/FileUploafResponse';
import { AsignarTicketService } from 'src/app/services/Assign/asignar-ticket.service';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { CatalogoDialogComponent } from '../../shared/catalogo-dialog/catalogo-dialog.component';
import { SequenceService } from 'src/app/services/sequence.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { RegistrarTareasService } from 'src/app/services/RegistrarTareas/registrar-tareas.service';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { Location } from '@angular/common';

Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-hdesk-edit-list',
  templateUrl: './hdesk-edit-list.component.html',
  styleUrls: ['./hdesk-edit-list.component.css']
})
export class HdeskEditListComponent implements OnInit {
  searchTerms = new Subject<string>();
  searchQuery = '';
  searchTermsORGN = new Subject<string>();
  searchQueryORGN = '';

  public ticket: Ticket = {
    id: '',
    ticketID: '',
    idUsuario: '',
    unidCodi: '01',
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
    mensaje_final: '',
    catalogo:'',
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
  tipologias: Tipologia[] = [];
  vias: viaRecepcion[] = [];
  prioridades: Prioridad[] = [];
  selectedFiles: File[] = [];
  adjuntoinfo: AdjuntoInfo[] = [];
  catalogos: Catalogo[] = [];
  userDetail: UserDetail | null = null;
  catalogPath: string = '';
  unidCodiFlag = '';
  selectedUsers: { [cateCodi: string]: Usuarios[] } = {};
  selectedTasks: { [cateCodi: string]: any[] } = {};
  

  public editorInstance: Quill | null = null;
  descEditor: string = '';
  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  public nuevoHistorial: Historial = {
    codi: '',
    breq_codi: '',
    pidm: '',
    descripcion: '',
    tipo: '',
    fechaActividad: '',
    idUsuario: '', 
  };

  constructor(private ticketService: TicketService,
    private usuariosService: UsuariosService,
    private authservice : AuthService,
    private viarecepcionService: ViaRecepcionService,
    private categoriaService: CategoriaService,
    private sequenceService: SequenceService,
    private organizacionService: OrganizacionService,
    private prioridadService: PrioridadService,
    private asignarTicketService : AsignarTicketService,
    private tipologiaService : TipologiaService,
    private asignarCategoriaService: AsignarCategoriaService,
    private registrarTareasService : RegistrarTareasService,
    private matIconRegistry: MatIconRegistry,
    private adjuntoService: AdjuntoService,
    private domSanitizer: DomSanitizer,
    private respuestaService: ResponsesService,
    private route: ActivatedRoute,
    private asignacionService : AsignacionService,
    private dialog: MatDialog,
    private catalogoService: CatalogoService,
    private router: Router,
    private historialService : HistorialService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private unidadService: UnidadService,
    private location: Location
  ) {}

    ngOnInit() {
      document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        });
      });

      this.userDetail = this.authService.getCurrentUser();
      this.unidadService.unidadSeleccionada$.subscribe(unidCodi => {
          this.unidCodiFlag = unidCodi !== 'Seleccione' ? unidCodi : this.userDetail?.unid_codi || '';
          this.cargarVias();
          this.cargarPrioridad();
          this.cargarTipologia();
          this.cargarCategorias();
      });

      const ticketId = this.route.snapshot.paramMap.get('id');
      if (ticketId) {
        this.cargarOrganizaciones(),
        this.userDetail = this.authservice.getCurrentUser();
        this.ticketService.getTicketById(ticketId).subscribe(ticket => {
          this.ticket = {
            ...this.ticket,
            ...ticket,    
          };
          this.handleCatalogChange(ticket.catalogo);
          this.loadAdjuntos();
          this.loadCatalogos();
          this.asignarCategoriaService.getAsignacionCategoriaByBreq(this.ticket.ticketID.toString()).subscribe(asignaciones => {
            this.ticket.cate_codi_asignar = asignaciones.map(asignacion => asignacion.cate_codi);
          });
          this.initializeSearch();
          this.initializeSearchORGN();
          if (this.editorInstance) {
            this.editorInstance.root.innerHTML = this.ticket.descripcion;
          }
        });
        
      }
    }

    handleCatalogChange(catalogId: string): void {
      this.loadCatalogHierarchy(catalogId);
    }

    loadCatalogHierarchy(catalogId: string): void {
      if (!catalogId) return;
      this.catalogPath = '';  // Limpiar el camino actual
      this.appendCatalogParent(catalogId);
    }
    
    appendCatalogParent(catalogId: string): void {
      if (!catalogId) {
        return;
      }
    
      this.catalogoService.getCatalogoByCodi(catalogId).subscribe({
        next: (catalogo) => {
          if (catalogo.codi !== '1') {
            this.catalogPath = ` > ${catalogo.nombre}` + this.catalogPath;
          }
          if (catalogo.padre && catalogo.padre !== '1') {
            this.appendCatalogParent(catalogo.padre);
          }
        },
        error: (error) => console.error('Error al cargar la jerarquía del catálogo:', error)
      });
    }

    initializeSearch() {
      this.searchTerms.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
          return term === '' ? this.catalogoService.getCatalogosActivos() : this.catalogoService.searchCatalogo(term);
        })
      ).subscribe({
        next: results => {
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
        error: error => {
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

    openAssignDialog() {
      const dialogRef = this.dialog.open(AssignDialogComponent, {
        width: '500px',
        data: { coordinaciones: this.ticket.cate_codi_asignar, userDetail: this.userDetail }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Usuarios seleccionados:', result);
          Object.keys(result.selectedUsers).forEach(cateCodi => {
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
    
    openCatalogo() {
      const dialogRef = this.dialog.open(CatalogoDialogComponent, {
        width: '1200px',
        height: '800px'
      });
    
      this.searchQuery = '';
      this.search("");
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const { catalogo, usuarios } = result;
          this.ticket.catalogo = catalogo.codi;
          this.handleCatalogChange(this.ticket.catalogo);
    
          // Verificar si hay usuarios seleccionados antes de agregarlos
          if (usuarios && usuarios.length > 0) {
            if (!this.selectedUsers[this.ticket.catalogo]) {
              this.selectedUsers[this.ticket.catalogo] = [];
            }
            usuarios.forEach((usuario: Usuarios) => {
              if (!this.selectedUsers[this.ticket.catalogo].some(u => u.idUsuario === usuario.idUsuario)) {
                this.selectedUsers[this.ticket.catalogo].push(usuario);
              }
            });
          }
        }
      });
    }

    createTaskAndAssignUsers(user: Usuarios, cateCodi: string, nombreTarea: string, fechaVencimiento: string | null, breqCodi: string) {
      const fechaActividad = this.setFechaHora();
      const fechaVencimientoFormatted = fechaVencimiento ? fechaVencimiento : '';
    
      this.sequenceService.getNextAsignarTicketId().subscribe(asignarTicketId => {
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
    
        this.asignarTicketService.createAsignarTicket(nuevoAsignarTicket).subscribe(response => {
          console.log('AsignarTicket creado:', response);
    
          const nuevaRegistrarTareas: RegistrarTareas = {
            codi: '',
            ran1_codi: asignarTicketId.toString(),
            pidm: user.pidm,
            fechaActividad: fechaActividad,
            idUsuario: this.userDetail?.idUsuario || ''
          };
    
          this.registrarTareasService.createRegistrarTarea(nuevaRegistrarTareas).subscribe(registrarResponse => {
            console.log('RegistrarTareas creado:', registrarResponse);
          });
        });
      });
    }
    

    loadAdjuntos(): void {
      this.adjuntoService.getAdjuntosByTicketId(this.ticket.ticketID).subscribe({
        next: (adjuntoinfo) => {
          this.adjuntoinfo = adjuntoinfo;
        },
        error: (error) => console.error('Error al obtener adjuntos:', error)
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
    buscarUsuarioPorId(): void {
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

    updateTicket(): void {
      const fechaYHora = this.setFechaHora();
      if (!this.userDetail || !this.userDetail.idUsuario) {
          console.error('No hay usuario actual');
          return;
      }
    
      const ticket = { ...this.ticket };
      const formData = new FormData();
      formData.append('TicketJson', JSON.stringify(this.ticket));
    
      if (this.selectedFiles.length > 0) {
        this.ticketService.uploadFiles(this.selectedFiles).subscribe(
          (uploadResponse: FileUploadResponse) => {
            if (uploadResponse && uploadResponse.files && uploadResponse.files.length > 0) {
              const response_upload = uploadResponse.files.map((f) => {
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
                  idUsuario: '',
                };
              });
              this.ticket.adjuntos = [...response_upload]
            }
            this.finalizeTicketUpdate();
          },
          (error: any) => {
            console.error('Error al cargar archivos', error);
          }
        );
      } else {
        this.finalizeTicketUpdate();
      }
    }
    
    finalizeTicketUpdate(): void {
      this.ticketService.updateTicketFormData(this.ticket.id!, this.ticket).subscribe({
        next: (response: any) => {
            this.createAsignarTicketsAndTasks(this.ticket.ticketID);
            this.registrarHistorial("A","Edicion de Ticket","Se ha editado el ticket.")
            if(this.ticket.estado === "Por Revisar"){
              this.router.navigate(['/menu/list-tickets-user']);
            }else{this.router.navigate(['/menu/list-tickets']);}
        },
        error: (error) => {
            console.error('Error al actualizar el ticket:', error);
        }
      });
    }
    
    createAsignarTicketsAndTasks(breqCodi: string) {
      Object.keys(this.selectedUsers).forEach((cateCodi) => {
        this.selectedUsers[cateCodi].forEach((user) => {
          const task = this.selectedTasks[cateCodi]?.find((t) => t.user === user);
    
          if (task) {
            const { nombreTarea, fechaVencimiento } = task;
            this.createTaskAndAssignUsers(user, cateCodi, nombreTarea, fechaVencimiento, breqCodi);
          } else {
            this.createTaskAndAssignUsers(user, cateCodi, `Tarea para el usuario ${user.nombre}`, null, breqCodi);
          }
        });
      });
    
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
    
    deleteAdjunto(id: string) {
      this.adjuntoService.deleteAdjunto(id).subscribe(
        response => {
          this.adjuntoinfo = this.adjuntoinfo.filter(adjuntoinfo => adjuntoinfo.id !== id);
          this.snackBar.open('Adjunto eliminado con éxito', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-accent']
          });
        },
        error => {
          console.error('Error al eliminar el adjunto:', error);
          this.snackBar.open('Error al eliminar el adjunto', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      );
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
    
    openUserSearchDialog() {
      const dialogRef = this.dialog.open(UserSearchDialogComponent, {
        width: '400px'
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.ticket.idUsuario = result.idUsuario;
          this.ticket.nombre = result.nombre;
        }
      });
    }

    showTipologia(): boolean {
      const ocultarTipologia = this.userDetail?.rols_codi === '3' && this.userDetail?.cate_codi === '1' && (this.userDetail?.cargo_codi === '5' || this.userDetail?.cargo_codi === '6');
      return !ocultarTipologia;
    }

    initializeSearchORGN() {
      this.searchTermsORGN.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termORGN: string) => {
          return termORGN === '' ? this.organizacionService.getOrganizacionActivos() : this.organizacionService.searchOrganizacion(termORGN);
        })
      ).subscribe({
        next: results => {
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
        error: error => {
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

    removeAssignedUser(user: Usuarios, cateCodi: string): void {
      const index = this.selectedUsers[cateCodi].indexOf(user);
      if (index > -1) {
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

    formatFecha(fecha: Date): string {
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      const hora = fecha.getHours();
      const minuto = fecha.getMinutes().toString().padStart(2, '0');
      const periodo = hora >= 12 ? 'p. m.' : 'a. m.';
      const horaFormato12 = hora % 12 || 12;
  
      return `${dia}/${mes}/${anio} - ${horaFormato12}:${minuto} ${periodo}`;
    }
  

    registrarHistorial(tipo: string,componente:string, contexto:string):void{
      const fechaActual = new Date();
      const fechaFormateada = this.formatFecha(fechaActual);
      this.nuevoHistorial.breq_codi = this.ticket.ticketID;
      this.nuevoHistorial.pidm = this.userDetail!.pidm;
      this.nuevoHistorial.tipo = tipo;
      this.nuevoHistorial.fechaActividad = fechaFormateada;
      this.nuevoHistorial.idUsuario = this.userDetail!.idUsuario;
      if(tipo === "A"){
        this.nuevoHistorial.descripcion = ("El usuario "+this.userDetail?.idUsuario+" ha realizado una Actualización en "+componente+" | Acción :" +contexto);
      }
      if(tipo === "R"){
        this.nuevoHistorial.descripcion = ("El usuario "+this.userDetail?.idUsuario+" ha realizado un Registro en "+componente+" | Acción :" +contexto);
      }
      if(tipo === "C"){
        this.nuevoHistorial.descripcion = ("El usuario "+this.userDetail?.idUsuario+" creo como nuevo un dato en "+componente+" | Acción :" +contexto);
      }
      if(tipo === "E"){
        this.nuevoHistorial.descripcion = ("El usuario "+this.userDetail?.idUsuario+" ha realizado una Eliminación en "+componente+" | Acción :" +contexto);
      }
      if(tipo === "M"){
        this.nuevoHistorial.descripcion = ("El usuario "+this.userDetail?.idUsuario+" ha registrado un Mensaje en "+componente+" | Acción :" +contexto);
      }
  
      this.historialService.createHistorial(this.nuevoHistorial).subscribe(historialCreado =>{
      });
    }

    goBack(): void {
      this.location.back();
    }
    
}
