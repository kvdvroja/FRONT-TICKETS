import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { Asignacion } from 'src/app/interfaces/Asignacion/Asignacion';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { AsignarTareaComponent } from '../asignar-tarea/asignar-tarea.component';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';

@Component({
  selector: 'app-assign-dialog',
  templateUrl: './assign-dialog.component.html',
  styleUrls: ['./assign-dialog.component.css']
})
export class AssignDialogComponent implements OnInit {
  selectedUsers: { [cateCodi: string]: Usuarios[] } = {};
  selectedTasks: { [cateCodi: string]: any[] } = {};
  coordinaciones: string[] = [];
  asignaciones: { [cateCodi: string]: Asignacion[] } = {};
  usuarios: { [cateCodi: string]: Usuarios[] } = {};
  categorias: { [cateCodi: string]: Categoria } = {};
  userDetail: UserDetail | null = null;

  constructor(
    public dialogRef: MatDialogRef<AssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { coordinaciones: string[], userDetail: UserDetail },
    private asignacionService: AsignacionService,
    private usuariosService: UsuariosService,
    private categoriaService: CategoriaService,
    private dialog: MatDialog
  ) {
    this.userDetail = data.userDetail;
  }

  ngOnInit() {
    this.coordinaciones = this.data.coordinaciones;
    this.coordinaciones.forEach(cateCodi => {
      this.categoriaService.getCategoriabyCodi(cateCodi).subscribe(categoria => {
        this.categorias[cateCodi] = categoria;
      });

      this.asignacionService.getAsignacionesByCateCodi(cateCodi).subscribe(asignaciones => {
        this.asignaciones[cateCodi] = asignaciones;
        const pidms = asignaciones.map(asignacion => asignacion.pidm);
        this.usuariosService.getUsuariosByPidmList(pidms).subscribe(usuarios => {
          this.usuarios[cateCodi] = usuarios;
        });
      });
    });
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
  openTaskDialog(event: any, cateCodi: string): void {
    const selectedUser = event.value[event.value.length - 1];
    const dialogRef = this.dialog.open(AsignarTareaComponent, {
      width: '500px',
      data: { cateCodi, breqCodi: '', userDetail: this.userDetail, ascoCodi: '' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos de la tarea:', result);
        // Almacenar los datos de las tareas y usuarios seleccionados
        if (!this.selectedTasks[cateCodi]) {
          this.selectedTasks[cateCodi] = [];
        }
        this.selectedTasks[cateCodi].push({
          user: selectedUser,
          nombreTarea: result.nombreTarea,
          fechaVencimiento: result.fechaVencimiento
        });
      } else {
        // Desmarcar el usuario si no se ingresó nada en el modal
        this.selectedUsers[cateCodi] = this.selectedUsers[cateCodi].filter(user => user !== selectedUser);
      }
    });
  }
  

  selectUser() {
    console.log("Usuarios seleccionados al cerrar el diálogo:", this.selectedUsers);
    this.dialogRef.close({ selectedUsers: this.selectedUsers, selectedTasks: this.selectedTasks });
  }
}
