import { Component, OnInit } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { Unidad } from 'src/app/interfaces/Unidad/unidad';
import { TicketService } from 'src/app/services/ticket.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TicketActionsService } from 'src/app/services/actions/ticket-actions.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class SidebarComponent implements OnInit {

  userDetail: UserDetail | null = null;
  unidades: Unidad[] = [];
  selectedUnidad: string = 'Seleccione';
  searchExactCodi: string = '';
  unid_codi = '';
  aplicarFiltroPidm = '';
  mostrarMisTickets: boolean = false;
  mostrarBotonVerTicketsPropios = false;
  flagbutton = false;

  constructor(
    private authService: AuthService,
    private unidadService: UnidadService,
    private ticketService: TicketService,
    private router: Router,
    private ticketActionsService: TicketActionsService
  ) {}

  cargarUnidades() {
    this.unidadService.getUnidades().subscribe(unidades => {
      this.unidades = unidades;
      //console.log("Unidades cargadas:", this.unidades);
    });
  }

  onUnidadChange(unidadCodi: string) {
    if (unidadCodi && unidadCodi !== 'Seleccione') {
      //console.log("Unidad seleccionada cambiada a:", unidadCodi);
      this.unid_codi = unidadCodi;
      this.unidadService.setUnidadSeleccionada(unidadCodi);
    }
  }

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unid_codi = this.userDetail?.unid_codi || '';

    // Configurar unidad inicial basada en userDetail.unid_codi
    if (this.userDetail?.unid_codi) {
      //console.log("Configurando unidad inicial desde userDetail:", this.userDetail.unid_codi);
      this.unidadService.initializeUnidadSeleccionada(this.userDetail.unid_codi);
    }

    // Cargar las unidades disponibles
    this.cargarUnidades();

    // Verificar la URL actual al cargar la página
    this.verificarMostrarBoton(this.router.url);

    // Suscribirse a eventos de navegación para manejar el botón cuando cambie la URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.verificarMostrarBoton(event.urlAfterRedirects);
      }
    });
  }

  verificarMostrarBoton(url: string) {
    const estaEnListadoTickets = url.includes('/menu/list-tickets');
    this.mostrarBotonVerTicketsPropios = estaEnListadoTickets;
    this.mostrarMisTickets = estaEnListadoTickets; // Mostrar "Mis Tickets" si estamos en la lista de tickets
  }

  showCreate(): boolean {
    const ocultarCreate = 
    this.userDetail?.cate_codi === '1' || 
    this.userDetail?.rols_codi === '1' || 
    this.userDetail?.rols_codi === '2' || 
    this.userDetail?.cargo_codi == "1" ||
    this.userDetail?.cargo_codi == "2";
    return ocultarCreate;
  }

  showSAdmin(): boolean {
    const ocultarCreate = 
    this.userDetail?.rols_codi === '1';
    return ocultarCreate;
  }

  buscarTicketPorCodi() {
    this.filtroCargarTickets();
    if (this.searchExactCodi.trim() !== '') {
      const searchTerm = this.searchExactCodi.toLowerCase();
      const { rols_codi, cate_codi, pidm } = this.userDetail!;

      this.ticketService.searchTicketsByTicketID(searchTerm, rols_codi, cate_codi, pidm, this.unid_codi, this.aplicarFiltroPidm).subscribe(ticket => {
        if (ticket && ticket[0].id) {
          this.router.navigate(['/menu/ticket-detail', ticket[0].id]);
        } else {
          console.error('No se encontró el ticket');
        }      
      }, error => {
          console.error('Error al buscar el ticket:', error);
        });
    }
  }

  filtroCargarTickets() {
    if (this.userDetail) {
      const { rols_codi, cate_codi, cargo_codi, pidm } = this.userDetail;
  
      //console.log("Cargando tickets para unidad:", this.unid_codi);
  
      if (rols_codi === '1' || rols_codi === '2' || cate_codi === '1') {
        this.aplicarFiltroPidm = "todos";
      } else if (rols_codi === '3' && (cargo_codi === '1' || cargo_codi === '2' || cargo_codi === '3')) {
        this.aplicarFiltroPidm = "coordinador";
      } else if (rols_codi === '3') {
        this.aplicarFiltroPidm = "usuario";
      } else if (cargo_codi === '1' || cargo_codi === '2' || cargo_codi === '3') {
        this.aplicarFiltroPidm = "coordinador";
      } else {
        this.aplicarFiltroPidm = "usuario";
      }
     }
  }

  verTicketsPropios() {
    this.ticketActionsService.triggerVerTicketsPropios(); // Activar la carga de tickets propios
  }

  verTicketsAbiertos() {
    this.ticketActionsService.triggerVerTicketsAbiertos(); // Activar la carga de tickets propios
  }

  verTicketsCerrados() {
    this.ticketActionsService.triggerVerTicketsCerrados(); // Activar la carga de tickets propios
  }

  verTicketsRevisados() {
    this.ticketActionsService.triggerVerTicketsRevisados(); // Activar la carga de tickets propios
  }

  verTicketsEnProceso() {
    this.ticketActionsService.triggerVerTicketsCerrados(); // Activar la carga de tickets propios
  }

  toggleMisTickets() {
        this.ticketActionsService.triggerVerTodosLosTickets();
  }

}
