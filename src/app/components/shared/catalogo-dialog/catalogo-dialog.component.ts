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
import { Asignacion } from 'src/app/interfaces/Asignacion/Asignacion';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';

@Component({
  selector: 'app-catalogo-dialog',
  templateUrl: './catalogo-dialog.component.html',
  styleUrls: ['./catalogo-dialog.component.css']
})
export class CatalogoDialogComponent implements OnInit {
  catalogHierarchy: Catalogo[] = [];
  userDetail: UserDetail | null = null;
  catalogLevels: any[] = [];
  finalSelection?: Catalogo;
  displayedCatalogs: Catalogo[] = [];
  usuariosAsignados: Usuarios[] = [];
  usuariosSeleccionados: Usuarios[] = [];

  constructor(
    public dialogRef: MatDialogRef<CatalogoDialogComponent>,
    private catalogoService: CatalogoService,
    private asignarCatalogoService: AsignarCatalogoService,
    private asignacionService: AsignacionService,
    private usuariosService: UsuariosService,
    private authService : AuthService
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
  
    // Asegurarse de que unid_codi se inicializa desde userDetail
    this.loadAllCatalogs();
  }

  loadAllCatalogs(): void {
    this.catalogoService.getCatalogo().subscribe(catalogs => {
      this.catalogHierarchy = catalogs;
      this.initializeLevels();
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
    console.log("Catalogo seleccionado:", catalog);
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
    console.log("Cargando usuarios asignados para el catálogo:", catalogCodi);
    this.asignarCatalogoService.getAsignarCatalogoByCataCodi(catalogCodi).pipe(
      switchMap((asignaciones: AsignarCatalogo[]) => {
        const usunCodis = asignaciones.map(a => a.usun_codi);
        console.log("USUN Codis de las asignaciones:", usunCodis);

        // Crear un array de observables para obtener las asignaciones exactas por cada usun_codi
        const asignacionObservables = usunCodis.map(usunCodi =>
          this.asignacionService.getAsignacionesByCodi(usunCodi).pipe(
            map((asignaciones: Asignacion[]) => asignaciones.filter(a => a.codi === usunCodi))
          )
        );

        // Ejecutar todos los observables y aplanar los resultados en un solo array de asignaciones exactas
        return forkJoin(asignacionObservables);
      }),
      map(asignacionesArray => asignacionesArray.flat())
    ).subscribe({
      next: (asignaciones: Asignacion[]) => {
        console.log("Asignaciones exactas obtenidas:", asignaciones);
        const pidms = asignaciones.map(a => a.pidm);
        console.log("PIDMs obtenidos de las asignaciones exactas:", pidms);

        this.usuariosService.getUsuariosByPidmList(pidms).subscribe({
          next: (usuarios: Usuarios[]) => {
            this.usuariosAsignados = usuarios;
            console.log("Usuarios asignados:", usuarios);
          },
          error: (error) => console.error('Error al cargar usuarios asignados:', error)
        });
      },
      error: (error) => console.error('Error al cargar asignaciones exactas:', error)
    });
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

  manejarErrorImagenAsign(usuario: Usuarios): void {
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

  selectFinalCatalog(): void {
    const result = {
      catalogo: this.finalSelection,
      usuarios: this.usuariosSeleccionados
    };
    this.dialogRef.close(result);
  }
  

  onCatalogSelectionChange(level: any, codi: string): void {
    const selectedCatalog = this.catalogHierarchy.find(c => c.codi === codi);
    if (selectedCatalog) {
      this.displayedCatalogs = this.catalogHierarchy.filter(c => c.padre === selectedCatalog.codi);
      level.selected = codi;
    }
  }
}
