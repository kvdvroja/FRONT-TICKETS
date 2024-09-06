import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { AsignarCatalogoService } from 'src/app/services/Assign/asignar-catalogo.service';
import { AsignacionService } from 'src/app/services/asignacion.service';
import { UsuariosService } from 'src/app/services/usersUPAO/usuarios.service';
import { AsignarCatalogo } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { Usuarios } from 'src/app/interfaces/usersUPAO/usuarios';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { ConfigFull } from 'src/app/interfaces/Config/configUsuario';
import { Asignacion } from 'src/app/interfaces/Asignacion/Asignacion';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-asignar-dialog',
  templateUrl: './asignar-dialog.component.html',
  styleUrls: ['./asignar-dialog.component.css']
})
export class AsignarDialogComponent implements OnInit {
  catalogHierarchy: Catalogo[] = [];
  catalogLevels: any[] = [];
  finalSelection?: Catalogo;
  displayedCatalogs: Catalogo[] = [];
  usuariosAsignados: ConfigFull[] = [];
  usuariosSeleccionados: Usuarios[] = [];
  usuarios: ConfigFull[] = [];
  full_usuarios : ConfigFull[] = [];
  filteredUsuarios: ConfigFull[] = [];
  asignarCatalogo : AsignarCatalogo | null = null;
  asignaciones : AsignarCatalogo[] = [];

  constructor(
    public dialogRef: MatDialogRef<AsignarDialogComponent>,
    private catalogoService: CatalogoService,
    private asignarCatalogoService: AsignarCatalogoService,
    private asignacionService: AsignacionService,
    private usuariosService: UsuariosService,
    private configUsuariosService: ConfigUsuariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAllCatalogs();
    this.loadUsuarios();
  }

  loadAllCatalogs(): void {
    this.catalogoService.getCatalogo().subscribe(catalogs => {
      this.catalogHierarchy = catalogs;
      this.initializeLevels();
    });
  }

  loadUsuarios() {
    this.configUsuariosService.getConfigsFull().subscribe({
      next: (data) => {
        this.full_usuarios = data;
        this.usuarios = data;
        this.filteredUsuarios = data; // Inicializamos los usuarios filtrados con todos los usuarios disponibles
        // this.actualizarUsuariosFiltrados();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los usuarios', error);
        }
      }
    });
  }

  initializeLevels() {
    this.catalogLevels = [{
      label: 'SELECCIONE UNA SECCIÓN',
      catalogs: this.catalogHierarchy.filter(c => !c.padre || c.padre === '1'),
      selected: null
    }];
  }

  onCatalogClick(catalog: Catalogo, levelIndex: number): void {
    this.catalogLevels[levelIndex].selected = catalog.codi;
    this.catalogLevels = this.catalogLevels.slice(0, levelIndex + 1);

    const childCatalogs = this.catalogHierarchy.filter(c => c.padre === catalog.codi);
    if (childCatalogs.length > 0) {
      this.catalogLevels.push({
        label: 'SELECCIONE UNA SUBSECCIÓN',
        catalogs: childCatalogs,
        selected: null
      });
    } else {
      this.finalSelection = catalog;
    }

    this.cargarUsuariosAsignados(catalog.codi);
  }


  cargarUsuariosAsignados(catalogCodi: string): void {
    this.asignarCatalogoService.getAsignarCatalogoByCataCodi(catalogCodi).subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones; // Guardar las asignaciones recibidas
        
        // Filtrar los usuarios que no están asignados
        this.filteredUsuarios = this.full_usuarios.filter(user => 
          !this.asignaciones.some(asignacion => asignacion.idUsuario === user.idUsuario)
        );

        this.usuariosAsignados = this.full_usuarios.filter(user => 
          this.asignaciones.some(asignacion => asignacion.idUsuario === user.idUsuario)
        );
  
        // console.log(this.usuariosAsignados);
        // console.log(this.filteredUsuarios);
        // console.log(this.full_usuarios);
      },
      error: (error) => {
        console.error(error);
        this.usuariosAsignados  = [];
        this.filteredUsuarios = [];
      }
    });
  }
  

  filterUsuarios(event: Event): void {
    const normalizedQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(usuario =>
      usuario.nombreUsuario.toLowerCase().includes(normalizedQuery)
    );
  }

  asignarUsuario(usuario: ConfigFull): void {
    const params: AsignarCatalogo = {
      codi: '',
      cata_codi: this.finalSelection?.codi || '',
      usun_codi: usuario?.codi || '',
      fechaActividad: moment().format('DD/MM/YYYY HH:mm:ss'),
      idUsuario: usuario?.idUsuario || '',
      estado : "A"
    };
    this.asignarCatalogo = {...params};

    this.asignarCatalogoService.createAsignarCatalogo(this.asignarCatalogo).subscribe({
      next: (response) => {
        this.snackBar.open('Asignado Correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-primary']
        });
        if (this.finalSelection) {
          this.cargarUsuariosAsignados(this.finalSelection.codi);
        }

      },
      error: (e) => {
        this.snackBar.open('Error al crear la asignación', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });

    // this.usuariosAsignados.push(usuario);
    // this.usuarios = this.usuarios.filter(u => u !== usuario);
    // this.filteredUsuarios = this.filteredUsuarios.filter(u => u !== usuario);
  }
  removeUser(user: string): void {
    // console.log(user)
    if(this.finalSelection){
      this.asignarCatalogoService.deleteAsignarCatalogo(user,this.finalSelection.codi).subscribe({
        next: (registrarTareas) => {
          this.snackBar.open('Eliminado Correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['mat-toolbar', 'mat-primary']
          });
          if (this.finalSelection) {
            this.cargarUsuariosAsignados(this.finalSelection.codi);
          }
        },
        error: (error) => {

        }
      });
    }

  }

  toggleUsuarioSeleccionado(usuario: Usuarios): void {
    const index = this.usuariosSeleccionados.indexOf(usuario);
    if (index === -1) {
      this.usuariosSeleccionados.push(usuario);
    } else {
      this.usuariosSeleccionados.splice(index, 1);
    }
  }
  
  usuarioSeleccionado(usuario: Usuarios): boolean {
    return this.usuariosSeleccionados.includes(usuario);
  }

  manejarErrorImagenAsign(usuario: ConfigFull): void {
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

  manejarErrorImagen2Asign(usuario: ConfigFull): void {
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

  guardarCambios(): void {
    const result = {
      catalogo: this.finalSelection,
      usuarios: this.usuariosSeleccionados
    };
    this.dialogRef.close(result);
  }

  actualizarUsuariosFiltrados(): void {
    this.filteredUsuarios = this.full_usuarios.filter(u => !this.usuariosAsignados.some(asignado => asignado.idUsuario === u.idUsuario));
    this.usuarios = this.filteredUsuarios;
  }


  onCatalogSelectionChange(level: any, codi: string): void {
    const selectedCatalog = this.catalogHierarchy.find(c => c.codi === codi);
    if (selectedCatalog) {
      this.displayedCatalogs = this.catalogHierarchy.filter(c => c.padre === selectedCatalog.codi);
      level.selected = codi;
    }
  }
}
