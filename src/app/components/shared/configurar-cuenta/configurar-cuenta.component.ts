import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-configurar-cuenta',
  templateUrl: './configurar-cuenta.component.html',
  styleUrls: ['./configurar-cuenta.component.css']
})
export class ConfigurarCuentaComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configUsuariosService: ConfigUsuariosService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      const userPidm = this.authService.getCurrentUser()?.pidm; // Suponiendo que authService tiene este método

      if (userPidm) {
        this.configUsuariosService.changePassword(userPidm, oldPassword, newPassword).subscribe({
          next: () => {
            this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.passwordForm.reset();
          },
          error: (error: any) => {
            let errorMessage = 'Error al actualizar la contraseña';
            if (error.status === 400 && error.error === 'Contraseña anterior incorrecta') {
              errorMessage = 'Contraseña anterior incorrecta';
            }
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 3000,
            });
            console.error(error);
          }
        });
      }
    }
  }
}
