import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AsignarTicketService } from 'src/app/services/Assign/asignar-ticket.service';
import { AsignarTicket } from 'src/app/interfaces/Asignacion/AsignarTicket';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { ProgresoService } from 'src/app/services/Progreso/progreso.service';
import { TrabajosService } from 'src/app/services/Trabajos/trabajos.service';
import { Progreso } from 'src/app/interfaces/Progreso/Progreso';
import { Trabajos } from 'src/app/interfaces/Trabajos/Trabajos';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { RegistrarTareas } from 'src/app/interfaces/RegistrarTareas/RegistrarTareas';
import { RegistrarTareasService } from 'src/app/services/RegistrarTareas/registrar-tareas.service';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { SubTareas } from 'src/app/interfaces/SubTareas/SubTareas';
import { SubTareasService } from 'src/app/services/SubTareas/sub-tareas.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { CreateBasicTareaAssignComponent } from '../create-basic-tarea-assign/create-basic-tarea-assign.component';
import { MatDialog } from '@angular/material/dialog';
import Quill from 'quill';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Solucion } from 'src/app/interfaces/Solucion/Solucion';
import { SolucionService } from 'src/app/services/Solucion/solucion.service';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { AddEtiquetaComponent } from '../add-etiqueta/add-etiqueta.component';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { RegistroEtiquetasService } from 'src/app/services/Etiqueta/registro-etiquetas.service';
import { Etiqueta } from 'src/app/interfaces/Etiqueta/Etiqueta';
import { EtiquetaService } from 'src/app/services/Etiqueta/etiqueta.service';
import { AddSolucionComponent } from '../add-solucion/add-solucion.component';

@Component({
  selector: 'app-detalle-tarea-ticket',
  templateUrl: './detalle-tarea-ticket.component.html',
  styleUrls: ['./detalle-tarea-ticket.component.css']
})
export class DetalleTareaTicketComponent implements OnInit, AfterViewInit {
  isEditingName: boolean = false;
  isEditingDescription: boolean = false;
  isEditingSolucion: boolean = false;
  editingIndex: number | null = null;
  originalDescription: string = '';
  originalSolucion: string = '';
  subTareas: SubTareas[] = [];
  usuariosAsignadosPorTarea: { [ran1Codi: string]: Usuarios[] } = {};
  usuarios: { [cate_codi: string]: Usuarios[] } = {};
  asignarTickets: AsignarTicket[] = [];
  progreso: Progreso[] = [];
  trabajos: Trabajos[] = [];
  asignarTicketNombre: string = '';
  selectedFechaInicio: Date | null = null;
  selectedFechaVencimiento: Date | null = null;
  recarga: string = '';

  etiquetas: Etiqueta[] = [];
  etiquetasSeleccionadas: Etiqueta[] = [];
  etiquetasFiltradas: Etiqueta[] = [];

  userDetail: UserDetail | null = null;
  asignarTicket: AsignarTicket = {
    codi: '',
    nombre: '',
    breq_codi: '',
    klog_codi: '',
    prog_codi: '',
    cate_codi: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    fecha_actividad: '',
    ind_estado: '',
    idUsuario: ''
  };

  public solucion : Solucion = {
    codi: '',
    ran1_codi: '',
    descripcion: '',
    num_revision: '',
    pidm: '',
    ind_paquete: '',
    ind_script: '',
    ind_bd: '',
    ind_forma: '',
    OTROS: '',
    modulo: '',
    extension: '',
    url: '',
    fechaActividad: '',
    idUsuario: ''
  }

  public nuevoHistorial: Historial = {
    codi: '',
    breq_codi: '',
    pidm: '',
    descripcion: '',
    tipo: '',
    fechaActividad: '',
    idUsuario: '', 
  };


