import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from 'src/app/services/ticket.service';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service';
import { Ticket } from 'src/app/interfaces/ticket';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/interfaces/paginatedResponse';
import { SignalrService } from 'src/app/services/signalr.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-vinculacion',
  templateUrl: './vinculacion.component.html',
  styleUrls: ['./vinculacion.component.css']
})
export class VinculacionComponent implements OnInit {
  
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
  unid_codi = '';
  aplicarFiltroPidm = '';
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
  selectedTicketId: string | null = null;
  selectedEstado: string = '';
  selectedFechaInicio: Date | null = null;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = 0;
  selectedTickets: Ticket[] = []; 
  selectedTicketsByPage: { [page: number]: Ticket[] } = {};


  showORGNMenu = false;

  searchTicketId: string = '';
  ultimoSelectUsado: string = '';
  imagenUsuario: string = '';
  private estaAplicandoFiltros = false;

  constructor(
    private ticketService: TicketService,
    private organizacionService: OrganizacionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private signalrService: SignalrService,
    private asignarCategoriaService: AsignarCategoriaService,
    private dialogRef: MatDialogRef<VinculacionComponent>,
    private unidadService: UnidadService
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unid_codi = this.userDetail?.unid_codi || '';
    this.cargarDependencias();
    this.initializeSearchORGN();
    this.setupSignalR();

    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      if (unid_codi && unid_codi !== 'Seleccione') {
        console.log("Cambio de unidad detectado:", unid_codi);
        this.unid_codi = unid_codi;
        this.filtroCargarTickets();  // Recargar los tickets basados en la nueva unidad seleccionada
      }
    });

    setTimeout(() => {
      this.updateTicketSelectionState();
    }, 0);
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
      //}
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
    this.filtroCargarTickets();
  }

  filtroCargarTickets() {
    if (this.userDetail) {
      const { rols_codi, cate_codi, cargo_codi, pidm } = this.userDetail;
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
        observable = this.ticketService.getTicketsByUsuarioAsignado(pidm, this.unid_codi);
      } else if (cargo_codi === '1' || cargo_codi === '2' || cargo_codi === '3') {
        this.aplicarFiltroPidm = "coordinador";
        observable = this.ticketService.getTicketsByCategoriesPaginado([cate_codi], this.currentPage, this.pageSize, rols_codi, cate_codi, this.unid_codi);
      } else {
        this.aplicarFiltroPidm = "usuario";
        observable = this.ticketService.getTicketsByUsuarioAsignado(pidm, this.unid_codi);
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

  
  cargarTicketsPorUsuarioAsignado(pidm: string) {
    this.ticketService.getTicketsByUsuarioAsignado(pidm).subscribe({
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
          this.totalItems = response.totalItems; 
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
  
    const { rols_codi, cate_codi, pidm } = this.userDetail!;
  
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
      this.unid_codi,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: PaginatedResponse) => {
        this.tickets = response.tickets;
        this.totalItems = response.totalItems; 
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

  onTicketSelectionChange(event: any): void {
    const selectedOptions = event.source.selectedOptions.selected;
  
    this.selectedTicketsByPage[this.currentPage] = selectedOptions.map((option: any) => option.value);
  
    const allSelectedTickets = Object.values(this.selectedTicketsByPage).flat();
    this.selectedTickets = Array.from(new Set(allSelectedTickets.map(ticket => ticket.id)))
      .map(id => allSelectedTickets.find(ticket => ticket.id === id))
      .filter((ticket): ticket is Ticket => ticket !== undefined);
  
    this.updateTicketSelectionState();
    console.log('Tickets seleccionados:', this.selectedTickets);
  }
  

  handlePage(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.filtroCargarTickets();
    setTimeout(() => {
      const selectedTicketsOnCurrentPage = this.selectedTicketsByPage[this.currentPage] || [];
      this.filteredTickets.forEach(ticket => {
        ticket.selected = selectedTicketsOnCurrentPage.some(selectedTicket => selectedTicket.id === ticket.id);
      });
    }, 0);
  }

  updateTicketSelectionState(): void {
    this.filteredTickets.forEach(ticket => {
      ticket.selected = this.selectedTickets.some(selectedTicket => selectedTicket.id === ticket.id);
    });
    this.cdr.detectChanges();
  }
  
  vincularRequerimientos() {
    if (this.selectedTickets.length > 0) {
      console.log('Tickets seleccionados para vincular:', this.selectedTickets);
      this.dialogRef.close(this.selectedTickets);
    } else {
      console.error('No hay ningún ticket seleccionado.');
      this.dialogRef.close(null);
    }
  }
}
