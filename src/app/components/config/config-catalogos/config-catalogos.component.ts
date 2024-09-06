import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigEditCatalogosComponent } from '../config-edit-catalogos/config-edit-catalogos.component';

@Component({
  selector: 'app-config-catalogos',
  templateUrl: './config-catalogos.component.html',
  styleUrls: ['./config-catalogos.component.css']
})
export class ConfigCatalogosComponent implements OnInit, AfterViewInit {
  @ViewChild('catalogoForm') catalogoForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public catalogo: Catalogo = {
    id: '',
    codi: '',
    nombre: '',
    padre: '',
    ind_estado: '',
    fechaActividad: moment().format('DD/MM/YYYY'),
    idUsuario: '',
    children: []
  };

  catalogos: Catalogo[] = [];
  filteredCatalogos!: Observable<Catalogo[]>;
  catalogoCtrl = new FormControl();
  selectedCatalogo: Catalogo | null = null;
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<Catalogo>();

  constructor(
    private catalogoService: CatalogoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCatalogos();
    this.filteredCatalogos = this.catalogoCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCatalogos(value))
    );
    this.userDetail = this.authService.getCurrentUser();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadCatalogos() {
    this.catalogoService.getCatalogosFilter().subscribe({
      next: (data) => {
        this.catalogos = data;
        this.dataSource.data = this.catalogos; // Asignar los datos aquí
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los catálogos', error);
        }
      }
    });
  }

  private _filterCatalogos(value: string | null): Catalogo[] {
    if (value === null) {
      return this.catalogos;
    }
    const filterValue = value.toLowerCase();
    return this.catalogos.filter(catalogo => catalogo.nombre.toLowerCase().includes(filterValue));
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createCatalogo(): void {
    if (!this.catalogoForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    this.catalogo.idUsuario = this.userDetail?.idUsuario || '';
    this.catalogo.ind_estado = 'A'; // Asignar estado como 'A'
  
    this.catalogoService.createCatalogo(this.catalogo).subscribe({
      next: (catalogoCreado) => {
        console.log('Catálogo creado con éxito:', catalogoCreado);
        this.catalogoForm.resetForm(); // Resetear el formulario aquí
        this.loadCatalogos();
        this.router.navigate(['/mant/catalogo']);
      },
      error: (error) => {
        console.error('Error al crear el catálogo', error);
      }
    });
  }
  

  onEditCatalogo(catalogo: Catalogo): void {
    const dialogRef = this.dialog.open(ConfigEditCatalogosComponent, {
      width: '600px',
      data: { catalogo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogoService.updateCatalogo(result.id, result).subscribe({
          next: (response) => {
            console.log('Organización actualizada:', response);
            this.loadCatalogos();
          },
          error: (e) => console.error('Error al actualizar la organización', e),
        });
      }
    });

  }

  onDeleteCatalogo(catalogo: Catalogo): void {
    if (!catalogo || !catalogo.id) {
      console.error('Catálogo no válido para cambiar estado');
      return;
    }

    const nuevoEstado = catalogo.ind_estado === 'I' ? 'A' : 'I';
    const catalogoEnviar = {
      ...catalogo,
      ind_estado: nuevoEstado,
      fechaActividad: moment().format('DD/MM/YYYY')
    };

    this.catalogoService.updateCatalogo(catalogo.id, catalogoEnviar).subscribe({
      next: (response) => {
        console.log('Catálogo actualizado:', response);
        this.loadCatalogos();
      },
      error: (e) => console.error('Error al actualizar el catálogo', e),
    });
  }

  onCatalogoSelected(event: any): void {
    const selectedCatalogoName = event.option.value;
    this.selectedCatalogo = this.catalogos.find(catalogo => catalogo.nombre === selectedCatalogoName) || null;
    if (this.selectedCatalogo) {
      this.catalogoCtrl.setValue(this.selectedCatalogo.nombre, { emitEvent: false });
      this.catalogo.padre = this.selectedCatalogo.codi;  // Asignar el codi del catálogo seleccionado al padre
    }
  }
  

  clearCatalogo(): void {
    this.selectedCatalogo = null;
    setTimeout(() => {
      this.catalogoCtrl.setValue('temp', { emitEvent: false }); // Establecer un valor temporal
      this.catalogoCtrl.setValue(''); // Limpiar el campo
    }, 0);
  }
}
