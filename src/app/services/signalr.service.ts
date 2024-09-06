import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Ticket } from '../interfaces/ticket';
import { AsignarTicket } from '../interfaces/Asignacion/AsignarTicket';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';  // Asegúrate de que la ruta es correcta
import { RegistrarTareas } from '../interfaces/RegistrarTareas/RegistrarTareas';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  
  private hubConnection!: signalR.HubConnection;
  private ticketDeletedSource = new Subject<string>();
  private newTicketSource = new Subject<Ticket>();
  private ticketUpdatedSource = new Subject<Ticket>();

  private taskDeletedSource = new Subject<string>();
  private newTaskSource = new Subject<AsignarTicket>();
  private taskUpdatedSource = new Subject<AsignarTicket>();

  private assignDeletedSource = new Subject<string>();
  private newAssignSource = new Subject<RegistrarTareas>();
  private assignUpdatedSource = new Subject<RegistrarTareas>();

  ticketDeleted$ = this.ticketDeletedSource.asObservable();
  newTicket$ = this.newTicketSource.asObservable();
  ticketUpdated$ = this.ticketUpdatedSource.asObservable();

  taskDeleted$ = this.taskDeletedSource.asObservable();
  newTask$ = this.newTaskSource.asObservable();
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  assignDeleted$ = this.assignDeletedSource.asObservable();
  newAssign$ = this.newAssignSource.asObservable();
  assignUpdated$ = this.assignUpdatedSource.asObservable();


  public startConnection = (): Promise<void> => {
    console.log(environment.ticketsHubUrl)
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.ticketsHubUrl, {
        withCredentials: true
      })  
      .build();
  
    return this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  //TICKET

  ticketDeleted(ticketId: string) {
    this.ticketDeletedSource.next(ticketId);
  }

  newTicketReceived(ticket: Ticket) {
    this.newTicketSource.next(ticket);
  }

  ticketUpdated(ticket: Ticket) {
    this.ticketUpdatedSource.next(ticket);
  }

  //TAREAS

  taskDeleted(taskId: string) {
    this.taskDeletedSource.next(taskId);
  }

  newTaskReceived(task: AsignarTicket) {
    this.newTaskSource.next(task);
  }

  taskUpdated(task: AsignarTicket) {
    this.taskUpdatedSource.next(task);
  }

  //ASIGN

  assignDeleted(assignId: string) {
    this.assignDeletedSource.next(assignId);
  }

  newAssignReceived(assign: RegistrarTareas) {
    this.newAssignSource.next(assign);
  }

  assignUpdated(assign: RegistrarTareas) {
    this.assignUpdatedSource.next(assign);
  }

  //TICKETS

  public addTicketDeletedListener = () => {
    this.hubConnection.on('ReceiveTicketDeletion', (ticketId: string) => {
      this.ticketDeleted(ticketId);
    });
  }

  public addNewTicketListener = () => {
    this.hubConnection.on('ReceiveNewTicket', (ticket: Ticket) => {
      this.newTicketReceived(ticket);
    });
  }

  public addTicketUpdatedListener = () => {
    this.hubConnection.on('ReceiveTicketUpdate', (ticket: Ticket) => {
      this.ticketUpdated(ticket);
    });
  }

  //TAREAS

  public addTaskDeletedListener = () => {
    this.hubConnection.on('ReceiveTaskDeletion', (taskId: string) => {
      this.taskDeleted(taskId);
    });
  }

  public addNewTaskListener = () => {
    this.hubConnection.on('ReceiveNewTask', (task: AsignarTicket) => {
      this.newTaskReceived(task);
    });
  }

  public addTaskUpdatedListener = () => {
    this.hubConnection.on('ReceiveTaskUpdate', (task: AsignarTicket) => {
      this.taskUpdated(task);
    });
  }

  //ASIGNAR

  public addAssignDeletedListener = () => {
    this.hubConnection.on('ReceiveAssignDeletion', (assignId: string) => {
      this.assignDeleted(assignId);
    });
  }

  public addNewAssignListener = () => {
    this.hubConnection.on('ReceiveNewAssign', (assign: RegistrarTareas) => {
      this.newAssignReceived(assign);
    });
  }

  public addAssignUpdatedListener = () => {
    this.hubConnection.on('ReceiveAssignUpdate', (assign: RegistrarTareas) => {
      this.assignUpdated(assign);
    });
  }

  //TICKETS
  public removeTicketUpdatedListener() {
    this.hubConnection.off('ReceiveTicketUpdate');
  }

  public removeTicketDeletedListener() {
    this.hubConnection.off('ReceiveTicketDeletion');
  }
  
  public removeNewTicketListener() {
    this.hubConnection.off('ReceiveNewTicket');
  }

  //TAREAS

  public removeTaskUpdatedListener() {
    this.hubConnection.off('ReceiveTaskUpdate');
  }

  public removeTaskDeletedListener() {
    this.hubConnection.off('ReceiveTaskDeletion');
  }
  
  public removeNewTaskListener() {
    this.hubConnection.off('ReceiveNewTask');
  }

  //ASIGNAR

  public removeAssignUpdatedListener() {
    this.hubConnection.off('ReceiveAssignUpdate');
  }

  public removeAssignDeletedListener() {
    this.hubConnection.off('ReceiveAssignDeletion');
  }
  
  public removeNewAssignListener() {
    this.hubConnection.off('ReceiveNewAssign');
  }
}
