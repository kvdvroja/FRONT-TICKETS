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
  selector: 'app-edit-solucion',
  templateUrl: './edit-solucion.component.html',
  styleUrls: ['./edit-solucion.component.css']
})
export class EditSolucionComponent implements OnInit {
  isEditingName: boolean = false;
  isEditingSolucion: boolean = false;
  selectedTypes: string[] = [];
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
    public dialogRef: MatDialogRef<EditSolucionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string, tareaCodi: string, breqCodi: string },
    private snackBar: MatSnackBar,
    private solucionService: SolucionService,
    private dialog: MatDialog,
    private historialService: HistorialService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
  }

  public setEditorInstanceSolucion(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.solucionEditor = this.editorInstance!.root.innerHTML;
    });
  }

  onSelectionChange(event: any): void {
    // Verificamos el contenido de selectedTypes
    console.log('Tipos seleccionados:', this.selectedTypes);
  
    // Reseteamos todos los valores a 'NO'
    this.solucion.ind_paquete = 'NO';
    this.solucion.ind_script = 'NO';
    this.solucion.ind_bd = 'NO';
    this.solucion.ind_forma = 'NO';
    this.solucion.OTROS = 'NO';
  
    // Actualizamos los valores seleccionados
    this.selectedTypes.forEach((selectedType) => {
      switch (selectedType) {
        case 'PAQUETE':
          this.solucion.ind_paquete = 'SI';
          break;
        case 'SCRIPT':
          this.solucion.ind_script = 'SI';
          break;
        case 'BD':
          this.solucion.ind_bd = 'SI';
          break;
        case 'FORMA':
          this.solucion.ind_forma = 'SI';
          break;
        case 'OTRO':
          this.solucion.OTROS = 'SI';
          break;
      }
    });
  
    // Si se selecciona 'OTRO', reiniciar todas las demás opciones a 'NO'
    if (this.selectedTypes.includes('OTRO')) {
      this.solucion.ind_paquete = 'NO';
      this.solucion.ind_script = 'NO';
      this.solucion.ind_bd = 'NO';
      this.solucion.ind_forma = 'NO';
      this.solucion.OTROS = 'SI';
    }
  
    // Imprimir los valores actualizados de solucion para verificar
    console.log('Valores de solucion:', this.solucion);
  }
  
  

  saveOrUpdateSolucion() {
    const fechaActual = new Date();
    const fechaFormateada = this.formatFecha(fechaActual);
    this.solucion.descripcion = this.solucionEditor;
  
    if (this.userDetail && this.userDetail.pidm) {  // Verifica que userDetail no sea null
      this.solucion.pidm = this.userDetail.pidm;
    } else {
      console.error('Error: userDetail no está disponible o no tiene un pidm válido.');
      this.snackBar.open('Error: No se pudo obtener el detalle del usuario', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;  // Detener la ejecución si no hay un userDetail válido
    }
  
    this.solucionService.getSolucionesByRan1Codi2(this.data.tareaCodi).subscribe({
      next: (existingSolucion) => {
        if (existingSolucion) {
          existingSolucion.descripcion = this.solucionEditor;
          existingSolucion.fechaActividad = fechaFormateada;
          existingSolucion.idUsuario = this.userDetail?.idUsuario || '';
          this.solucionService.updateSolucion(existingSolucion.id!, existingSolucion).subscribe({
            next: () => {
              this.snackBar.open('Solución actualizada exitosamente', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
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
            pidm: this.userDetail?.pidm || '',
            ind_paquete: this.solucion.ind_paquete,
            ind_script: this.solucion.ind_script,
            ind_bd: this.solucion.ind_bd,
            ind_forma: this.solucion.ind_forma,
            OTROS: this.solucion.OTROS,
            modulo: '',
            extension: '',
            url: '',
            fechaActividad: fechaFormateada,
            idUsuario: this.userDetail ? this.userDetail.idUsuario : '',
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
              this.dialogRef.close();
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
