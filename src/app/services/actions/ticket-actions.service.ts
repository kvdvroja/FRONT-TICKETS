import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketActionsService {

  private verTicketsPropiosSubject = new BehaviorSubject<boolean>(false);
  verTicketsPropios$ = this.verTicketsPropiosSubject.asObservable();

  private verTodosLosTicketsSubject = new BehaviorSubject<boolean>(false);
  verTodosLosTickets$ = this.verTodosLosTicketsSubject.asObservable();

  private verTicketsAbiertosSubject = new BehaviorSubject<boolean>(false);
  verTicketsAbiertos$ = this.verTicketsAbiertosSubject.asObservable();
  
  private verTicketsCerradosSubject = new BehaviorSubject<boolean>(false);
  verTicketsCerrados$ = this.verTicketsCerradosSubject.asObservable();

  private verTicketsRevisadosSubject = new BehaviorSubject<boolean>(false);
  verTicketsRevisados$ = this.verTicketsRevisadosSubject.asObservable();
  
  private verTicketsEnProcesoSubject = new BehaviorSubject<boolean>(false);
  verTicketsEnProceso$ = this.verTicketsEnProcesoSubject.asObservable();

  triggerVerTicketsPropios() {
    this.verTicketsPropiosSubject.next(true);  // Emitir true cuando se active el evento
  }

  triggerVerTodosLosTickets() {
    this.verTodosLosTicketsSubject.next(true);  // Emitir true cuando se active el evento
  }

  triggerVerTicketsAbiertos() {
    this.verTicketsAbiertosSubject.next(true);  // Emitir true cuando se active el evento
  }

  triggerVerTicketsCerrados() {
    this.verTicketsCerradosSubject.next(true);  // Emitir true cuando se active el evento
  }

  triggerVerTicketsRevisados() {
    this.verTicketsRevisadosSubject.next(true);  // Emitir true cuando se active el evento
  }

  triggerVerTicketsEnProceso() {
    this.verTicketsEnProcesoSubject.next(true);  // Emitir true cuando se active el evento
  }




  clearVerTicketsPropios() {
    this.verTicketsPropiosSubject.next(false);  // Limpiar el estado después de aplicar el filtro
  }

  clearVerTodosLosTickets() {
    this.verTodosLosTicketsSubject.next(false);  // Limpiar el estado después de aplicar el filtro
  }

  clearVerTicketsRecibidos() {
    this.verTicketsAbiertosSubject.next(true);  // Emitir true cuando se active el evento
  }

  clearVerTicketsCerrados() {
    this.verTicketsCerradosSubject.next(true);  // Emitir true cuando se active el evento
  }

  clearVerTicketsEnProceso() {
    this.verTicketsAbiertosSubject.next(true);  // Emitir true cuando se active el evento
  }

  clearVerTicketsRevisados() {
    this.verTicketsCerradosSubject.next(true);  // Emitir true cuando se active el evento
  }
}
