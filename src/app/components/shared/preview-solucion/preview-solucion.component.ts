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

@Component({
  selector: 'app-preview-solucion',
  templateUrl: './preview-solucion.component.html',
  styleUrls: ['./preview-solucion.component.css']
})
export class PreviewSolucionComponent implements OnInit {
  editingIndex: number | null = null;
  originalDescription: string = '';
  originalSolucion: string = '';
  subTareas: SubTareas[] = [];
  usuariosAsignadosPorTarea: { [ran1Codi: string]: Usuarios[] } = {};
  usuarios: { [cate_codi: string]: Usuarios[] } = {};
  asignarTickets: AsignarTicket[] = [];
  asignarTicketNombre: string = '';
  selectedFechaInicio: Date | null = null;
  selectedFechaVencimiento: Date | null = null;
  recarga: string = '';

  userDetail: UserDetail | null = null;

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
    public dialogRef: MatDialogRef<PreviewSolucionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tareaCodi: string },
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
    private authService: AuthService
  ) { }

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

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.loadSolucion(this.data.tareaCodi);
  }


  closeDialog() {
    this.dialogRef.close();
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

  loadSolucion(ran1Codi: string) {
    this.solucionService.getSolucionesByRan1Codi2(ran1Codi).subscribe({
      next: (soluciones) => {
          this.solucion = soluciones;
          this.solucionEditor = this.solucion.descripcion;
          if (this.editorInstance) {
            this.editorInstance.root.innerHTML = this.solucion.descripcion;
          }
      }
    });
  }

}
