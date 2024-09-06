import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cambiar-clave',
  templateUrl: './cambiar-clave.component.html',
  styleUrls: ['./cambiar-clave.component.css']
})
export class CambiarClaveComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CambiarClaveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pidm: string },
    private configUsuariosService: ConfigUsuariosService,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    console.log("EL PIDM ES"+this.data.pidm)
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { newPassword } = this.passwordForm.value;
      const pidm = this.data.pidm;

      if (pidm) {
        this.configUsuariosService.updatePasswordAsAdmin(pidm, newPassword).subscribe({
          next: () => {
            this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(true); // Puede enviar un valor para indicar éxito
          },
          error: (error: any) => {
            this.snackBar.open('Error al actualizar la contraseña', 'Cerrar', {
              duration: 3000,
            });
            console.error(error);
          }
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
