import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from 'src/app/services/ticket.service';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { ViaRecepcionService } from 'src/app/services/selects/ViaRecepcion/via-recepcion.service';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { ReportService } from 'src/app/services/report/report.service';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service';
import { Ticket } from 'src/app/interfaces/ticket';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { PageEvent } from '@angular/material/paginator';
import { AsignarCategoriaDialogComponent } from '../../shared/asignar-categoria-dialog/asignar-categoria-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/interfaces/paginatedResponse';
import { SignalrService } from 'src/app/services/signalr.service';
import { TicketActionsService } from 'src/app/services/actions/ticket-actions.service';

@Component({
  selector: 'app-hdesk-list',
  templateUrl: './hdesk-list.component.html',
  styleUrls: ['./hdesk-list.component.css'],
})
export class HdeskListComponent implements OnInit {
  
  @ViewChild('menu', { static: false }) menuElement!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showORGNMenu && this.menuElement && this.menuElement.nativeElement && !this.menuElement.nativeElement.contains(event.target)) {
      this.showORGNMenu = false;
      this.cdr.detectChanges();
    }
  }

  currentPage = 1;
  totalItems = 0;
  pageSize = 10;
  aplicarFiltroPidm = '';
  unid_codi = '';
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  organizaciones: Organizacion[] = [];
  categorias: Categoria[] = [];
  prioridades: Prioridad[] = [];
  tipologias: Tipologia[] = [];
  vias: viaRecepcion[] = [];

  searchTermsORGN = new Subject<string>();
  searchQueryORGN = '';

  organizacionMap: { [codigo: string]: string } = {};
  prioridadMap: { [codigo: string]: string } = {};
  tipologiaMap: { [codigo: string]: string } = {};

  userDetail: UserDetail | null = null;

  selectedOrganizacion: string = '';
  selectedTipologia: string = '';
  selectedCategoria: string = '';
  selectedPrioridad: string = '';
  selectedEstado: string = '';
  selectedFechaInicio: Date | null = null;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = 0;
  selectedUnidad: string = '';

  showORGNMenu = false;

  searchTicketId: string = '';
  ultimoSelectUsado: string = '';
  imagenUsuario: string = '';
  private estaAplicandoFiltros = false;

  months = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 },
  ];

  constructor(
    private ticketService: TicketService,
    private organizacionService: OrganizacionService,
    private categoriaService: CategoriaService,
    private viaRecepcionService: ViaRecepcionService,
    private prioridadService: PrioridadService,
    private tipologiaService: TipologiaService,
    private reportService: ReportService,
    private matIconRegistry: MatIconRegistry,
    private unidadService: UnidadService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private signalrService: SignalrService,
    private asignarCategoriaService: AsignarCategoriaService,
    private ticketActionsService: TicketActionsService,
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
  
    // Asegurarse de que unid_codi se inicializa desde userDetail
    this.unid_codi = this.userDetail?.unid_codi || '';
  
    if (this.unid_codi) {
      console.log("Cargando tickets para unidad desde ngOnInit:", this.unid_codi);
      this.filtroCargarTickets();
      this.cargarDependencias();
    }
  
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects.includes('/menu/list-tickets')) {
        this.unid_codi = this.userDetail?.unid_codi || '';
        console.log("Cargando tickets para unidad después de la navegación:", this.unid_codi);
        this.filtroCargarTickets();
      }
    });
  
    this.initializeSearchORGN();
    this.setupSignalR();
  
    // Suscribirse al observable de UnidadService para detectar cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      if (unid_codi && unid_codi !== 'Seleccione') {
        console.log("Cambio de unidad detectado:", unid_codi);
        this.unid_codi = unid_codi;
        this.filtroCargarTickets(); 
        this.cargarDependencias(); // Recargar los tickets basados en la nueva unidad seleccionada
      }
    });

    this.ticketActionsService.verTicketsPropios$.subscribe(verPropios => {
      if (verPropios) {
        this.verTicketsPropios();
        this.ticketActionsService.clearVerTicketsPropios();  // Limpiar el estado después de aplicar el filtro
      }
    });
    this.ticketActionsService.verTodosLosTickets$.subscribe(verTodos => {
      if (verTodos) {
        this.filtroCargarTickets();
        this.ticketActionsService.clearVerTodosLosTickets();  // Limpiar el estado después de aplicar el filtro
      }
    });
    /*
    this.ticketActionsService.verTicketsAbiertos$.subscribe(verAbiertos => {
      if (verAbiertos) {
        this.verTicketsRecibidos();
        this.ticketActionsService.clearVerTicketsRecibidos();  // Limpiar el estado después de aplicar el filtro
      }
    });
    this.ticketActionsService.verTicketsRevisados$.subscribe(verRevisados => {
      if (verRevisados) {
        this.verTicketsRevisados();
        this.ticketActionsService.clearVerTicketsRevisados();  // Limpiar el estado después de aplicar el filtro
      }
    });
    this.ticketActionsService.verTicketsEnProceso$.subscribe(verProceso => {
      if (verProceso) {
        this.verTicketsEnProceso();
        this.ticketActionsService.clearVerTicketsEnProceso();  // Limpiar el estado después de aplicar el filtro
      }
    });
    this.ticketActionsService.verTicketsCerrados$.subscribe(verCerrado => {
      if (verCerrado) {
        this.verTicketsCerrados();
        this.ticketActionsService.clearVerTicketsCerrados();  // Limpiar el estado después de aplicar el filtro
      }
    });
    */
  }
  
  
  

  ngOnDestroy() {
    this.signalrService.removeNewTicketListener();
    this.signalrService.removeTicketDeletedListener();
    this.signalrService.removeTicketUpdatedListener();
  }

  setupSignalR() {
    this.signalrService.startConnection().then(() => {
      this.signalrService.addNewTicketListener();
      this.signalrService.addTicketDeletedListener();
      this.signalrService.addTicketUpdatedListener();
    });

    this.signalrService.newTicket$.subscribe((newTicket: Ticket) => {
      this.totalItems += 1;
      this.filtroCargarTickets();
      this.cdr.detectChanges();
    });

    this.signalrService.ticketDeleted$.subscribe((ticketId: string) => {
      this.totalItems -= 1;
      this.filtroCargarTickets();
      this.cdr.detectChanges();
    });

    this.signalrService.ticketUpdated$.subscribe((updatedTicket: Ticket) => {
      this.filtroCargarTickets();
      this.cdr.detectChanges();
    });
  }


  toogleORGNMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showORGNMenu = !this.showORGNMenu;
  }

  processTicketDates(tickets: Ticket[]) {
    tickets.forEach(ticket => {
      const [datePart] = ticket.fechaCreacion.split(' - ');
      ticket.fechaCreacionFormatted = datePart;
    });
  }

  cargarDependencias() {
    this.cargarOrganizaciones();
    this.cargarCategorias();
    this.cargarPrioridades();
    this.cargarTipologias();
    this.filtroCargarTickets();
  }

  cargarOrganizaciones(): void {
    this.organizacionService.getOrganizaciones().subscribe({
        next: (data) => {
            this.organizaciones = data;
            this.organizacionMap = {};
            data.forEach((organizacion) => {
                this.organizacionMap[organizacion.codi!] = organizacion.descripcion;
            });
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Error al obtener organizaciones', error);
        }
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategoriasByUnidCodi(this.unid_codi).subscribe(data => {
      this.categorias = data;
    });
  }

  cargarPrioridades() {
    this.prioridadService.getPrioridadByUnidCodi(this.unid_codi).subscribe({
      next: (data) => {
        this.prioridades = data;
        this.prioridadMap = {};
        data.forEach(p => {
          this.prioridadMap[p.codi!] = p.descripcion;
          if (p.imagen) {
            this.matIconRegistry.addSvgIcon(
              `priority_${p.codi}`,
              this.domSanitizer.bypassSecurityTrustResourceUrl(p.imagen)
            );
          }
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener prioridades', error);
      }
    });
  }

  cargarTipologias() {
    this.tipologiaService.getTipologia().subscribe({
      next: (data) => {
        this.tipologias = data;
        this.tipologiaMap = {};
        data.forEach(tipologia => {
          this.tipologiaMap[tipologia.codi!] = tipologia.descripcion;
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener tipologías', error);
      }
    });
  }

  filtroCargarTickets() {
    if (this.userDetail) {
      const { rols_codi,idUsuario, cate_codi, cargo_codi, pidm } = this.userDetail;
      let observable: Observable<any>;
  
      console.log("Cargando tickets para unidad:", this.unid_codi);
  
      if (rols_codi === '1' || rols_codi === '2' || cate_codi === '1') {
        this.aplicarFiltroPidm = "todos";
        observable = this.ticketService.getTicketsPaginado(this.currentPage, this.pageSize, rols_codi, cate_codi, this.unid_codi);
      } else if (rols_codi === '3' && (cargo_codi === '1' || cargo_codi === '2' || cargo_codi === '3')) {
        this.aplicarFiltroPidm = "coordinador";
        observable = this.ticketService.getTicketsByCategoriesPaginado([cate_codi], this.currentPage, this.pageSize, rols_codi, cate_codi, this.unid_codi);
      } else if (rols_codi === '3') {
        this.aplicarFiltroPidm = "usuario";
        observable = this.ticketService.getTicketsByUsuarioAndCreadorWithPagination(pidm,this.userDetail.idUsuario, this.unid_codi,this.currentPage,this.pageSize);
      } else if (cargo_codi === '1' || cargo_codi === '2' || cargo_codi === '3') {
        this.aplicarFiltroPidm = "coordinador";
        observable = this.ticketService.getTicketsByCategoriesPaginado([cate_codi], this.currentPage, this.pageSize, rols_codi, cate_codi, this.unid_codi);
      } else {
        this.aplicarFiltroPidm = "usuario";
        observable = this.ticketService.getTicketsByUsuarioAndCreadorWithPagination(pidm,this.userDetail.idUsuario, this.unid_codi,this.currentPage,this.pageSize);
      }
  
      observable.subscribe({
        next: (response: any) => {
          if ('tickets' in response) {
            this.tickets = response.tickets;
            this.totalItems = response.totalItems;
          } else {
            this.tickets = response;
            this.totalItems = response.length;
          }
          this.processTicketDates(this.tickets);
          this.filteredTickets = [...this.tickets];
          this.procesarTickets(this.filteredTickets);
        },
        error: (error: any) => {
          console.error('Failed to fetch tickets:', error);
          this.tickets = [];
          this.filteredTickets = [];
        }
      });
  
      this.cdr.detectChanges();
    }
  }
  

  
cargarTicketsPorUsuarioAsignado(pidm: string, unidCodi: string) {
  this.ticketService.getTicketsByUsuarioAsignado(pidm, unidCodi).subscribe({
    next: (tickets) => {
      this.tickets = tickets;
      this.processTicketDates(this.tickets);
      this.filteredTickets = [...this.tickets];
      this.totalItems = this.tickets.length;
    },
    error: (error) => console.error('Error fetching tickets by user:', error)
  });
}

  cargarTodosLosTickets() {
    this.ticketService.getTicketsPaginado(this.currentPage, this.pageSize, this.userDetail!.rols_codi, this.userDetail!.cate_codi).subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.processTicketDates(this.tickets);
        this.totalItems = response.totalItems;
        this.filteredTickets = [...this.tickets];
      },
      error: (error) => console.error('Failed to fetch tickets:', error)
    });
  }

  convertirFecha(fecha: string): Date {
    const partes = fecha.split(' ');
    const fechaPartes = partes[0].split('/');
    const horaPartes = partes[2].split(':');

    let hora = parseInt(horaPartes[0]);
    const minuto = parseInt(horaPartes[1]);
    const esPM = partes[3] === 'p. m.' && hora < 12;
    const esAM = partes[3] === 'a. m.' && hora === 12;

    if (esPM) hora += 12;
    if (esAM) hora = 0;

    const mes = fechaPartes[1].padStart(2, '0');
    const dia = fechaPartes[0].padStart(2, '0');

    const fechaISO = `${fechaPartes[2]}-${mes}-${dia}T${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;

    return new Date(fechaISO);
  }

  cargarTicketsPorCateCodiAsignar(cateCodisAsignar: string[]) {
    this.ticketService.getTicketsByCategoriesPaginado(cateCodisAsignar, this.currentPage, this.pageSize, this.userDetail!.rols_codi, this.userDetail!.cate_codi).subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.processTicketDates(this.tickets);
        this.totalItems = response.totalItems;
        this.filteredTickets = [...this.tickets];
      },
      error: (error) => {
        console.error('Error fetching tickets by categories with pagination', error);
        this.tickets = [];
        this.filteredTickets = [];
      }
    });
  }

  handlePage(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  
    // Verificar si hay filtros activos
    const hayFiltrosActivos = this.selectedOrganizacion || this.selectedCategoria || this.selectedPrioridad || this.selectedEstado || this.selectedFechaInicio;
  
    if (hayFiltrosActivos) {
      this.aplicarFiltros();
    } else {
      this.filtroCargarTickets();
    }
  }

  procesarTickets(tickets: Ticket[]) {
    tickets.forEach(ticket => {
      ticket.urlImagenUsuario = this.obtenerUrlImagen(ticket.idUsuario, 1);
    });
    this.cdr.detectChanges();
  }

  actualizarUrlImagen(ticket: Ticket, intento: number) {
    if (intento < 3) {
      ticket.urlImagenUsuario = this.obtenerUrlImagen(ticket.idUsuario, intento);
    } else {
      ticket.urlImagenUsuario = 'assets/UserSinFoto.svg';
    }
  }
  
  obtenerUrlImagen(idUsuario: string, intento: number): string {
    if (intento === 1) {
      return `https://static.upao.edu.pe/upload/f1/${idUsuario}.jpg`;
    } else {
      return `https://static.upao.edu.pe/upload/f/${idUsuario}.jpg`;
    }
  }

  getOrganizacionDescripcion(codigo: string): string {
    return this.organizacionMap[codigo] || '';
  }

  getPrioridadDescripcion(codigo: string): string {
    return this.prioridadMap[codigo] || '';
  }

  getTipologiaDescripcion(codigo: string): string {
    return this.tipologiaMap[codigo] || '';
  }

  showCreate(ticketEstado: string): boolean {
    if (ticketEstado === 'Cerrado') {
      return false;
    }
    const puedeCrear = this.userDetail?.cate_codi === '1' || this.userDetail?.rols_codi === '1' || this.userDetail?.rols_codi === '2'||this.userDetail?.idUsuario=="000005741";
    return puedeCrear;
  }

manejarErrorImagen(ticket: Ticket): void {
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

  onOrganizacionChange(): void {
    this.aplicarFiltros();
    this.showORGNMenu = false; 
    this.cdr.detectChanges();
  }
  
  
  onCategoriaChange(): void {
    this.aplicarFiltros();
  }
  
  onPrioridadChange(): void {
    this.aplicarFiltros();
  }
  
  onEstadoChange(): void {
    this.aplicarFiltros();
  }
  
  onFechaInicioChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.selectedOrganizacion = '';
    this.selectedTipologia = '';
    this.selectedPrioridad = '';
    this.selectedCategoria = '';
    this.selectedEstado = '';
    this.selectedFechaInicio = null;

    this.filtroCargarTickets();
  }

  limpiarSeleccionExcepto(selectUsado: string): void {
    if (selectUsado !== 'organizacion') {
      this.selectedOrganizacion = '';
    }
    if (selectUsado !== 'categoria') {
      this.selectedCategoria = '';
    }
    if (selectUsado !== 'estado') {
      this.selectedEstado = '';
    }
    if (selectUsado !== 'prioridad') {
      this.selectedPrioridad = '';
    }
    if (selectUsado !== 'fechaInicio') {
      this.selectedFechaInicio = null;
    }
  }

  mostrarSelectorCategoria(): boolean {
    return !!(this.userDetail && (this.userDetail.rols_codi === '1' || this.userDetail.rols_codi === '2' || this.userDetail.cate_codi === '1'));
  }

  onSearchTickets(): void {
    if (this.searchTicketId) {
      const searchTerm = this.searchTicketId.toLowerCase();
      const { rols_codi, cate_codi, pidm } = this.userDetail!;
  
      this.ticketService.searchTicketsWithFilters(
        searchTerm,
        this.selectedOrganizacion ? this.selectedOrganizacion : '',
        this.selectedCategoria ? this.selectedCategoria : '',
        this.selectedPrioridad ? this.selectedPrioridad : '',
        this.selectedEstado ? this.selectedEstado : '',
        this.selectedFechaInicio,
        rols_codi,
        cate_codi,
        pidm,
        this.aplicarFiltroPidm,
        this.unid_codi,
        this.currentPage,
        this.pageSize
      ).subscribe({
        next: (response: PaginatedResponse) => {
          this.tickets = response.tickets; // Accede a la propiedad 'tickets'no

          this.processTicketDates(this.tickets);
          this.filteredTickets = [...this.tickets];
          this.procesarTickets(this.filteredTickets);
          this.totalItems = response.totalItems; // Accede a la propiedad 'totalItems'
        },
        error: error => {
          console.error('Ticket no encontrado:', error);
          this.snackBar.open('Error en la búsqueda de organización.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      });
    } else {
      this.filtroCargarTickets();
    }
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

  aplicarFiltros(): void {
    if (this.estaAplicandoFiltros) {
        return;
    }

    this.estaAplicandoFiltros = true;

    const { rols_codi, cate_codi, pidm, unid_codi } = this.userDetail!;

    this.ticketService.searchTicketsWithFilters(
      this.searchTicketId ? this.searchTicketId.toLowerCase() : '',
      this.selectedOrganizacion ? this.selectedOrganizacion : '',
      this.selectedCategoria ? this.selectedCategoria : '',
      this.selectedPrioridad ? this.selectedPrioridad : '',
      this.selectedEstado ? this.selectedEstado : '',
      this.selectedFechaInicio,
      rols_codi,
      cate_codi,
      pidm,
      this.aplicarFiltroPidm,
      this.unid_codi,  // Asegúrate de enviar el unid_codi aquí
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: PaginatedResponse) => {
        this.tickets = response.tickets;  // Accede a la propiedad 'tickets'
        this.totalItems = response.totalItems;  // Accede a la propiedad 'totalItems'
        this.filteredTickets = [...this.tickets];
        this.estaAplicandoFiltros = false;
        this.processTicketDates(this.tickets);
        this.procesarTickets(this.filteredTickets);

        if (this.tickets.length === 0) {
          this.snackBar.open('No se encontraron tickets con los filtros proporcionados.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-warn']
          });
        }
      },
      error: (error) => {
        console.error('Error al aplicar filtros:', error);
        this.estaAplicandoFiltros = false;
        this.snackBar.open('Error al aplicar filtros. Inténtalo de nuevo.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });
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
  
  navigateToTicketSheet(ticket: Ticket): void {
    if (this.userDetail?.cate_codi === '1' || this.userDetail?.rols_codi === '1' || this.userDetail?.rols_codi === '2') {
      this.navigateToTicketSheetCreate(ticket);
    } else {
      this.navigateToTicketSheetCreateOnly(ticket);
    }
  }


  

  async getAsignarCategoriaIdForCategoria(ticket: Ticket, cateCodi: string): Promise<string | null> {
    try {
      const asignaciones = await this.asignarCategoriaService.getAsignarCategoriaByBreqCodiAndCateCodi(ticket.ticketID, cateCodi).toPromise();
      if (asignaciones && asignaciones.length > 0) {
        const asignacion = asignaciones.find(a => a.cate_codi === cateCodi);
        return asignacion ? asignacion.id ?? null : null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener AsignarCoordinador:', error);
      return null;
    }
  }

  verTicketsPropios() {
    this.limpiarFiltros();
    const pidm = this.userDetail?.pidm || ''; // PIDM para tickets asignados
    const idUsuarioAdd = this.userDetail?.idUsuario || ''; // ID Usuario para tickets creados
    const unidCodi = this.unid_codi; 
    const page = 1;
    const pageSize = 10; 
    
    this.tickets = [];
    this.filteredTickets=[];

    console.log("PROPIOS")

    
    if (pidm && idUsuarioAdd) {
      // Llamada para los tickets creados por el usuario
      this.ticketService.getTicketsByUsuarioAndCreadorWithPagination(pidm, idUsuarioAdd, unidCodi, page, pageSize).subscribe({
        next: (response: PaginatedResponse) => {
          this.tickets = response.tickets;
          this.processTicketDates(this.tickets);
          this.totalItems = response.totalItems;
          this.filteredTickets = [...this.tickets];
          this.procesarTickets(this.filteredTickets);
          this.cdr.detectChanges();
        },
        error: err => console.error('Error al obtener tickets creados:', err)
      });
    } else {
      console.error('No se encontraron los parámetros necesarios.');
    }
  }
  
  verTicketsRecibidos(){
    this.selectedEstado = "Recibido"
    this.aplicarFiltros();
  }
  verTicketsRevisados(){
    this.selectedEstado = "Revisado"
    this.aplicarFiltros();
  }
  verTicketsEnProceso(){
    this.selectedEstado = "En Proceso"
    this.aplicarFiltros();
  }
  verTicketsCerrados(){
    this.selectedEstado = "Cerrado"
    this.aplicarFiltros();
  }
  
  
  
  
}
