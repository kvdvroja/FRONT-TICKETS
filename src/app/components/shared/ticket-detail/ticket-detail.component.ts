import { Component, OnInit } from '@angular/core';
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
import { ResponsesU } from 'src/app/interfaces/Responses/responsesU';
import { SequenceService } from 'src/app/services/sequence.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { FinalMessageComponent } from '../final-message/final-message.component';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { EditarRespuestaComponent } from '../editar-respuesta/editar-respuesta.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { AsignadosDetalleComponent } from '../asignados-detalle/asignados-detalle.component';
import { AsignarTicketService } from 'src/app/services/Assign/asignar-ticket.service';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import Quill from 'quill';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { ResponsesUService } from 'src/app/services/ResponsesU/responses-u.service';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { RegistrarTareasService } from 'src/app/services/RegistrarTareas/registrar-tareas.service';
import { PreviewSolucionComponent } from '../preview-solucion/preview-solucion.component';
import { AsignarCategoriaDialogComponent } from '../asignar-categoria-dialog/asignar-categoria-dialog.component';

Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  organizacionMap: { [codigo: string]: string } = {};
  tipologiaMap: { [codigo: string]: string } = {};
  prioridadMap: { [key: string]: { descripcion: string; imagen: string } } = {};
  viaRecepcionMap: { [codigo: string]: string } = {};
  
  asignacionesCategorias: AsignarCategoria[] = [];
  categorias: Categoria[] = [];
  coordinadores: { [cate_codi: string]: any } = {};
  coordinadoresAdicionales: { [cate_codi: string]: any[] } = {}; // Para guardar los coordinadores adicionales
  expandedPanels: { [cate_codi: string]: boolean } = {};

  usuariosAsignadosPorTarea: { [ran1Codi: string]: Usuarios[] } = {};
  tareas: { [ticket_codi: string]: RegistrarTareas[] } = {};
  combinacionesMostradas: Set<string> = new Set();
  asignarTickets: { [cate_codi: string]: AsignarTicket[] } = {};


  constructor(
    private prioridadService: PrioridadService,
    private organizacionService: OrganizacionService,
    private tipologiaService: TipologiaService,
    private viasRecepcionService: ViaRecepcionService,
    private ticketService: TicketService,
    private adjuntoService: AdjuntoService,
    private sequenceService: SequenceService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private catalogoService: CatalogoService,
    private asignarCategoriaService: AsignarCategoriaService,
    private asignacionService: AsignacionService,
    private snackBar: MatSnackBar,
    private registrarTareasService: RegistrarTareasService,
    private categoriaService: CategoriaService,
    private asignarTicketService: AsignarTicketService,
    private historialService : HistorialService,
    private location: Location,
    private responsesUService: ResponsesUService,
  ) {}

  displayCatalogPath: string = '';
  userDetail: UserDetail | null = null;
  displayCatalogName: string = '';
  organizaciones: Organizacion[] = [];
  vias: viaRecepcion[] = [];
  prioridades: Prioridad[] = [];
  tipologias: Tipologia[] = [];
  selectedFiles: File[] = [];
  respuestas: ResponsesU[] = [];
  historiales: Historial [] = [];
  historialesA: {} = {};
  imagenUsuario: string = '';
  imagenUsuarioR: string = '';
  descEditor: string = '';
  ticket: Ticket | null = null;
  ticketId: string | null = null;
  adjuntos: AdjuntoInfo[] = [];
  public editorInstance: Quill | null = null;
  adjuntosParaMostrar: AdjuntoInfo[] | null = null;
  respuestaPrincipal: ResponsesU | null = null;
  recepcionCorreo: string = '';
  asignadosCount: { [cateCodi: string]: number } = {};
  asignaciones: { [cateCodi: string]: any[] } = {};
  selectedTab: string = 'comentarios';
  unid_codi: string = '';

  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  public nuevaRespuesta: ResponsesU = {
    breq_codi: '',
    descripcion: '',
    visto: 'NO',
    url: '', // Define cómo vas a manejar este campo.
    padre_codi: '', // Este se ajustará basado en las respuestas existentes.
    fechaActividad: '',
    idUsuario: '', // Asegúrate de que este dato se inicialice correctamente.
  };

  public nuevoHistorial: Historial = {
    codi: '',
    breq_codi: '',
    pidm: '',
    descripcion: '',
    tipo: '', // Este se ajustará basado en las respuestas existentes.
    fechaActividad: '',
    idUsuario: '', // Asegúrate de que este dato se inicialice correctamente.
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
    this.route.paramMap.subscribe(params => {
      const ticketId = params.get('id');
      if (ticketId && ticketId !== this.ticketId) {
          this.ticketId = ticketId;
          this.cargarDataTicket(); // Cargar los datos del ticket basado en el nuevo ID
      }
  });
    this.cargarOrganizaciones();
    this.cargarTipologias();
    this.cargarViasRecepcion();
    this.cargarPrioridades();
    this.crearRespuesta(false);

    // const ticketUpdated = localStorage.getItem(`ticketUpdated_${this.ticketId}`);
    // if (!ticketUpdated) {
    //   // Llamar al método para actualizar el estado si es necesario
    //   this.actualizarEstadoTicket();
    // }
  
  }

  actualizarEstadoTicket(): void {
    if (this.ticket) {
      let nuevoEstado: string | null = null;
  
      if (this.ticket.estado === 'Recibido') {
        nuevoEstado = 'Revisado';
      }
  
      if (nuevoEstado) {
        const updatedTicket = { ...this.ticket, estado: nuevoEstado };
        this.ticketService.updateTicketState(this.ticket.id!, updatedTicket).subscribe({
          next: (data) => {
            console.log('Estado del ticket actualizado', data);
            // localStorage.setItem(`ticketUpdated_${this.ticket!.ticketID}`, 'true');
          },
          error: (err) => {
            console.error('Error al actualizar el estado del ticket:', err);
          }
        });
      }
    }
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
        if (catalogo.codi !== "1") {
          const catalogNameHtml = `<div>■ ${catalogo.nombre}</div>`;
          this.displayCatalogPath = catalogNameHtml + this.displayCatalogPath;
        }
        if (catalogo.padre) {
          this.loadCatalogHierarchy(catalogo.padre);
        }
      }
    });
  }

  loadCatalogName(catalogoId: string): void {
    this.catalogoService.getCatalogoNameByID(catalogoId).subscribe({
      next: (catalogData) => {
        this.displayCatalogName = catalogData.nombre;
      },
      error: (error) => {
        this.displayCatalogName = 'Nombre de catálogo no disponible';
      }
    });
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  loadAdjuntos(ticketId: string): void {
    this.adjuntoService.getAdjuntosByTicketId(ticketId).subscribe({
      next: (adjuntos) => {
        this.adjuntos = adjuntos;
      }
    });
  }

  shouldShowChangeStatusButton(): boolean {
    if (!this.userDetail) {
      return false;
    }
    if (this.userDetail.rols_codi === '1' || this.userDetail.rols_codi === '2') {
      return true;
    }
    return false
  }

  shouldShowDelete(): boolean{
    if (!this.userDetail) {
      return false;
    }
    if (this.userDetail.rols_codi === '1') {
      return true;
    }
    return false
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

  manejarErrorImagenRespuesta(respuesta: any): void {
    if (respuesta.imagenUsuarioR && respuesta.imagenUsuarioR.includes('/f1/')) {
      respuesta.imagenUsuarioR = `https://static.upao.edu.pe/upload/f/${respuesta.idUsuario}.jpg`;
    } else {
      respuesta.imagenUsuarioR = 'assets/UserSinFoto.svg';
    }
  }

  manejarErrorImagenHistorial(historial: any): void {
    if (historial.imagenUsuarioH && historial.imagenUsuarioH.includes('/f1/')) {
      historial.imagenUsuarioH = `https://static.upao.edu.pe/upload/f/${historial.idUsuarioH}.jpg`;
    } else {
      historial.imagenUsuarioH = 'assets/UserSinFoto.svg';
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

  crearRespuesta(conAdjunto: boolean): void {
    const fechaYHora = this.setFechaHora();
    const textoPlano = this.descEditor;

    if (this.ticket && this.ticket.ticketID && this.userDetail && this.userDetail.idUsuario) {
      this.sequenceService.getNextRespuestaUId().subscribe(nextId => {
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

      this.responsesUService.createResponseWithAttachments(formData).subscribe({
        next: (response) => {
          console.log('Respuesta con archivos enviada correctamente', response);
          this.cargarRespuestas(this.ticket!.ticketID);
        },
        error: (error) => {
          console.error('Error al enviar respuesta con archivos:', error);
        }
      });
    } else {
      console.log('No hay archivos seleccionados para cargar.');
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

    this.responsesUService.createResponses(this.nuevaRespuesta).subscribe(respuestaCreada => {
      if (this.ticket) {
        this.cargarRespuestas(this.ticket.ticketID);
      }
    });
  }

  cargarDataTicket(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    this.ticketId = ticketId; // Asignar el ticketId aquí
    if (ticketId) {
      this.ticketService.getTicketById(ticketId).subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.displayCatalogPath = '';
          if (ticket.catalogo) {
            this.loadCatalogHierarchy(ticket.catalogo);
          }
          this.imagenUsuario = this.obtenerUrlImagen(ticket.idUsuario, 1);
          this.loadAdjuntos(ticket.ticketID);
          this.cargarRespuestas(ticket.ticketID);
          this.cargarHistorial(ticket.ticketID);
          this.cargarAsignacionesCategorias(ticket, ticket.ticketID);
          this.unid_codi = ticket.unidCodi;
          // this.actualizarEstadoTicket(); // Llamar a la actualización del estado
        },
        error: (error) => console.error('Error al obtener datos del ticket:', error)
      });
    }
  }
  

  async cargarRespuestas(ticketId: string): Promise<void> {
    try {
      const respuestas = await this.responsesUService.getResponsesByTicketId(ticketId).toPromise();
      if (!respuestas) {
        console.error('No se recibieron respuestas.');
        this.respuestas = [];
        this.respuestaPrincipal = null;
        return;
      }
      const respuestasProcesadas: ResponsesU[] = [];
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

  openMensajeFinal() {
    if (this.areAllTasksComplete()) {
      const dialogRef = this.dialog.open(FinalMessageComponent, {
        width: '800px',
        height: '800px',
        data: { ticket: this.ticket }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
    } else {
      this.snackBar.open('Todas las tareas deben estar completas antes de cerrar el ticket.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  areAllTasksComplete(): boolean {
    for (const asignacion of this.asignacionesCategorias) {
      if (this.calcularProgreso(asignacion.cate_codi) < 100) {
        return false;
      }
    }
    return true;
  }

  NewonFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFiles = Array.from(element.files);
      console.log('Archivos seleccionados:', this.selectedFiles);
    } else {
      console.log('No se seleccionaron archivos.');
      this.selectedFiles = [];
    }
  }

  showEditor(): boolean {
    const ocultarEditor = this.ticket!.estado == 'Cerrado';
    return !ocultarEditor;
  }

  editarRespuesta(respuesta: ResponsesU) {
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
              this.cargarCoordinador(asignacion.cate_codi, this.unid_codi);
              this.cargarCoordinadoresAdicionales(asignacion.cate_codi,this.unid_codi);
              this.cargarAsignarTickets(asignacion.breq_codi,asignacion.cate_codi);
            }
          }
        }
      });
    }
  }

  cargarAsignarTickets(breqCodi: string, cateCodi: string): void {
    this.asignarTicketService.getAsignarTicketsByBreqCodiAndCateCodi(breqCodi, cateCodi).subscribe({
      next: (asignarTickets) => {
        if (!this.asignarTickets[cateCodi]) {
          this.asignarTickets[cateCodi] = [];
        }
        this.asignarTickets[cateCodi] = asignarTickets;
        asignarTickets.forEach(tarea => {
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
              if (!this.usuariosAsignadosPorTarea[tarea.codi]) {
                this.usuariosAsignadosPorTarea[tarea.codi] = [];
              }
              this.usuariosAsignadosPorTarea[tarea.codi] = usuariosAsignados;
            },
            error: (error) => console.error('Error al obtener registrar tareas:', error)
          });
        });
      },
      error: (error) => console.error('Error al obtener AsignarTickets:', error)
    });
  }

  getCargCodi(unidCodi: string): string {
    if (unidCodi === '1') {
      return '2'; // Coordinador para la unidad 1
    } else if (unidCodi === '2') {
      return '9'; // Coordinador para la unidad 2
    } else {
      return ''; // Maneja otros casos o retorna un valor por defecto
    }
  }
  

  cargarCoordinadoresAdicionales(cateCodi: string, unidCodi: string): void {
    const cargCodi = this.getCargCodi(unidCodi);
    if (!cargCodi) {
      console.error('No se pudo determinar el carg_codi.');
      return;
    }
  
    this.asignacionService.getAsignacionesByCateCodiAndCargCodi(cateCodi, cargCodi).subscribe({
      next: async (asignaciones) => {
        if (asignaciones && asignaciones.length > 1) {
          const coordinadores = [];
          for (const asignacion of asignaciones.slice(1)) { // Omitir el primer coordinador
            const { nombreCompleto, idUsuario } = await this.buscarUsuarioPorpidm(asignacion.pidm);
            coordinadores.push({
              ...asignacion,
              nombreCoordinador: nombreCompleto,
              imagenUrl: this.obtenerUrlImagen(idUsuario, 1),
              idUsuario
            });
          }
          this.coordinadoresAdicionales[cateCodi] = coordinadores;
        }
      }
    });
  }
  

  cargarCoordinador(cateCodi: string, unidCodi: string): void {
    const cargCodi = this.getCargCodi(unidCodi);
    if (!cargCodi) {
      console.error('No se pudo determinar el carg_codi.');
      return;
    }
  
    this.asignacionService.getAsignacionesByCateCodiAndCargCodi(cateCodi, cargCodi).subscribe({
      next: async (asignaciones) => {
        if (asignaciones && asignaciones.length > 0) {
          const asignacion = asignaciones[0];
          const { nombreCompleto, idUsuario } = await this.buscarUsuarioPorpidm(asignacion.pidm);
          this.coordinadores[cateCodi] = {
            ...asignacion,
            nombreCoordinador: nombreCompleto,
            imagenUrl: this.obtenerUrlImagen(idUsuario, 1),
            idUsuario
          };
        }
      }
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

  openAsignadosDetalle(breq_codi: string, cate_codi: string) {
    this.dialog.open(AsignadosDetalleComponent, {
      width: '600px',
      data: { breq_codi, coordinaciones: [cate_codi], coordinadoresAdicionales: this.coordinadoresAdicionales[cate_codi] } // Pasar los coordinadores adicionales al modal
    });
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

  togglePanel(cateCodi: string): void {
    this.expandedPanels[cateCodi] = !this.expandedPanels[cateCodi];
  }

  panelExpandedChanged(isExpanded: boolean, cateCodi: string): void {
    this.expandedPanels[cateCodi] = isExpanded;
  }

  hasCoordinadoresAdicionales(cateCodi: string): boolean {
    return this.coordinadoresAdicionales[cateCodi]?.length > 0;
  }

  getCoordinadoresAdicionales(cateCodi: string): any[] {
    return this.coordinadoresAdicionales[cateCodi] || [];
  }

  calcularProgreso(cateCodi: string): number {
    const totalTareas = this.asignarTickets[cateCodi]?.length || 0;
    const tareasCompletadas = this.asignarTickets[cateCodi]?.filter(t => t.prog_codi === '4')?.length || 0;
    const progreso = totalTareas ? (tareasCompletadas / totalTareas) * 100 : 0;
    return Math.round(progreso * 100) / 100;
  }

  contarTareas(cateCodi: string, estado: string): number {
    if (estado === 'total') {
      return this.asignarTickets[cateCodi]?.length || 0;
    }
    return this.asignarTickets[cateCodi]?.filter(t => t.prog_codi === estado)?.length || 0;
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

  trackByTicketCodi(index: number, item: AsignarTicket): string {
    return item.codi;
  }
  
  trackByTareaCodi(index: number, item: RegistrarTareas): string {
    return item.ran1_codi;
  }
  
  trackByUsuarioId(index: number, item: Usuarios): string {
    return item.idUsuario;
  }

  mostrarTareaUsuario(tarea: RegistrarTareas, usuario: Usuarios): boolean {
    const combinacion = `${tarea.ran1_codi}-${usuario.idUsuario}`;
    if (this.combinacionesMostradas.has(combinacion)) {
      return false;
    } else {
      this.combinacionesMostradas.add(combinacion);
      return true;
    }
  }

  abrirTicket(): void {
    if (this.ticket && this.ticket.id) {
      const confirmation = confirm("¿Desea abrir el ticket?");
      if (confirmation) {
        const fechaYHora = new Date().toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const updatedTicket = {
          ...this.ticket,
          estado: 'Recibido',
          fechaCierre: fechaYHora
        };

        this.ticketService.updateTicketEstado(this.ticket.id, updatedTicket).subscribe({
          next: (data) => {
            this.snackBar.open('Estado del ticket actualizado', 'Cerrar', {
              duration: 3000,
            });
            this.router.navigate(['/menu/list-tickets']);
          },
          error: (err) => {
            console.error('Error al actualizar el estado del ticket:', err);
            this.snackBar.open('Error al actualizar el ticket', 'Cerrar', {
              duration: 3000,
            });
          }
        });
      }
    } else {
      console.error('No se ha seleccionado ningún ticket o falta el ID del ticket.');
    }
  }

  Delete(): void {
    if (this.ticket?.ticketID) {
      const confirmation = confirm("¿Desea eliminar el ticket y todas sus dependencias?");
      if (confirmation) {
        
        this.responsesUService.deleteResponsesByTicketId(this.ticket.ticketID).subscribe({
          next: () => {
            this.deleteAsignacionesYCategorias();
          },
          error: (err) => {
            if (err.status === 404) {
              this.deleteAsignacionesYCategorias();
            } else {
              console.error('Error al eliminar las respuestas:', err);
              this.snackBar.open('Error al eliminar las respuestas', 'Cerrar', {
                duration: 3000,
              });
              this.deleteAsignacionesYCategorias();
            }
          }
        });
      }
    } else {
      console.error('No se ha seleccionado ningún ticket o falta el ID del ticket.');
    }
  }
  
  private deleteAsignacionesYCategorias(): void {
    this.asignarCategoriaService.deleteAsignacionesByTicketId(this.ticket!.ticketID).subscribe({
      next: () => {
        this.deleteTicketOnly();
      },
      error: (err) => {
        if (err.status === 404) {
          this.deleteTicketOnly();
        } else {
          console.error('Error al eliminar las asignaciones:', err);
          this.snackBar.open('Error al eliminar las asignaciones', 'Cerrar', {
            duration: 3000,
          });
          this.deleteTicketOnly();
        }
      }
    });
  }
  
  private deleteTicketOnly(): void {
    this.ticketService.deleteTicket(this.ticket!.id!).subscribe({
      next: (response) => {
        console.log('Ticket eliminado exitosamente', response);
        this.snackBar.open('Ticket y sus dependencias eliminados', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/menu/list-tickets']);
      },
      error: (err) => {
        console.error('Error al eliminar el ticket:', err);
        this.snackBar.open('Error al eliminar el ticket', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openPreviewSolucion(tareaCodi: string) {
    this.dialog.open(PreviewSolucionComponent, {
      width: '600px',
      data: { tareaCodi }
    });
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
      },
      error: (error) => console.log("Error al cargar el Historial", error)
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

  async navigateToTicketSheetCreate(ticket: Ticket): Promise<void> {
    try {
      const asignaciones = await this.asignarCategoriaService.getAsignacionCategoriaByBreq(ticket.ticketID).toPromise();
      if (asignaciones && asignaciones.length > 0) {
        const dialogRef = this.dialog.open(AsignarCategoriaDialogComponent, {
          width: '300px',
          data: { categorias: asignaciones, allCategorias: this.categorias }
        });
  
        dialogRef.afterClosed().subscribe(async (result: AsignarCategoria | undefined) => {
          if (result) {
            const asignarCategoriaId = result.id;
            if (asignarCategoriaId) {
              this.router.navigate(['menu', 'ticket-sheet-create', asignarCategoriaId]).catch(error => {
                console.error('Error en la redirección:', error);
              });
            } else {
              this.snackBar.open('No se encontró una asignación de coordinador para esta categoría.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['mat-toolbar', 'mat-warn']
              });
            }
          }
        });
      } else {
        this.snackBar.open('No se encontraron asignaciones para este ticket.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    } catch (error) {
      console.error('Error al navegar a la creación de la hoja del ticket:', error);
      this.snackBar.open('Error al navegar a la creación de la hoja del ticket.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }
  
  async navigateToTicketSheetCreateOnly(ticket: Ticket): Promise<void> {
    try {
      const asignarCategoriaId = await this.getAsignarCategoriaId(ticket);
      if (asignarCategoriaId) {
        this.router.navigate(['menu', 'ticket-sheet-create', asignarCategoriaId]).catch(error => {
          console.error('Error en la redirección:', error);
        });
      } else {
        this.snackBar.open('No se encontró una asignación de coordinador para este ticket.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    } catch (error) {
      console.error('Error al navegar a la creación de la hoja del ticket:', error);
      this.snackBar.open('Error al navegar a la creación de la hoja del ticket.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }
  
  navigateToTicketSheet(ticket: Ticket | null): void {
    if (!ticket) {
      console.error('El ticket es null o undefined');
      return;
    }
  
    if (this.userDetail?.cate_codi === '1' || this.userDetail?.rols_codi === '1' || this.userDetail?.rols_codi === '2') {
      this.navigateToTicketSheetCreate(ticket);
    } else {
      this.navigateToTicketSheetCreateOnly(ticket);
    }
  }

  async getAsignarCategoriaId(ticket: Ticket): Promise<string | null> {
    try {
      const asignaciones = await this.asignarCategoriaService.getAsignarCategoriaByBreqCodiAndCateCodi(ticket.ticketID, this.userDetail!.cate_codi).toPromise();
      if (asignaciones && asignaciones.length > 0) {
        const asignacion = asignaciones.find(a => a.cate_codi === this.userDetail!.cate_codi);
        console.log("ID"+asignacion!.id)
        return asignacion ? asignacion.id ?? null : null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener AsignarCoordinador:', error);
      return null;
    }
  }

  showCreate(ticketEstado: string): boolean {
    if (ticketEstado === 'Cerrado') {
      return false;
    }
    const puedeCrear = this.userDetail?.cate_codi === '1' || this.userDetail?.rols_codi === '1' || this.userDetail?.rols_codi === '2';
    return puedeCrear;
  }

  goBack(): void {
    this.location.back();
  }
  
}
  

