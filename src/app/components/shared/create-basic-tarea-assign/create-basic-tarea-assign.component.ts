import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';

@Component({
  selector: 'app-create-basic-tarea-assign',
  templateUrl: './create-basic-tarea-assign.component.html',
  styleUrls: ['./create-basic-tarea-assign.component.css']
})
export class CreateBasicTareaAssignComponent implements OnInit {
  usuarios: Usuarios[] = [];
  selectedUsers: Usuarios[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateBasicTareaAssignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cateCodi: string },
    private asignacionService: AsignacionService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.asignacionService.getAsignacionesByCateCodi(this.data.cateCodi).subscribe(asignaciones => {
      const pidms = asignaciones.map(asignacion => asignacion.pidm);
      this.usuariosService.getUsuariosByPidmList(pidms).subscribe(usuarios => {
        this.usuarios = usuarios;
      });
    });
  }

  toggleUserSelection(usuario: Usuarios): void {
    const index = this.selectedUsers.findIndex(u => u.idUsuario === usuario.idUsuario);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(usuario);
    }
  }

  isSelected(usuario: Usuarios): boolean {
    return this.selectedUsers.some(u => u.idUsuario === usuario.idUsuario);
  }

  confirmSelection(): void {
    this.dialogRef.close({ selectedUsers: this.selectedUsers });
  }
  
  manejarErrorImagen(usuario: Usuarios): void {
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
}
