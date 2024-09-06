import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';

@Component({
  selector: 'app-create-basic-tarea',
  templateUrl: './asignar-tarea.component.html',
  styleUrls: ['./asignar-tarea.component.css'],
})
export class AsignarTareaComponent implements OnInit {
  selectedFechaVencimiento: Date | null = null;
  userDetail: UserDetail | null = null;
  nombreTarea: string = '';

  constructor(
    public dialogRef: MatDialogRef<AsignarTareaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string, breqCodi: string, userDetail: UserDetail, ascoCodi: string }
  ) {
    this.userDetail = data.userDetail;
  }

  ngOnInit() {}

  crearTarea() {
    if (!this.nombreTarea) {
      console.error('El nombre de la tarea es obligatorio');
      return;
    }

    const fechaVencimiento = this.selectedFechaVencimiento
      ? this.formatFecha(this.createCompleteDate(this.selectedFechaVencimiento))
      : '';

    const tareaData = {
      nombreTarea: this.nombreTarea,
      fechaVencimiento: fechaVencimiento
    };

    this.dialogRef.close(tareaData);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createCompleteDate(fecha: Date): Date {
    const fechaCompleta = new Date(fecha);
    fechaCompleta.setHours(0, 0, 0, 0); // Establece la hora a las 00:00
    return fechaCompleta;
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
}
