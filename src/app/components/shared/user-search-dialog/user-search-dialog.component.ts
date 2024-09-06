import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';

@Component({
  selector: 'app-user-search-dialog',
  templateUrl: './user-search-dialog.component.html'
})
export class UserSearchDialogComponent implements OnInit {
  searchTerm: string = '';
  filteredUsers: Usuarios[] = [];
  selectedUser?: Usuarios;

  constructor(    public dialogRef: MatDialogRef<UserSearchDialogComponent>,
    private usuariosService: UsuariosService) {}

  ngOnInit() {
  }

  searchUsers() {
    if (this.searchTerm) {
      this.usuariosService.getUsuariosByName(this.searchTerm).subscribe({
        next: (usuarios: Usuarios[]) => {
          this.filteredUsers = usuarios;
        },
        error: (err) => console.error(err)
      });
    }
  }
  selectUser(user: Usuarios) {
    this.selectedUser = user;
  }
}
