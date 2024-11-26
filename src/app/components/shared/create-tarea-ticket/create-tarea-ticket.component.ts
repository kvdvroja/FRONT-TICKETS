import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, forkJoin, of, map } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TicketService } from 'src/app/services/ticket.service';
import { Ticket } from 'src/app/interfaces/ticket';
import { ActivatedRoute, Router } from '@angular/router';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { ViaRecepcionService } from 'src/app/services/selects/ViaRecepcion/via-recepcion.service';
import { AdjuntoInfo } from 'src/app/interfaces/AdjuntoInfo';
import { AdjuntoService } from 'src/app/services/Attach/adjunto.service';
import { MatDialog } from '@angular/material/dialog';
import { PreviewComponent } from '../preview/preview.component';
import { ResponsesService } from 'src/app/services/Responses/responses.service';
import { Responses } from 'src/app/interfaces/Responses/responses';
import { SequenceService } from 'src/app/services/sequence.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { FinalMessageComponent } from '../final-message/final-message.component';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { Location } from '@angular/common';
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { EditarRespuestaComponent } from '../editar-respuesta/editar-respuesta.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { AsignadosDetalleComponent } from '../asignados-detalle/asignados-detalle.component';
import { AsignarTicketService } from 'src/app/services/Assign/asignar-ticket.service';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { CreateBasicTareaComponent } from '../create-basic-tarea/create-basic-tarea.component';
import { RegistrarTareasService } from 'src/app/services/RegistrarTareas/registrar-tareas.service';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { DetalleTareaTicketComponent } from '../detalle-tarea-ticket/detalle-tarea-ticket.component';
import { SignalrService } from 'src/app/services/signalr.service';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { VinculacionComponent } from '../vinculacion/vinculacion.component';
import { Vinculacion } from 'src/app/interfaces/Vinculacion/Vinculacion';
import { VinculacionService } from 'src/app/services/Vinculacion/vinculacion.service';
import { VinculacionConDetalles } from 'src/app/interfaces/Vinculacion/VinculacionConDetalles';
import { RegistroEtiquetasService } from 'src/app/services/Etiqueta/registro-etiquetas.service';
import { EtiquetaService } from 'src/app/services/Etiqueta/etiqueta.service';

