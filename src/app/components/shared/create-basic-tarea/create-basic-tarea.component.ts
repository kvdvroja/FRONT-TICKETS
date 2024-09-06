import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { CreateBasicTareaAssignComponent } from '../create-basic-tarea-assign/create-basic-tarea-assign.component';

@Component({
  selector: 'app-create-basic-tarea',
  templateUrl: './create-basic-tarea.component.html',
  styleUrls: ['./create-basic-tarea.component.css']
})
export class CreateBasicTareaComponent implements OnInit {
  selectedFechaVencimiento: Date | null = null;
  userDetail: UserDetail | null = null;
  nombreTarea: string = '';
  selectedUsers: Usuarios[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateBasicTareaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string, breqCodi: string, userDetail: UserDetail, ascoCodi: string },
    private dialog: MatDialog,
    private dateAdapter: DateAdapter<any>,
  ) {
    this.dateAdapter.setLocale('es-PE');
    this.userDetail = data.userDetail;
  }

  ngOnInit() {}

  openAssignDialog(): void {
    const dialogRef = this.dialog.open(CreateBasicTareaAssignComponent, {
      width: '500px',
      data: { cateCodi: this.data.cateCodi }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedUsers = result.selectedUsers;
        console.log('Usuarios seleccionados:', this.selectedUsers);
      }
    });
  }

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
      fechaVencimiento: fechaVencimiento,
      selectedUsers: this.selectedUsers
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
    return `${dia}/${mes}/${anio}`;
  }
}
