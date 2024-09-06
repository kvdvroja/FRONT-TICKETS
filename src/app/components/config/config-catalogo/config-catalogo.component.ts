import { Component,ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { ConfigFull } from 'src/app/interfaces/Config/configUsuario';
import { MatTableDataSource } from '@angular/material/table';
import { AsignarCatalogo } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { AsignarCatalogoFull } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { AsignarCatalogoService } from 'src/app/services/Assign/asignar-catalogo.service';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfigEditCatalogoComponent } from 'src/app/components/config/config-edit-catalogo/config-edit-catalogo.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsignarDialogComponent } from '../../shared/asignar-dialog/asignar-dialog.component';

@Component({
  selector: 'app-config-catalogo',
  templateUrl: './config-catalogo.component.html',
  styleUrls: ['./config-catalogo.component.css']
})
export class ConfigCatalogoComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('catalogoForm') catalogoForm!: NgForm;

  constructor(private catalogoService: CatalogoService,private changeDetectorRef: ChangeDetectorRef, private configUsuariosService: ConfigUsuariosService,private asignarCatalogoService : AsignarCatalogoService,private authService : AuthService,public dialog: MatDialog,private snackBar: MatSnackBar,){
    this.catalogoCtrl = new FormControl('');
    this.usuarioCtrl = new FormControl('');
  }
  catalogos: Catalogo[] = [];
  filteredCatalogos!: Observable<Catalogo[]>;
  catalogoCtrl = new FormControl();
  selectedCatalogo: Catalogo | null = null;
  catalogoFilterCtrl = new FormControl();

  displayedColumns: string[] = ['codi','usun_name','cata_name','fechaActividad'];
  dataSource = new MatTableDataSource<AsignarCatalogoFull>();
  filteredAsignar: AsignarCatalogoFull[] = [];
  asignar: AsignarCatalogoFull[] = [];

  usuarios: ConfigFull[] = [];
  filteredUsuarios!: Observable<ConfigFull[]>;
  usuarioCtrl = new FormControl();
  selectedUsuario: ConfigFull | null = null;
  usuarioFilterCtrl = new FormControl();

  asignarCatalogo : AsignarCatalogo | null = null;
  userDetail: UserDetail | null = null;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loadCatalogos();
    this.filteredCatalogos = this.catalogoCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCatalogos(value))
    );
    //Usuarios
    this.loadUsuarios();
    this.filteredUsuarios = this.usuarioCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsuarios(value))
    );
    this.cargarCatalogosFull();
    this.userDetail = this.authService.getCurrentUser();
  }

  loadCatalogos() {
    this.catalogoService.getCatalogosFilter().subscribe({
      next: (data) => {
        this.catalogos = data;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los catalogos', error);
        }
      }
    })
  }

  loadUsuarios() {
    this.configUsuariosService.getConfigsFull().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los usuarios', error);
        }
      }
    })
  }

  createConfigCatalogo(){
    const params: AsignarCatalogo = {
      codi: this.selectedCatalogo?.codi || '',
      cata_codi: this.selectedCatalogo?.codi || '',
      usun_codi: this.selectedUsuario?.codi || '',
      fechaActividad: moment().format('DD/MM/YYYY HH:mm:ss'),
      idUsuario: this.userDetail?.idUsuario || '',
      estado : "A"
    };
    
    
    if(!this.selectedCatalogo?.codi){
      this.snackBar.open('Debe seleccionar catálogo', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    if(!this.selectedUsuario?.codi){
      this.snackBar.open('Debe seleccionar usuario', 'Cerrar', {
        duration: 3000,
      });
      return
    }
    
    this.asignarCatalogo = {...params};
    
    this.asignarCatalogoService.createAsignarCatalogo(this.asignarCatalogo).subscribe({
      next: (response) => {
        this.snackBar.open('Asignado Correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-primary']
        });
        window.location.reload();
      },
      error: (e) => {
        console.error('Error al crear la asignación', e);
        this.snackBar.open('Error al crear la asignación', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });

  }

  onCatalogoSelected(event: any): void {
    const selectedCatalogoName = event.option.value;
    this.selectedCatalogo = this.catalogos.find(catalogo => catalogo.nombre === selectedCatalogoName) || null;
    if (this.selectedCatalogo) {
      this.catalogoCtrl.setValue(this.selectedCatalogo.nombre, { emitEvent: false });
    }
  }

  onUsuarioSelected(event: any): void {
    const selectedUsuarioName = event.option.value;
    this.selectedUsuario = this.usuarios.find(usuario => usuario.nombreUsuario === selectedUsuarioName) || null;
    if (this.selectedUsuario) {
      this.usuarioCtrl.setValue(this.selectedUsuario.nombreUsuario, { emitEvent: false });
    }
  }

  clearCatalogo(): void {
    this.selectedCatalogo = null;
    setTimeout(() => {
      this.catalogoCtrl.setValue('temp', { emitEvent: false }); // Establecer un valor temporal
      this.catalogoCtrl.setValue(''); // Limpiar el campo
    }, 0);
  }

  clearUsuario(): void {
    this.selectedUsuario = null;
    setTimeout(() => {
      this.usuarioCtrl.setValue('temp', { emitEvent: false }); // Establecer un valor temporal
      this.usuarioCtrl.setValue(''); // Limpiar el campo
    }, 0);
  }

  private _filterCatalogos(value: string | null): Catalogo[] {
    if (value === null) {
      return this.catalogos;
    }
    const filterValue = value.toLowerCase();
    return this.catalogos.filter(catalogo => catalogo.nombre.toLowerCase().includes(filterValue));
  }

  private _filterUsuarios(value: string | null): ConfigFull[] {
    if (value === null) {
      return this.usuarios;
    }
    const filterValue = value.toLowerCase();
    return this.usuarios.filter(usuario => usuario.nombreUsuario.toLowerCase().includes(filterValue));
  }

  onEditAsignacion(asignacion: AsignarCatalogoFull): void {
    const dialogRef = this.dialog.open(ConfigEditCatalogoComponent, {
      width: '700px',
      data: asignacion
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCatalogosFull();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  cargarCatalogosFull(): void{
    this.asignarCatalogoService.getCatalogoFull().subscribe({
      next: (response) => {
        this.asignar = response;
        this.filteredAsignar = [...this.asignar];
        this.dataSource.data = this.filteredAsignar;
      },
      error: (e) => console.error('Error al actualizar la organización', e),
    });
  }
  onDeleteAsignacion(asignacion?: AsignarCatalogoFull): void {
    if (!asignacion || !asignacion.id) {
      console.error('Organización no válida para cambiar estado');
      return;
    }

    const nuevoEstado = asignacion.estado === 'I' ? 'A' : 'I';
    const params: AsignarCatalogo = {
      id : asignacion.id,
      codi: asignacion.codi,
      cata_codi: asignacion.cata_codi,
      usun_codi: asignacion.usun_codi,
      fechaActividad: moment().format('DD/MM/YYYY HH:mm:ss'),
      idUsuario: asignacion.idUsuario ,
      estado : nuevoEstado
    };

    this.asignarCatalogoService.updateAsignarCatalogo(asignacion.id, params).subscribe({
      next: (response) => {
        console.log('Organización actualizada:', response);
        this.snackBar.open('Asignación actualizada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-primary']
        });
        this.cargarCatalogosFull();
      },
      error: (e) => {
        console.error('Error al actualizar la organización', e);
        this.snackBar.open('Error al actualizar la asignación', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });
  }
  openCatalogo(){
    const dialogRef = this.dialog.open(AsignarDialogComponent, {
      width: '1200px',
      height: '800px'
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result)
        // const { catalogo, usuarios } = result;
      }
    });
  }
}
