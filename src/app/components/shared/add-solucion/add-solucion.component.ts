import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Quill from 'quill';
import { Solucion } from 'src/app/interfaces/Solucion/Solucion';
import { SolucionService } from 'src/app/services/Solucion/solucion.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { MatDialog } from '@angular/material/dialog';
import { Historial } from 'src/app/interfaces/Historial/Historial';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';

@Component({
  selector: 'app-add-solucion',
  templateUrl: './add-solucion.component.html',
  styleUrls: ['./add-solucion.component.css']
})
export class AddSolucionComponent implements OnInit {
  isEditingName: boolean = false;
  isEditingSolucion: boolean = false;
  editingIndex: number | null = null;
  originalDescription: string = '';
  originalSolucion: string = '';
  userDetail: UserDetail | null = null;
  public editorInstance: Quill | null = null;
  descEditor: string = '';
  selectedFiles: File[] = [];
  solucionEditor: string = '';
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

  constructor(
    public dialogRef: MatDialogRef<AddSolucionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string, tareaCodi: string, breqCodi: string },
    private snackBar: MatSnackBar,
    private solucionService: SolucionService,
    private dialog: MatDialog,
    private historialService: HistorialService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    
  }

  public setEditorInstanceSolucion(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.solucionEditor = this.editorInstance!.root.innerHTML;
    });
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
              this.registrarHistorial("A","Detalle de tarea",("Se actualizó la solución de la tarea"))
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

  onFileSelected(event: any): void {
    this.selectedFiles = [];
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        this.selectedFiles.push(file);
      }
    }
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

}