  public editorInstance: Quill | null = null;
  descEditor: string = '';
  solucionEditor: string = '';
  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  constructor(
    public dialogRef: MatDialogRef<DetalleTareaTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string, tareaCodi: string, breqCodi: string },
    private asignacionService: AsignacionService,
    private registrarTareasService: RegistrarTareasService,
    private asignarTicketService: AsignarTicketService,
    private progresoService: ProgresoService,
    private trabajoService: TrabajosService,
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar,
    private subTareasService: SubTareasService,
    private solucionService: SolucionService,
    private dialog: MatDialog,
    private historialService: HistorialService,
    private authService: AuthService,
    private registroEtiquetasService: RegistroEtiquetasService,
    private etiquetaService:EtiquetaService
  ) { }

  public setEditorInstance(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.descEditor = this.editorInstance!.root.innerHTML;
    });
  }

  public setEditorInstanceSolucion(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.solucionEditor = this.editorInstance!.root.innerHTML;
    });
  }

  public onEditorChangeSolucion(event: any): void {
    const content = event.editor.root.innerHTML;
    this.asignarTicket.descripcion = content;
  }

  public onEditorChange(event: any): void {
    const content = event.editor.root.innerHTML;
    this.asignarTicket.descripcion = content;
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

  onFieldChange(componente: string, fieldName: string, newValue: any): void {
    let formattedValue = '';
  
    if (fieldName === 'trabajo') {
      newValue = this.getTrabajoDescripcion(newValue);
      formattedValue = newValue;
    }
    if (fieldName === 'progreso') {
      newValue = this.getProgresoDescripcion(newValue);
      formattedValue = newValue;
    }
    if (fieldName === 'fecha de inicio' || fieldName === 'fecha fin') {
      const date = new Date(newValue);
      formattedValue = this.formatFecha(date);
    }
  
    this.registrarHistorial('A', 'Detalle de Tarea', `En la tarea ${componente}. El campo ${fieldName} cambió a ${formattedValue}`);
  }

getProgresoDescripcion(codi: string): string {
  const progreso = this.progreso.find(cat => cat.codi === codi);
  return progreso ? progreso.nombre : 'Progreso no encontrado';
}

getTrabajoDescripcion(codi: string): string {
  const trabajo = this.progreso.find(cat => cat.codi === codi);
  return trabajo ? trabajo.nombre : 'Trabajo no encontrado';
}

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.solucion.descripcion = ' ';
    this.cargarAsignarTickets(this.data.tareaCodi);
    this.cargarProgreso();
    this.loadSubTareas();
    this.cargarTrabajo();
    this.loadSolucion(this.data.tareaCodi);
    this.cargarEtiquetas();
  }

  ngAfterViewInit(): void {
    if (this.editorInstance) {
        setTimeout(() => {
            if (this.asignarTicket.descripcion) {
                this.editorInstance!.root.innerHTML = this.asignarTicket.descripcion;
            }
        });
    }
}

  cargarAsignarTickets(tareaCodi: string): void {
    this.asignarTicketService.getAsignarTicketByCodi(tareaCodi).subscribe({
      next: (asignarTickets) => {
        this.asignarTickets = asignarTickets;
        if (asignarTickets.length > 0) {
          this.asignarTicket = asignarTickets[0];
          this.asignarTicketNombre = this.asignarTicket.nombre;
          this.selectedFechaInicio = this.parseFecha(this.asignarTicket.fecha_inicio);
          this.selectedFechaVencimiento = this.parseFecha(this.asignarTicket.fecha_fin);
          this.descEditor = this.asignarTicket.descripcion;
          if (this.editorInstance) {
            this.editorInstance.root.innerHTML = this.asignarTicket.descripcion;
          }
        }
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
            },
            error: (error) => console.error('Error al obtener registrar tareas:', error)
          });
        });
      },
      error: (error) => console.error('Error al obtener AsignarTickets:', error)
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  Save() {
    if (this.selectedFechaInicio && (this.selectedFechaInicio as any).toDate) {
      this.selectedFechaInicio = (this.selectedFechaInicio as any).toDate();
    }
    if (this.selectedFechaVencimiento && (this.selectedFechaVencimiento as any).toDate) {
      this.selectedFechaVencimiento = (this.selectedFechaVencimiento as any).toDate();
    }
  
    if (this.selectedFechaInicio && this.selectedFechaVencimiento) {
      if (this.selectedFechaInicio > this.selectedFechaVencimiento) {
        alert("La fecha de inicio debe ser menor que la fecha de vencimiento.");
        return;
      }
    }
  
    if (this.selectedFechaInicio instanceof Date) {
      this.asignarTicket.fecha_inicio = this.formatFecha(this.selectedFechaInicio);
    } else {
      this.asignarTicket.fecha_inicio = '';
    }
  
    if (this.selectedFechaVencimiento instanceof Date) {
      this.asignarTicket.fecha_fin = this.formatFecha(this.selectedFechaVencimiento);
    } else {
      this.asignarTicket.fecha_fin = '';
    }
  
    this.asignarTicketService.updateAsignarTicket(this.asignarTicket.codi, this.asignarTicket).subscribe({
      next: (recarga) => {
        if (recarga == null) {
          this.dialogRef.close("1");
        }
      },
      error: (error) => console.error('Error al actualizar el ticket:', error)
    });
  }
  
  cargarProgreso(): void {
    this.progresoService.getProgresos().subscribe({
      next: (data) => {
        this.progreso = data;
      },
      error: (error) => console.error('Error al obtener los progresos', error)
    });
  }

  cargarTrabajo(): void {
    this.trabajoService.getTrabajos().subscribe({
      next: (data) => {
        this.trabajos = data;
      },
      error: (error) => console.error('Error al obtener los Trabajos', error)
    });
  }

  parseFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    const [diaMes, hora] = fechaStr.split(' - ');
    const [dia, mes, anio] = diaMes.split('/');
    const [hora12, minuto, periodo] = hora?.match(/(\d+):(\d+)\s?(a\.?m\.?|p\.?m\.?)/i)?.slice(1, 4) || ['12', '00', 'a. m.'];

    let horas = parseInt(hora12, 10) || 0;
    if (periodo.toLowerCase().includes('p') && horas < 12) {
      horas += 12;
    } else if (periodo.toLowerCase().includes('a') && horas === 12) {
      horas = 0;
    }
    return new Date(+anio, +mes - 1, +dia, horas, parseInt(minuto, 10));
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

  deleteAsignarTicket(): void {
    const snackBarRef = this.snackBar.open('¿Estás seguro de que deseas eliminar esta tarea?', 'Eliminar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    snackBarRef.onAction().subscribe(() => {
      this.asignarTicketService.deleteAsignarTicketConTareas(this.asignarTicket.codi).subscribe({
        next: () => {
          this.snackBar.open('Ticket eliminado correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.dialogRef.close("1");
        },
        error: (error) => {
          console.error('Error al eliminar el ticket:', error);
          this.snackBar.open('Error al eliminar el ticket', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    });
  }

  startEditingName() {
    this.isEditingName = true;
  }

  finishEditingName() {
    this.isEditingName = false;
    this.updateAsignarTicketNombre();
  }


  finishEditingDescription() {
    this.isEditingDescription = false;
    this.updateAsignarTicketDescription();
  }

  finishEditingSolucion() {
    this.isEditingSolucion = false;
    this.updateAsignarTicketDescription();
  }



  updateAsignarTicketNombre() {
    this.asignarTicket.nombre = this.asignarTicketNombre;
    this.asignarTicketService.updateAsignarTicket(this.asignarTicket.codi, this.asignarTicket).subscribe({
      next: () => {
        this.snackBar.open('Nombre del ticket actualizado', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => console.error('Error al actualizar el nombre del ticket:', error)
    });
  }

  loadSubTareas(): void {
    this.subTareasService.getSubTareasByRan1Codi(this.data.tareaCodi).subscribe({
      next: (data) => {
        this.subTareas = data;
      },
      error: (error) => {
        console.error('Error al cargar subtareas:', error);
      }
    });
  }

  addSubTarea(): void {
    const newSubTarea: SubTareas = {
      codi: "",
      ran1_codi: this.data.tareaCodi,
      pidm: '',
      nombre: 'Nueva sub tarea',
      ind_atendido: 'Abierto',
      fechaActividad: new Date().toISOString(),
      idUsuario: this.userDetail!.idUsuario
    };

    this.subTareasService.createSubTarea(newSubTarea).subscribe({
      next: (data) => {
        this.subTareas.push(data);
        this.registrarHistorial("R","Detalle de tarea",("Se agregó una subtarea a la tarea: "+this.asignarTicket.nombre))
      },
      error: (error) => {
        console.error('Error al crear subtarea:', error);
      }
    });
  }

  toggleSubTareaStatus(subTarea: SubTareas): void {
    subTarea.ind_atendido = subTarea.ind_atendido === 'Abierto' ? 'Cerrado' : 'Abierto';
    this.updateSubTarea(subTarea);
  }

  updateSubTarea(subTarea: SubTareas): void {
    this.subTareasService.updateSubTarea(subTarea.id!, subTarea).subscribe({
      next: () => {
        this.snackBar.open('Subtarea actualizada', 'Cerrar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('Error al actualizar subtarea:', error);
      }
    });
  }

  deleteSubTarea(id: string): void {
    this.subTareasService.deleteSubTarea(id).subscribe({
      next: () => {
        this.subTareas = this.subTareas.filter(subTarea => subTarea.id !== id);
        this.snackBar.open('Subtarea eliminada', 'Cerrar', {
          duration: 2000,
        });
        this.registrarHistorial("E","Detalle de tarea",("Se Eliminó una subtarea en la tarea: "+this.asignarTicket.nombre))
      },
      error: (error) => {
        console.error('Error al eliminar subtarea:', error);
      }
    });
  }

  startEditingSubTarea(subTarea: SubTareas, index: number): void {
    this.editingIndex = index;
  }
  
  finishEditingSubTarea(subTarea: SubTareas): void {
    this.editingIndex = null;
    this.updateSubTarea(subTarea);
  }

  OpenAsignInDetalle(): void {
    const dialogRef = this.dialog.open(CreateBasicTareaAssignComponent, {
      width: '800px',
      data: { cateCodi: this.data.cateCodi }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      const users = result?.selectedUsers || result;
  
      if (users && Array.isArray(users)) {
        if (!this.usuariosAsignadosPorTarea[this.data.tareaCodi]) {
          this.usuariosAsignadosPorTarea[this.data.tareaCodi] = [];
        }
        users.forEach((user: Usuarios) => {
          const newRegistrarTarea: RegistrarTareas = {
            codi: '',
            ran1_codi: this.data.tareaCodi,
            pidm: user.pidm,
            fechaActividad: new Date().toISOString(),
            idUsuario: this.userDetail!.idUsuario
          };
  
          this.registrarTareasService.createRegistrarTarea(newRegistrarTarea).subscribe({
            next: (data) => {
              this.usuariosAsignadosPorTarea[this.data.tareaCodi].push(user);
            },
            error: (error) => {
              console.error('Error al crear RegistrarTarea:', error);
            }
          });
          this.registrarHistorial("A","Detalle de Tarea",("Se Asignaron más usuarios a la tarea: "+this.data.tareaCodi))
        });
      } else {
        console.log('No se seleccionaron usuarios o el resultado no es un array.');
      }
    });
  }

  OpenEtiqueta(): void {
    const dialogRef = this.dialog.open(AddEtiquetaComponent, {
      width: '350px',
      data: { tareaCodi: this.data.tareaCodi }
    });
  
    dialogRef.componentInstance.etiquetasCambiadas.subscribe((etiquetas: Etiqueta[]) => {
      this.actualizarEtiquetasSeleccionadas(etiquetas);
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      // Cualquier lógica adicional que necesites al cerrar el diálogo
    });
  }

  OpenSolucion(): void {
    const dialogRef = this.dialog.open(AddSolucionComponent, {
      width: '900px',
      data: { tareaCodi: this.data.tareaCodi }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      // Cualquier lógica adicional que necesites al cerrar el diálogo
    });
  }

  removeUser(user: Usuarios): void {
    this.registrarTareasService.getRegistrarTareasByRan1Codi(this.data.tareaCodi).subscribe({
      next: (registrarTareas) => {
        const tarea = registrarTareas.find(rt => rt.pidm === user.pidm);
        if (tarea) {
          this.registrarTareasService.deleteRegistrarTareaXCodi(tarea.codi).subscribe({
            next: () => {
              const index = this.usuariosAsignadosPorTarea[this.data.tareaCodi].indexOf(user);
              if (index > -1) {
                this.usuariosAsignadosPorTarea[this.data.tareaCodi].splice(index, 1);
              }
              this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            },
            error: (error) => {
              console.error('Error al eliminar el usuario:', error);
              this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        } else {
          console.error('No se encontró la tarea asignada para el usuario');
          this.snackBar.open('No se encontró la tarea asignada para el usuario', 'Cerrar', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener las tareas asignadas:', error);
        this.snackBar.open('Error al obtener las tareas asignadas', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  startEditingDescription() {
    this.originalDescription = this.descEditor;
    this.isEditingDescription = true;
    setTimeout(() => {
        if (this.editorInstance) {
            this.editorInstance!.root.innerHTML = this.originalDescription;
        }
    });
}

  saveDescription() {
    this.isEditingDescription = false;
    this.updateAsignarTicketDescription();
  }

  cancelEditingDescription() {
    this.descEditor = this.originalDescription;
    this.isEditingDescription = false;
  }

  updateAsignarTicketDescription() {
    this.asignarTicket.descripcion = this.descEditor;
    this.asignarTicketService.updateAsignarTicket(this.asignarTicket.codi, this.asignarTicket).subscribe({
      next: () => {
        this.snackBar.open('Descripción del ticket actualizada', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.registrarHistorial("A","Detalle de tarea",("Se actualizó la descripcion de la tarea"+this.asignarTicket.nombre))
      },
      error: (error) => console.error('Error al actualizar la descripción del ticket:', error)
    });
  }

  startEditingSolucion() {
    this.originalSolucion = this.solucionEditor;
    this.isEditingSolucion = true;
    setTimeout(() => {
        if (this.editorInstance) {
            this.editorInstance!.root.innerHTML = this.originalSolucion;
        }
    });
}

  saveSolucion() {
    this.isEditingSolucion = false;
    this.updateSolucionDescription();
  }

  cancelEditingSolucion() {
    this.solucionEditor = this.originalSolucion;
    this.isEditingSolucion = false;
  }

  loadSolucion(ran1Codi: string) {
    this.solucionService.getSolucionesByRan1Codi2(ran1Codi).subscribe({
      next: (solucion) => {
        this.solucion = solucion || {
          codi: '',
          ran1_codi: ran1Codi,
          descripcion: '',
          num_revision: '',
          pidm: '',
          ind_paquete: '',
          ind_script: '',
          ind_bd: '',
          ind_forma: '',
          OTROS: '',
          modulo: '',
          extension: '',
          url: '',
          fechaActividad: '',
          idUsuario: ''
        };
        this.solucionEditor = this.solucion.descripcion;
        if (this.editorInstance) {
          this.editorInstance.root.innerHTML = this.solucion.descripcion;
        }
      },
      error: (error) => console.error('Error al cargar solución:', error)
    });
  }
  

  updateSolucionDescription() {
    this.solucion.descripcion = this.solucionEditor;
    this.saveOrUpdateSolucion();
  }

  saveOrUpdateSolucion() {
    const fechaActual = new Date();
    const fechaFormateada = this.formatFecha(fechaActual);
    this.solucion.descripcion = this.solucionEditor;
  
    this.solucionService.getSolucionesByRan1Codi2(this.data.tareaCodi).subscribe({
      next: (existingSolucion) => {
        if (existingSolucion) {
          existingSolucion.descripcion = this.solucionEditor;
          existingSolucion.fechaActividad = fechaFormateada;
          existingSolucion.idUsuario = this.userDetail!.idUsuario;
          this.solucionService.updateSolucion(existingSolucion.id!, existingSolucion).subscribe({
            next: () => {
              this.snackBar.open('Solución actualizada exitosamente', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.registrarHistorial("A","Detalle de tarea",("Se actualizó la solución de la tarea"+this.asignarTicket.nombre))
              this.isEditingSolucion = false;
            },
            error: (error) => {
              console.error('Error al actualizar la solución:', error);
              this.snackBar.open('Error al actualizar la solución', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        } else {
          const nuevaSolucion: Solucion = {
            codi: '',
            ran1_codi: this.data.tareaCodi,
            descripcion: this.solucionEditor,
            num_revision: '',
            pidm: this.userDetail!.pidm,
            ind_paquete: 'NO',
            ind_script: 'NO',
            ind_bd: 'NO',
            ind_forma: 'NO',
            OTROS: '',
            modulo: '',
            extension: '',
            url: '',
            fechaActividad: fechaFormateada,
            idUsuario: this.userDetail!.idUsuario
          };
  
          this.solucionService.createSolucion(nuevaSolucion).subscribe({
            next: (data) => {
              this.solucion = data;
              this.snackBar.open('Solución creada exitosamente', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.isEditingSolucion = false;
            },
            error: (error) => {
              console.error('Error al crear la solución:', error);
              this.snackBar.open('Error al crear la solución', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al buscar la solución:', error);
        this.snackBar.open('Error al buscar la solución', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  registrarHistorial(tipo: string,componente:string, contexto:string):void{
    const fechaActual = new Date();
    const fechaFormateada = this.formatFecha(fechaActual);
    this.nuevoHistorial.breq_codi = this.data.breqCodi;
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

  cargarEtiquetas() {
    this.etiquetaService.getEtiquetas().subscribe(
      (etiquetas) => {
        this.etiquetas = etiquetas.map(etiqueta => ({
          ...etiqueta,
          color: etiqueta.color_fondo || '#000000' // Asume un color por defecto si no existe
        }));
        this.etiquetasFiltradas = this.etiquetas;
        this.cargarEtiquetasSeleccionadas();
      },
      (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    );
  }

  cargarEtiquetasSeleccionadas() {
    this.registroEtiquetasService.getRegistroEtiquetasByRan1Codi(this.data.tareaCodi).subscribe(
      (registros) => {
        const etiquetasIds = registros.map(registro => registro.etiq_codi);
        this.etiquetasSeleccionadas = this.etiquetas.filter(etiqueta => etiquetasIds.includes(etiqueta.codi));
        this.etiquetasFiltradas = this.etiquetas;
      },
      (error) => {
        console.error('Error al cargar etiquetas seleccionadas:', error);
      }
    );
  }

  actualizarEtiquetasSeleccionadas(etiquetas: Etiqueta[]) {
    this.etiquetasSeleccionadas = etiquetas;
  }
  
}