// Quill.register('modules/imageDrop', ImageDrop);
// Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-create-tarea-ticket',
  templateUrl: './create-tarea-ticket.component.html',
  styleUrls: ['./create-tarea-ticket.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CreateTareaTicketComponent implements OnInit {
  organizacionMap: { [codigo: string]: string } = {};
  tipologiaMap: { [codigo: string]: string } = {};
  prioridadMap: { [key: string]: { descripcion: string; imagen: string } } = {};
  viaRecepcionMap: { [codigo: string]: string } = {};

  asignacionesCategorias: AsignarCategoria[] = [];
  categorias: Categoria[] = [];
  coordinadores: { [cate_codi: string]: any } = {};

  constructor(
    private prioridadService: PrioridadService,
    private organizacionService: OrganizacionService,
    private tipologiaService: TipologiaService,
    private responsesService: ResponsesService,
    private viasRecepcionService: ViaRecepcionService,
    private ticketService: TicketService,
    private adjuntoService: AdjuntoService,
    private sequenceService: SequenceService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private catalogoService: CatalogoService,
    private asignarCategoriaService: AsignarCategoriaService,
    private asignacionService: AsignacionService,
    private snackBar: MatSnackBar,
    private categoriaService: CategoriaService,
    private asignarTicketService: AsignarTicketService,
    private registrarTareasService: RegistrarTareasService,
    private historialService: HistorialService,
    private signalrService: SignalrService,
    private vinculacionService: VinculacionService,
    private registroEtiquetasService: RegistroEtiquetasService,
    private etiquetaService: EtiquetaService,
    private location: Location
  ) {}

  displayCatalogPath: string = '';
  userDetail: UserDetail | null = null;
  displayCatalogName: string = '';
  organizaciones: Organizacion[] = [];
  vias: viaRecepcion[] = [];
  prioridades: Prioridad[] = [];
  tipologias: Tipologia[] = [];
  asignarTickets: AsignarTicket[] = [];
  ticketsVinculados: VinculacionConDetalles[]=[];
  selectedFiles: File[] = [];
  historiales: Historial [] = [];
  historialesA: {} = {};
  respuestas: Responses[] = [];
  imagenUsuario: string = '';
  imagenUsuarioR: string = '';
  descEditor: string = '';
  ticket: Ticket | null = null;
  ticketId: string | null = null;
  adjuntos: AdjuntoInfo[] = [];
  public editorInstance: Quill | null = null;
  adjuntosParaMostrar: AdjuntoInfo[] | null = null;
  respuestaPrincipal: Responses | null = null;
  recepcionCorreo: string = '';
  asignadosCount: { [cateCodi: string]: number } = {};
  asignaciones: { [cateCodi: string]: any[] } = {};
  usuarios: { [cate_codi: string]: Usuarios[] } = {};
  expandedPanels: { [cateCodi: string]: boolean } = {};
  asignacionCategoria: AsignarCategoria | null = null;
  usuariosAsignadosPorTarea: { [ran1Codi: string]: Usuarios[] } = {};
  selectedTab: string = 'comentarios';
  Gticket: Ticket | null = null;
  GticketID: string | null = null;
  selectedTasks: AsignarTicket[] = [];
  etiquetasSeleccionadas: { [key: string]: any[] } = {};
  etiquetas: any[] = [];
  etiquetasFiltradas: any[] = []; 



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

  public nuevaRespuesta: Responses = {
    breq_codi: '',
    descripcion: '',
    url: '',
    padre_codi: '',
    fechaActividad: '',
    idUsuario: '',
  };

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

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.cargarDataTicket();
    this.setupSignalR();
    console.log('Asignar Tickets:', this.asignarTickets);
    console.log('Etiquetas Seleccionadas:', this.etiquetasSeleccionadas);
  }
  setupSignalR() {
    this.signalrService.startConnection().then(() => {
      this.signalrService.addNewTaskListener();
      this.signalrService.addTaskDeletedListener();
      this.signalrService.addTaskUpdatedListener();
      this.signalrService.addNewAssignListener();
      this.signalrService.addAssignDeletedListener();
      this.signalrService.addAssignUpdatedListener();
    });

    this.signalrService.newTask$.subscribe((newTask: AsignarTicket) => {
      this.asignarTickets.push(newTask);
      this.cargarUsuariosAsignados();
      this.cdr.detectChanges();
    });

    this.signalrService.taskDeleted$.subscribe((taskId: string) => {
      this.asignarTickets = this.asignarTickets.filter(task => task.codi !== taskId);
      this.cargarUsuariosAsignados();
      this.cdr.detectChanges();
    });

    this.signalrService.taskUpdated$.subscribe((updatedTask: AsignarTicket) => {
      const index = this.asignarTickets.findIndex(task => task.codi === updatedTask.codi);
      if (index !== -1) {
        this.asignarTickets[index] = updatedTask;
        this.cargarUsuariosAsignados();
        this.cdr.detectChanges();
      }
    });

     this.signalrService.newAssign$.subscribe((newAssign: RegistrarTareas) => {
       this.cargarUsuariosAsignados();
       this.cdr.detectChanges();
     });


    // this.signalrService.newAssign$.pipe(
    //   switchMap((newAssign: RegistrarTareas) => 
    //     this.convertirRegistrarTareasAUsuarios(newAssign).pipe(
    //       map(usuario => ({ newAssign, usuario }))
    //     )
    //   )
    // ).subscribe(({ newAssign, usuario }) => {
    //   const usuariosAsignados = this.usuariosAsignadosPorTarea[newAssign.ran1_codi] || [];
    //   usuariosAsignados.push(usuario);
    //   this.usuariosAsignadosPorTarea[newAssign.ran1_codi] = usuariosAsignados;
    //   this.cargarUsuariosAsignados();
    //   this.cdr.detectChanges();
    // });

    this.signalrService.assignDeleted$.subscribe((assignId: string) => {
      this.cargarUsuariosAsignados();
      this.cdr.detectChanges();
    });

    this.signalrService.assignUpdated$.subscribe((updatedAssign: RegistrarTareas) => {
      this.cargarUsuariosAsignados();
      this.cdr.detectChanges();
    });
  }

  public setEditorInstance(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.descEditor = this.editorInstance!.root.innerHTML;
    });
  }

  public onEditorChange(event: any): void {
    const content = event.editor.root.innerHTML;
    this.descEditor = content;
  }

  public onReady(event: any) {
    this.editorInstance = event.editor;
  }

  loadCatalogHierarchy(catalogId: string): void {
    if (!catalogId) {
      return;
    }
    this.catalogoService.getCatalogoByCodi(catalogId).subscribe({
      next: (catalogo) => {
        if (catalogo?.codi !== "1") {
          const catalogNameHtml = `<div>■ ${catalogo?.nombre}</div>`;
          this.displayCatalogPath = catalogNameHtml + this.displayCatalogPath;
        }
        if (catalogo?.padre) {
          this.loadCatalogHierarchy(catalogo?.padre);
        }
      },
      error: (error) => console.error('Error al obtener el catálogo:', error)
    });
  }

  loadCatalogName(catalogoId: string): void {
    this.catalogoService.getCatalogoNameByID(catalogoId).subscribe({
      next: (catalogData) => {
        this.displayCatalogName = catalogData.nombre;
      },
      error: (error) => {
        console.error('Error al obtener el nombre del catálogo:', error);
        this.displayCatalogName = 'Nombre de catálogo no disponible';
      }
    });
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  obtenerUrlImagen(idUsuario: string, intento: number): string {
    if (intento === 1) {
      return `https://static.upao.edu.pe/upload/f1/${idUsuario}.jpg`;
    } else {
      return `https://static.upao.edu.pe/upload/f/${idUsuario}.jpg`;
    }
  }

  manejarErrorImagen(): void {
    if (this.imagenUsuario.includes('/f1/')) {
      this.imagenUsuario = `https://static.upao.edu.pe/upload/f/${this.ticket?.idUsuario}.jpg`;
    } else {
      this.imagenUsuario = 'assets/UserSinFoto.svg';
    }
  }

  manejarErrorImagen2(ticket: Ticket): void {
    if (ticket.urlImagenUsuario) {
      if (ticket.urlImagenUsuario.includes('/f1/')) {
        ticket.urlImagenUsuario = `https://static.upao.edu.pe/upload/f/${ticket.idUsuario}.jpg`;
      } else if (ticket.urlImagenUsuario.includes('/f/')) {
        ticket.urlImagenUsuario = 'assets/UserSinFoto.svg';
      }
    } else {
      ticket.urlImagenUsuario = 'assets/UserSinFoto.svg';
    }
  }

  manejarErrorImagenRespuesta(respuesta: any): void {
    if (respuesta.imagenUsuarioR && respuesta.imagenUsuarioR.includes('/f1/')) {
      respuesta.imagenUsuarioR = `https://static.upao.edu.pe/upload/f/${respuesta.idUsuario}.jpg`;
    } else {
      respuesta.imagenUsuarioR = 'assets/UserSinFoto.svg';
    }
  }

  async buscarUsuarioPorId(idUsuario: string): Promise<{ nombreCompleto: string, idUsuario: string }> {
    const paddedIdUsuario = idUsuario.padStart(9, '0');
    try {
      const usuarios = await this.usuariosService.getUsuariosById(paddedIdUsuario).toPromise();
      if (usuarios && usuarios.length > 0) {
        this.recepcionCorreo = usuarios[0].email;
        return { nombreCompleto: usuarios[0].nombre_completo, idUsuario: usuarios[0].idUsuario };
      }
      return { nombreCompleto: '', idUsuario: '' };
    } catch (err) {
      console.error(err);
      return { nombreCompleto: '', idUsuario: '' };
    }
  }

  crearRespuesta(conAdjunto: boolean): void {
    const fechaYHora = this.setFechaHora();
    const textoPlano = this.descEditor;

    if (this.ticket && this.ticket.ticketID && this.userDetail && this.userDetail.idUsuario) {
      this.sequenceService.getNextRespuestaId().subscribe(nextId => {
        const respuestaId = nextId.toString();
        const padreCodi = (this.respuestas.length + 1).toString();
        if (conAdjunto && this.selectedFiles.length > 0) {
          if (!textoPlano || textoPlano.trim() === '') {
            this.snackBar.open('El comentario no puede estar vacío', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            return;
          }
          this.cargarArchivoYCrearRespuesta(textoPlano, fechaYHora, respuestaId, padreCodi);
          this.registrarHistorial("R","Detalle de Tickets","Creación de respuesta con adjuntos")
        } else {
          if (!textoPlano || textoPlano.trim() === '') {
            this.snackBar.open('El comentario no puede estar vacío', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            return;
          }
          this.enviarRespuesta(textoPlano, fechaYHora, null, respuestaId, padreCodi);
          this.registrarHistorial("R","Detalle de Tickets","Creación de respuesta")
        }
      });
    }
    this.descEditor = '';
  }

  cargarArchivoYCrearRespuesta(textoPlano: string, fechaYHora: string, respuestaId: string, padreCodi: string): void {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => {
        formData.append('files', file, file.name);
      });
      formData.append('Descripcion', textoPlano);
      formData.append('TicketId', this.ticket!.ticketID);
      formData.append('RespuestaId', respuestaId);
      formData.append('PadreCodi', padreCodi);
      formData.append('idUsuario', this.userDetail!.idUsuario);

      this.responsesService.createResponseWithAttachments(formData).subscribe({
        next: (response) => {
          this.cargarRespuestas(this.ticket!.ticketID);
        },
        error: (error) => {
          console.error('Error al enviar respuesta con archivos:', error);
        }
      });
    } else {
      this.enviarRespuesta(textoPlano, fechaYHora, null, respuestaId, padreCodi);
    }
    this.descEditor = '';
    this.selectedFiles = [];
  }

  enviarRespuesta(descripcion: string, fechaYHora: string, urlArchivo: string | null, respuestaId: string, padreCodi: string): void {
    this.nuevaRespuesta.codi = respuestaId;
    this.nuevaRespuesta.breq_codi = this.ticket!.ticketID;
    this.nuevaRespuesta.descripcion = descripcion;
    this.nuevaRespuesta.fechaActividad = fechaYHora;
    this.nuevaRespuesta.padre_codi = padreCodi;
    this.nuevaRespuesta.idUsuario = this.userDetail!.idUsuario;
    this.nuevaRespuesta.url = urlArchivo || '';

    this.responsesService.createResponses(this.nuevaRespuesta).subscribe(respuestaCreada => {
      if (this.ticket) {
        this.cargarRespuestas(this.ticket.ticketID);
      }
    });
  }

  cargarDataTicket(): void {
    const asignarCoordinadorId = this.route.snapshot.paramMap.get('id');
    if (asignarCoordinadorId) {
      this.asignarCategoriaService.getAsignacionCategoriaByID(asignarCoordinadorId).subscribe({
        next: (asignacion) => {
          this.asignacionCategoria = asignacion
          if (asignacion && asignacion.breq_codi) {
            this.ticketService.getUniqueTicketByTicketId(asignacion.breq_codi).subscribe({
              next: (ticket) => {
                this.ticket = ticket;
                this.ticketId = ticket.id!;
                this.displayCatalogPath = '';
                if (ticket.catalogo) {
                  this.loadCatalogHierarchy(ticket.catalogo);
                }
                this.imagenUsuario = this.obtenerUrlImagen(ticket.idUsuario, 1);
                this.cargarRespuestas(ticket.ticketID);
                this.cargarAsignacionesCategorias(ticket, ticket.ticketID);
                this.cargarViasRecepcion();
                this.cargarOrganizaciones();
                this.cargarTipologias();
                this.cargarPrioridades();
                this.cargarHistorial(ticket.ticketID);
                this.cargarAsignarTickets(asignacion.breq_codi, asignacion.cate_codi);
                this.cargarUsuariosAsignados();
                this.cargarEtiquetas();
                this.cargarVinculados();
                this.cdr.detectChanges();
              },
              error: (error) => console.error('Error al obtener datos del ticket:', error)
            });
          }
        },
        error: (error) => console.error('Error al obtener la asignación de categoria:', error)
      });
    }
  }

  cargarEtiquetas() {
    this.etiquetaService.getEtiquetas().subscribe(
      (etiquetas) => {
        this.etiquetas = etiquetas.map(etiqueta => ({
          ...etiqueta,
          color: etiqueta.color_fondo || '#000000' // Asume un color por defecto si no existe
        }));
        this.etiquetasFiltradas = this.etiquetas;
        // Ya no es necesario llamar a cargarEtiquetasSeleccionadas() aquí
      },
      (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    );
  }
  

  async cargarRespuestas(ticketId: string): Promise<void> {
    try {
      const respuestas = await this.responsesService.getResponsesByTicketId(ticketId).toPromise();
      if (!respuestas) {
        console.error('No se recibieron respuestas.');
        this.respuestas = [];
        this.respuestaPrincipal = null;
        return;
      }
      const respuestasProcesadas: Responses[] = [];
      for (const respuesta of respuestas) {
        if (!respuesta.codi) {
          continue;
        }

        const adjuntosRespuesta = await this.adjuntoService.getAdjuntosByRespuestaId(respuesta.codi).toPromise().catch(() => []);
        respuesta.adjuntosRespuesta = adjuntosRespuesta;

        const { nombreCompleto, idUsuario } = await this.buscarUsuarioPorId(respuesta.idUsuario);
        const respuestaProcesada = {
          ...respuesta,
          nombreUsuario: nombreCompleto,
          imagenUsuarioR: this.obtenerUrlImagen(idUsuario, 1),
        };
        if (respuesta.padre_codi === "0") {
          this.respuestaPrincipal = respuestaProcesada;
        } else {
          respuestasProcesadas.push(respuestaProcesada);
        }
      }
      this.respuestas = respuestasProcesadas;
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      this.respuestas = [];
      this.respuestaPrincipal = null;
    }
  }

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
  }

  transformHtmlToPlainText(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  cargarViasRecepcion(): void {
    this.viasRecepcionService.getVias().subscribe({
      next: (data) => {
        this.vias = data;
        this.viaRecepcionMap = {};
        data.forEach((via) => {
          this.viaRecepcionMap[via.codi!] = via.descripcion;
        });
      },
      error: (error) => console.error('Error al obtener vías de recepción', error)
    });
  }

  cargarOrganizaciones(): void {
    this.organizacionService.getOrganizaciones().subscribe({
      next: (data) => {
        this.organizaciones = data;
        this.organizacionMap = {};
        data.forEach((organizacion) => {
          this.organizacionMap[organizacion.codi!] = organizacion.descripcion;
        });
      },
      error: (error) => console.error('Error al obtener organizaciones', error)
    });
  }

  cargarTipologias(): void {
    this.tipologiaService.getTipologia().subscribe({
      next: (data) => {
        this.tipologias = data;
        this.tipologiaMap = {};
        data.forEach((tipologia) => {
          this.tipologiaMap[tipologia.codi!] = tipologia.descripcion;
        });
      },
      error: (error) => console.error('Error al obtener tipologías', error)
    });
  }

  cargarPrioridades(): void {
    this.prioridadService.getPrioridad().subscribe({
      next: (data) => {
        this.prioridadMap = {};
        data.forEach((prioridad) => {
          this.prioridadMap[prioridad.codi!] = {
            descripcion: prioridad.descripcion,
            imagen: prioridad.imagen // Asegúrate de que `imagen` sea parte de los datos que recibes
          };
        });
      },
      error: (error) => console.error('Error al obtener prioridades', error)
    });
    
  }

  get adjuntosParaMostrarSafe(): AdjuntoInfo[] {
    return this.adjuntosParaMostrar ?? [];
  }

  openPreviewModal(fileUrl: string) {
    this.dialog.open(PreviewComponent, {
      data: { url: fileUrl }
    });
  }

  NewonFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFiles = Array.from(element.files);
      //console.log('Archivos seleccionados:', this.selectedFiles);
    } else {
      //console.log('No se seleccionaron archivos.');
      this.selectedFiles = [];
    }
  }

  showEditor(): boolean {
    const ocultarEditor = this.ticket!.estado == 'Cerrado';
    return !ocultarEditor;
  }

  editarRespuesta(respuesta: Responses) {
    const dialogRef = this.dialog.open(EditarRespuestaComponent, {
      width: '800px',
      data: { respuesta }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.registrarHistorial("A","Detalle de Tickets","Actualización de Respuesta")
        this.cargarRespuestas(this.ticket!.ticketID);
      }
    });
  }

  cargarAsignacionesCategorias(ticket: Ticket, ticketID: string): void {
    if (ticket && ticketID) {
      this.asignarCategoriaService.getAsignacionCategoriaByBreq(ticketID).subscribe({
        next: (asignaciones) => {
          if (asignaciones) {
            this.asignacionesCategorias = asignaciones;
            for (const asignacion of asignaciones) {
              this.categoriaService.getCategoriabyCodi(asignacion.cate_codi).subscribe({
                next: (categoria) => {
                  if (categoria) {
                    this.categorias.push(categoria);
                  }
                },
                error: (error) => console.error('Error al obtener categoría:', error)
              });
              this.cargarCoordinador(asignacion.cate_codi);
            }
          }
        },
        error: (error) => console.error('Error al obtener asignaciones de categorías:', error)
      });
    }
  }

  cargarCoordinador(cateCodi: string): void {
    this.asignacionService.getAsignacionesByCateCodiAndCargCodi(cateCodi, '2').subscribe({
      next: async (asignaciones) => {
        if (asignaciones && asignaciones.length > 0) {
          const asignacion = asignaciones[0];
          const { nombreCompleto, idUsuario } = await this.buscarUsuarioPorId(asignacion.pidm);
          this.coordinadores[cateCodi] = {
            ...asignacion,
            nombreCoordinador: nombreCompleto,
            imagenUrl: this.obtenerUrlImagen(idUsuario, 1),
            idUsuario
          };
        }
      },
      error: (error) => console.error('Error al obtener coordinador:', error)
    });
  }

  manejarErrorImagenCoordinador(cateCodi: string): void {
    if (this.coordinadores[cateCodi]?.imagenUrl.includes('/f1/')) {
      this.coordinadores[cateCodi].imagenUrl = `https://static.upao.edu.pe/upload/f/${this.coordinadores[cateCodi].idUsuario}.jpg`;
    } else {
      this.coordinadores[cateCodi].imagenUrl = 'assets/UserSinFoto.svg';
    }
  }

  getCategoriaDescripcion(cateCodi: string): string {
    const categoria = this.categorias.find(cat => cat.codi === cateCodi);
    return categoria ? categoria.descripcion : 'Categoría no encontrada';
  }

  manejarErrorImagenAsign(usuario: Usuarios): void {
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
/*
  cargarAsignarTickets(breqCodi: string, cateCodi: string): void {
    this.asignarTicketService.getAsignarTicketsByBreqCodiAndCateCodi(breqCodi, cateCodi).subscribe({
      next: (asignarTickets) => {
        this.asignarTickets = asignarTickets.sort((a, b) => a.codi.localeCompare(b.codi));
        this.asignarTickets.forEach(tarea => {
          this.registrarTareasService.getRegistrarTareasByRan1Codi(tarea.codi).subscribe({
            next: (registrarTareas) => {
              const usuariosAsignados: Usuarios[] = [];
              registrarTareas.forEach(regTarea => {
                this.usuariosService.getUsuariosByPidm(regTarea.pidm).subscribe({
                  next: (usuario) => {
                    if (usuario && usuario.length > 0) {
                      usuariosAsignados.push(usuario[0]);
                    }
                  },
                  error: (error) => console.error('Error al obtener usuarios por PIDM:', error)
                });
              });
              this.usuariosAsignadosPorTarea[tarea.codi] = usuariosAsignados;
            }
          });
        });
        this.actualizarEstadoTicket();
      },
      error: (error) => console.error('Error al obtener AsignarTickets:', error)
    });
  }
  */
  cargarAsignarTickets(breqCodi: string, cateCodi: string): void {
    this.asignarTicketService.getAsignarTicketsByBreqCodiAndCateCodi(breqCodi, cateCodi).subscribe({
      next: (asignarTickets) => {
        this.asignarTickets = asignarTickets.sort((a, b) => a.codi.localeCompare(b.codi));
        
        this.asignarTickets.forEach(tarea => {
          this.registrarTareasService.getRegistrarTareasByRan1Codi(tarea.codi).subscribe({
            next: (registrarTareas) => {
              const usuariosAsignados: Usuarios[] = [];
              registrarTareas.forEach(regTarea => {
                this.usuariosService.getUsuariosByPidm(regTarea.pidm).subscribe({
                  next: (usuario) => {
                    if (usuario && usuario.length > 0) {
                      usuariosAsignados.push(usuario[0]);
                    }
                  },
                  error: (error) => console.error('Error al obtener usuarios por PIDM:', error)
                });
              });
              this.usuariosAsignadosPorTarea[tarea.codi] = usuariosAsignados;
  
              // Cargar etiquetas asociadas a la tarea
              this.cargarEtiquetasPorTarea(tarea.codi);
            }
          });
        });
        this.actualizarEstadoTicket();
      },
      error: (error) => console.error('Error al obtener AsignarTickets:', error)
    });
  }
  
  cargarEtiquetasPorTarea(ran1Codi: string): void {
    this.registroEtiquetasService.getRegistroEtiquetasByRan1Codi(ran1Codi).subscribe({
      next: (etiquetas) => {
        // Itera sobre cada etiqueta para obtener más detalles basados en etiq_codi
        const etiquetasDetalles$ = etiquetas.map(etiqueta =>
          this.etiquetaService.getEtiquetaByCodi(etiqueta.etiq_codi).pipe(
            map(etiquetaDetalle => ({
              ...etiqueta,
              nombre: etiquetaDetalle.nombre,
              color_fondo: etiquetaDetalle.color_fondo || '#000000' // Asume un color por defecto si no existe
            }))
          )
        );
  
        // Combina las etiquetas con detalles
        forkJoin(etiquetasDetalles$).subscribe(etiquetasDetalladas => {
          this.etiquetasSeleccionadas[ran1Codi] = etiquetasDetalladas;
          console.log(`Etiquetas detalladas para la tarea ${ran1Codi}:`, etiquetasDetalladas);
        });
      },
      error: (error) => console.error('Error al cargar etiquetas para la tarea:', error)
    });
  }

  combinedEtiquetas(): any[] {
    let etiquetasCombinadas: any[] = [];
    this.asignarTickets.forEach(tarea => {
        if (this.etiquetasSeleccionadas[tarea.codi]) {
            etiquetasCombinadas = etiquetasCombinadas.concat(this.etiquetasSeleccionadas[tarea.codi]);
        }
    });
    const etiquetasUnicas = etiquetasCombinadas.filter((etiqueta, index, self) =>
        index === self.findIndex(e => e.nombre === etiqueta.nombre)
    );
    return etiquetasUnicas;
}

showCreate(ticketEstado: string | undefined): boolean {
  if (ticketEstado === 'Cerrado') {
    return false;
  }
  const puedeCrear = this.userDetail?.cate_codi === '1' || this.userDetail?.rols_codi === '1' || this.userDetail?.rols_codi === '2'||this.userDetail?.idUsuario=="000005741";
  return puedeCrear;
}

goBack(): void {
  this.location.back();
}

  
  

  openAssignTareaDialog() {
    const cateCodi = this.asignacionCategoria?.cate_codi;
    const breqCodi = this.ticket?.ticketID;
    const dialogRef = this.dialog.open(CreateBasicTareaComponent, {
      width: '500px',
      data: { cateCodi, breqCodi, userDetail: this.userDetail, ascoCodi: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTaskAndAssignUsers(result.nombreTarea, result.fechaVencimiento, result.selectedUsers, cateCodi!, breqCodi!).subscribe({
          next: () => {
            this.registrarHistorial("R","Tareas",("Creación de tarea: "+result.nombreTarea))
            //window.location.reload();
          }
        });
      }
    });
  }

  createTaskAndAssignUsers(nombreTarea: string, fechaVencimiento: string | null, selectedUsers: Usuarios[], cateCodi: string, breqCodi: string): Observable<any> {
    const fechaActividad = this.setFechaHora();
    const fechaVencimientoFormatted = fechaVencimiento ? fechaVencimiento : '';

    return this.sequenceService.getNextAsignarTicketId().pipe(
      switchMap(asignarTicketId => {
        const nuevoAsignarTicket: AsignarTicket = {
          codi: asignarTicketId.toString(),
          breq_codi: breqCodi,
          klog_codi: '1',
          prog_codi: '1',
          cate_codi: cateCodi,
          fecha_inicio: '',
          fecha_fin: fechaVencimientoFormatted,
          nombre: nombreTarea,
          descripcion: "",
          fecha_actividad: fechaActividad,
          ind_estado: 'A',
          idUsuario: this.userDetail?.idUsuario || ''
        };

        return this.asignarTicketService.createAsignarTicket(nuevoAsignarTicket).pipe(
          switchMap(() => {
            const tareasObservables = selectedUsers.map(user => {
              const nuevaRegistrarTareas: RegistrarTareas = {
                codi: '',
                ran1_codi: asignarTicketId.toString(),
                pidm: user.pidm,
                fechaActividad: fechaActividad,
                idUsuario: this.userDetail?.idUsuario || ''
              };

              return this.registrarTareasService.createRegistrarTarea(nuevaRegistrarTareas);
            });
            return forkJoin(tareasObservables);
          })
        );
      })
    );
  }

  async buscarUsuarioPorpidm(pidm: string): Promise<{ nombreCompleto: string, idUsuario: string }> {
    try {
      const usuarios = await this.usuariosService.getUsuariosByPidm(pidm).toPromise();
      if (usuarios && usuarios.length > 0) {
        this.recepcionCorreo = usuarios[0].email;
        return { nombreCompleto: usuarios[0].nombre_completo, idUsuario: usuarios[0].idUsuario };
      }
      return { nombreCompleto: '', idUsuario: '' };
    } catch (err) {
      console.error(err);
      return { nombreCompleto: '', idUsuario: '' };
    }
  }

  cargarUsuariosAsignados(): void {
    const cateCodi = this.asignacionCategoria?.cate_codi;
    const breqCodi = this.asignacionCategoria?.breq_codi;
    if (cateCodi) {
        this.asignarTicketService.getAsignarTicketsByBreqCodiAndCateCodi(breqCodi!, cateCodi).subscribe({
            next: (asignarTickets) => {
                const usuariosMap = new Map<string, Usuarios>();
                const tareasObservables = asignarTickets.map(tarea => 
                    this.registrarTareasService.getRegistrarTareasByRan1Codi(tarea.codi)
                );
    
                forkJoin(tareasObservables).subscribe((todasLasTareas) => {
                    todasLasTareas.forEach((registrarTareas) => {
                        registrarTareas.forEach(regTarea => {
                            this.usuariosService.getUsuariosByPidm(regTarea.pidm).subscribe({
                                next: (usuario) => {
                                    if (usuario && usuario.length > 0) {
                                        usuariosMap.set(usuario[0].pidm, usuario[0]);
                                        this.usuarios[cateCodi] = Array.from(usuariosMap.values());
                                    }
                                },
                                error: (error) => console.error('Error al obtener usuario por PIDM:', error)
                            });
                        });
                    });
                });
            },
            error: (error) => console.error('Error al obtener AsignarTickets:', error)
        });
    }
}


  openDetalleTareaDialog(codi: string) {
    const tareaCodi = codi;
    const breqCodi = this.ticket?.ticketID;
    const cateCodi = this.asignacionCategoria?.cate_codi;
    const dialogRef = this.dialog.open(DetalleTareaTicketComponent, {
      width: '1000px',
      data: { tareaCodi, breqCodi, cateCodi }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "1") {
        //window.location.reload();
      }
    });
  }

  getProgresoTexto(progCodi: string): string {
    switch (progCodi) {
      case '1':
        return 'NO INICIADA';
      case '2':
        return 'PROGRAMA';
      case '3':
        return 'INICIADA';
      case '4':
        return 'COMPLETADA';
      default:
        return progCodi;
    }
  }

  getProgresoClase(progCodi: string): string {
    switch (progCodi) {
      case '1':
        return 'bg-gray-400 text-white';
      case '2':
        return 'programado';
      case '3':
        return 'iniciado';
      case '4':
        return 'listo';
      default:
        return '';
    }
  }

  calcularProgreso(): number {
    const totalTareas = this.asignarTickets?.length || 0;
    const tareasCompletadas = this.asignarTickets?.filter(t => t.prog_codi === '4')?.length || 0;
    const progreso = totalTareas ? (tareasCompletadas / totalTareas) * 100 : 0;
    return Math.round(progreso * 100) / 100;
  }

  actualizarEstadoTicket(): void {
    if (this.ticket) {
      let nuevoEstado: string | null = null;
      const progreso = this.calcularProgreso();

      if (progreso > 0 && (this.ticket.estado === "Revisado" || this.ticket.estado === "Recibido")) {
        nuevoEstado = 'En Proceso';
      }

      if (nuevoEstado) {
        const updatedTicket = { ...this.ticket, estado: nuevoEstado };
        this.ticketService.updateTicketState(this.ticket.id!, updatedTicket).subscribe({
          next: (data) => {
            //console.log('Estado del ticket actualizado', data);
          },
          error: (err) => {
            console.error('Error al actualizar el estado del ticket:', err);
          }
        });
      }
    }
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  cargarHistorial(ticketID: string): void {
    this.historialService.getHistorialesByBreqCodi(ticketID).subscribe({
      next: async (historiales) => {
        if (historiales && historiales.length > 0) {
          const historialesModificados = await Promise.all(historiales.map(async (historial) => {
            const { nombreCompleto, idUsuario } = await this.buscarUsuarioPorpidm(historial.pidm);
            return {
              ...historial,
              nombreUsuarioH: nombreCompleto,
              imagenUsuarioH: this.obtenerUrlImagen(idUsuario, 1),
              idUsuarioH: idUsuario
            };
          }));
          this.historiales = historialesModificados;
        }
      }
    });
  }
  

  registrarHistorial(tipo: string,componente:string, contexto:string):void{
    this.nuevoHistorial.breq_codi = this.ticket!.ticketID;
    this.nuevoHistorial.pidm = this.userDetail!.pidm;
    this.nuevoHistorial.tipo = tipo;
    this.nuevoHistorial.fechaActividad = this.setFechaHora();
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
      if(this.ticket){
        this.cargarHistorial(this.ticket.ticketID);
      }
    });
  }

  manejarErrorImagenHistorial(historial: any): void {
    if (historial.imagenUsuarioH && historial.imagenUsuarioH.includes('/f1/')) {
      historial.imagenUsuarioH = `https://static.upao.edu.pe/upload/f/${historial.idUsuarioH}.jpg`;
    } else {
      historial.imagenUsuarioH = 'assets/UserSinFoto.svg';
    }
  }

  navigateToDetalle(ticket :Ticket):void{
    if (ticket.id) {
      this.router.navigate(['menu', 'ticket-detail', ticket.id]).catch(error => {
        console.error('Error en la redirección:', error);
      });
    }
  }

  private convertirRegistrarTareasAUsuarios(registrarTarea: RegistrarTareas): Observable<Usuarios> {
    return this.usuariosService.getUsuariosByPidm(registrarTarea.pidm).pipe(
      switchMap(usuarios => {
        if (usuarios && usuarios.length > 0) {
          return of(usuarios[0]);
        } else {
          // Manejar caso donde no se encuentra el usuario
          throw new Error('Usuario no encontrado');
        }
      })
    );
  }

  toggleTaskSelection(task: AsignarTicket): void {
    const index = this.selectedTasks.indexOf(task);
    if (index === -1) {
      this.selectedTasks.push(task);
    } else {
      this.selectedTasks.splice(index, 1);
    }
  }

  swapTasks(): void {
    if (this.selectedTasks.length === 2) {
      const [task1, task2] = this.selectedTasks;
      this.swapCodis(task1, task2).subscribe(() => {
        this.cargarAsignarTickets(task1.breq_codi, task1.cate_codi);
        this.selectedTasks = [];
      });
    } else {
      alert('Debe seleccionar exactamente dos tareas para intercambiar.');
    }
  }
  

  swapCodis(task1: AsignarTicket, task2: AsignarTicket): Observable<any> {
    // Guardamos los codis originales
    const originalCodi1 = task1.codi;
    const originalCodi2 = task2.codi;
  
    // Intercambiamos los codis temporalmente
    task1.codi = 'TEMP1';
    task2.codi = 'TEMP2';
  
    // Actualizar AsignarTickets con codis temporales
    const updateTempTask1$ = this.asignarTicketService.updateAsignarTicketCodi(originalCodi1, { ...task1, codi: 'TEMP1' });
    const updateTempTask2$ = this.asignarTicketService.updateAsignarTicketCodi(originalCodi2, { ...task2, codi: 'TEMP2' });
  
    return forkJoin([updateTempTask1$, updateTempTask2$]).pipe(
      switchMap(() => {
        // Obtener las tareas relacionadas con codis temporales
        const getRegistrarTareas1$ = this.registrarTareasService.getRegistrarTareasByRan1Codi(originalCodi1);
        const getRegistrarTareas2$ = this.registrarTareasService.getRegistrarTareasByRan1Codi(originalCodi2);
  
        return forkJoin([getRegistrarTareas1$, getRegistrarTareas2$]).pipe(
          switchMap(([tareas1, tareas2]) => {
            // Actualizar las tareas relacionadas con codis temporales
            const updateTareasTemp1$ = tareas1.map(tarea => {
              const updatedTarea = { ...tarea, ran1_codi: 'TEMP1' };
              return this.registrarTareasService.updateRegistrarTareaCodi(tarea.codi!, updatedTarea);
            });
  
            const updateTareasTemp2$ = tareas2.map(tarea => {
              const updatedTarea = { ...tarea, ran1_codi: 'TEMP2' };
              return this.registrarTareasService.updateRegistrarTareaCodi(tarea.codi!, updatedTarea);
            });
  
            return forkJoin([...updateTareasTemp1$, ...updateTareasTemp2$]).pipe(
              switchMap(() => {
                // Intercambiamos los codis permanentemente
                task1.codi = originalCodi2;
                task2.codi = originalCodi1;
  
                // Actualizar AsignarTickets con codis finales
                const updateFinalTask1$ = this.asignarTicketService.updateAsignarTicketCodi('TEMP1', { ...task1, codi: originalCodi2 });
                const updateFinalTask2$ = this.asignarTicketService.updateAsignarTicketCodi('TEMP2', { ...task2, codi: originalCodi1 });
  
                return forkJoin([updateFinalTask1$, updateFinalTask2$]).pipe(
                  switchMap(() => {
                    // Obtener las tareas relacionadas con codis temporales finales
                    const getFinalRegistrarTareas1$ = this.registrarTareasService.getRegistrarTareasByRan1Codi('TEMP1');
                    const getFinalRegistrarTareas2$ = this.registrarTareasService.getRegistrarTareasByRan1Codi('TEMP2');
  
                    return forkJoin([getFinalRegistrarTareas1$, getFinalRegistrarTareas2$]).pipe(
                      switchMap(([finalTareas1, finalTareas2]) => {
                        // Actualizar las tareas relacionadas con codis finales
                        const updateFinalTareas1$ = finalTareas1.map(tarea => {
                          const updatedTarea = { ...tarea, ran1_codi: originalCodi2 };
                          return this.registrarTareasService.updateRegistrarTareaCodi(tarea.codi!, updatedTarea);
                        });
  
                        const updateFinalTareas2$ = finalTareas2.map(tarea => {
                          const updatedTarea = { ...tarea, ran1_codi: originalCodi1 };
                          return this.registrarTareasService.updateRegistrarTareaCodi(tarea.codi!, updatedTarea);
                        });
  
                        return forkJoin([...updateFinalTareas1$, ...updateFinalTareas2$]);
                      })
                    );
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  moveTaskUp(task: AsignarTicket): void {
    const index = this.asignarTickets.indexOf(task);
    if (index > 0) {
      const previousTask = this.asignarTickets[index - 1];
      this.swapCodis(task, previousTask).subscribe(() => {
        this.cargarAsignarTickets(task.breq_codi, task.cate_codi);
      });
    }
  }
  
  // Método para mover una tarea hacia abajo
  moveTaskDown(task: AsignarTicket): void {
    const index = this.asignarTickets.indexOf(task);
    if (index < this.asignarTickets.length - 1) {
      const nextTask = this.asignarTickets[index + 1];
      this.swapCodis(task, nextTask).subscribe(() => {
        this.cargarAsignarTickets(task.breq_codi, task.cate_codi);
      });
    }
  }

  openVinculacionDialog(codi: string) {
    const tareaCodi = codi;
    const breqCodi = this.ticket?.ticketID;
    const cateCodi = this.asignacionCategoria?.cate_codi;
    
    const dialogRef = this.dialog.open(VinculacionComponent, {
      width: '1200px',
      data: { tareaCodi, breqCodi, cateCodi }
    });
  
    dialogRef.afterClosed().subscribe(selectedTickets => {
      if (selectedTickets && selectedTickets.length > 0) {
        this.createVinculaciones(breqCodi!, selectedTickets);
      } else {
        console.warn('No se seleccionaron tickets o el diálogo fue cancelado.');
      }
    });
  }
  
  createVinculaciones(breqCodi: string, selectedTickets: Ticket[]) {
    const userDetail = this.authService.getCurrentUser();
    const fechaActividad = new Date().toISOString(); // Formatear según necesites
  
    selectedTickets.forEach(ticket => {
      const vinculacion: Vinculacion = {
        codi: '', // Este campo se genera en el backend
        breq_codi: breqCodi,
        vinc_breq_codi: ticket.ticketID,
        fechaActividad: fechaActividad,
        idUsuario: userDetail!.idUsuario
      };
  
      const vinculacionInversa: Vinculacion = {
        codi: '', // Este campo se genera en el backend
        breq_codi: ticket.ticketID,
        vinc_breq_codi: breqCodi,
        fechaActividad: fechaActividad,
        idUsuario: userDetail!.idUsuario
      };
  
      // Crear la vinculación principal
      this.vinculacionService.createVinculacion(vinculacion).subscribe({
        next: (response) => {
          console.log('Vinculación creada exitosamente:', response);
          this.registrarHistorial("R", "Detalle de Tickets", "El ticket ha sido Vinculado con los siguientes tickets:" + vinculacion.vinc_breq_codi);
        },
        error: (error) => {
          console.error('Error al crear la vinculación:', error);
        }
      });
  
      // Crear la vinculación inversa
      this.vinculacionService.createVinculacion(vinculacionInversa).subscribe({
        next: (response) => {
          console.log('Vinculación inversa creada exitosamente:', response);
        },
        error: (error) => {
          console.error('Error al crear la vinculación inversa:', error);
        }
      });
    });
  }
  

  cargarVinculados() {
    const ticketID = this.ticket?.ticketID;
 
    if (!ticketID) {
       return;
    }
 
    const vinculacionesDirectas$ = this.vinculacionService.getVinculacionesByBreqCodi(ticketID);
    const vinculacionesInversas$ = this.vinculacionService.getVinculacionesByVincBreqCodi(ticketID);
 
    forkJoin([vinculacionesDirectas$, vinculacionesInversas$]).subscribe(([vinculacionesDirectas, vinculacionesInversas]) => {
       const todasLasVinculaciones = [...vinculacionesDirectas, ...vinculacionesInversas];
    
       // Elimina duplicados
       const uniqueVinculaciones = todasLasVinculaciones.filter((vinculacion, index, self) =>
          index === self.findIndex(v => 
             (v.breq_codi === vinculacion.breq_codi && v.vinc_breq_codi === vinculacion.vinc_breq_codi) ||
             (v.breq_codi === vinculacion.vinc_breq_codi && v.vinc_breq_codi === vinculacion.breq_codi)
          )
       );
 
       const ticketObservables = uniqueVinculaciones.map(vinculacion =>
          this.ticketService.getUniqueTicketByTicketId(
             vinculacion.breq_codi === ticketID ? vinculacion.vinc_breq_codi : vinculacion.breq_codi
          ).pipe(
             map(ticket => ({
                ...vinculacion,
                ticket
             } as VinculacionConDetalles))
          )
       );
 
       forkJoin(ticketObservables).subscribe(vinculadosConDetalles => {
          this.ticketsVinculados = vinculadosConDetalles;
       });
    });
 }
 

  verDetalleTicket(ticketID: string | undefined) {
    if (ticketID) {
      this.router.navigate(['menu', 'ticket-detail', ticketID]).catch(error => {
        console.error('Error al redirigir al detalle del ticket:', error);
      });
    }
  }
  
  desvincularRequerimiento(vinculacion: Vinculacion) {
    const confirmacion = confirm("¿Estás seguro de desvincular el ticket?");
    if (confirmacion) {
      // Elimina la vinculación directa
      this.vinculacionService.deleteVinculacion(vinculacion.id!).subscribe({
        next: () => {
          // Elimina la vinculación inversa
          this.vinculacionService.deleteVinculacionByCriteria(vinculacion.vinc_breq_codi, vinculacion.breq_codi).subscribe({
            next: () => {
              this.cargarVinculados();  // Recargar la lista de vinculaciones después de eliminar
              this.snackBar.open('Requerimiento desvinculado con éxito', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['mat-toolbar', 'mat-primary']
              });
              this.registrarHistorial("E", "Detalle de Tickets", "Se ha eliminado la vinculación con el siguiente ticket " + vinculacion.vinc_breq_codi);
            },
            error: (error : any) => {
              console.error('Error al eliminar la vinculación inversa:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error al desvincular el requerimiento:', error);
          this.snackBar.open('Error al desvincular el requerimiento', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      });
    }
  }
  
  
  
}
