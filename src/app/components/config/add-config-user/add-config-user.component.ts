import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';

@Component({
  selector: 'app-add-config-user',
  templateUrl: './add-config-user.component.html',
  styleUrls: ['./add-config-user.component.css']
})
export class AddConfigUserComponent implements OnInit {
  public registerData: any = {};
  public confirmPassword: string = '';
  private userDetail: UserDetail | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddConfigUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private unidadService: UnidadService
  ) {
    this.registerData = data.registerData || {};
  }

  ngOnInit(): void {
    this.confirmPassword = '';
    this.userDetail = this.authService.getCurrentUser(); // Obtener el userDetail

    // Asignar el unid_codi dependiendo de la selección del sidebar o userDetail
    const selectedUnidadFromSidebar = this.unidadService.getUnidadSeleccionada();
    if (selectedUnidadFromSidebar && selectedUnidadFromSidebar !== 'Seleccione') {
      this.registerData.unid_codi = selectedUnidadFromSidebar;
    } else {
      // Si no hay unidad seleccionada en el sidebar, usar la unidad del userDetail
      this.registerData.unid_codi = this.userDetail?.unid_codi;
    }

    // Aquí puedes manejar el caso en que no haya unid_codi disponible
    if (!this.registerData.unid_codi) {
      this.snackbar.open('No se pudo determinar la unidad. Por favor, selecciona una unidad.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }

  onRegister(): void {
    if (this.registerData.password.trim() !== this.confirmPassword.trim()) {
      this.snackbar.open('Las contraseñas no coinciden.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
      return;
    }

    if (!this.registerData.unid_codi) {
      this.snackbar.open('No se puede registrar sin una unidad asignada.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
      return;
    }

    // Realiza el registro directamente desde el modal
    this.authService.register(this.registerData).subscribe({
      next: (userDetail) => {
        this.snackbar.open('Registro exitoso.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-primary']
        });
        this.dialogRef.close(true); // Cierra el modal e indica éxito
      },
      error: (error) => {
        this.snackbar.open('Error en el registro.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra el modal sin hacer nada
  }
}
