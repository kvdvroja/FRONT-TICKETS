import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigEditViasComponent } from 'src/app/components/config/config-edit-vias/config-edit-vias.component';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { Unidad } from 'src/app/interfaces/Unidad/unidad';

@Component({
  selector: 'app-config-unidad',
  templateUrl: './config-unidad.component.html',
  styleUrls: ['./config-unidad.component.css']
})
export class ConfigUnidadComponent implements OnInit {
  @ViewChild('unidadForm') unidadForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public unidad: Unidad = {
    codi: '',
    nombre: '',
    descripcion: '',
    url_imagen: '',
    estado: '',
    camp_code: '',
    fecha_actividad: '',
    id_usuario: ''
  };

  filteredUnidad: Unidad[] = [];
  unidades: Unidad[] = [];
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'nombre', 'descripcion', 'campus', 'acciones'];
  dataSource = new MatTableDataSource<Unidad>();

  constructor(private unidadService: UnidadService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.getUnidades();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getUnidades(): void {
    this.unidadService.getUnidades().subscribe({
      next: (data) => {
        this.unidades = data;
        this.filteredUnidad = [...this.unidades];
        this.dataSource.data = this.filteredUnidad;
      },
      error: (error) => console.error('Error al obtener Unidades', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createUnidades(): void {
    if (!this.unidadForm || !this.unidadForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    this.unidad.id_usuario = this.userDetail?.idUsuario || '';
    this.unidad.fecha_actividad = moment().format('DD/MM/YYYY');
    this.unidad.estado = 'A';
  
    this.unidadService.createUnidad(this.unidad).subscribe({
      next: (unidadCreada) => {
        this.unidadForm.resetForm();
        this.getUnidades();
        this.router.navigate(['/config/unidad']);
      },
      error: (error) => {
        console.error('Error al crear la Unidad', error);
      }
    });
  }
  
  onEditUnidad(unidad: Unidad): void {
    const dialogRef = this.dialog.open(ConfigEditViasComponent, {
      width: '600px',
      data: { unidad }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.unidadService.updateUnidad(result.id, result).subscribe({
          next: (response) => {
            console.log('Unidad actualizada:', response);
            this.getUnidades();
          },
          error: (e) => console.error('Error al actualizar la unidad', e),
        });
      }
    });
  }

  onDeleteUnidad(unidad: Unidad): void {
    if (!unidad || !unidad.id) {
      console.error('Vía no válida para cambiar estado');
      return;
    }

    const nuevoEstado = unidad.estado === 'I' ? 'A' : 'I';
    const unidadEnviar = { 
      ...unidad, 
      estado: nuevoEstado, 
      fecha_actividad: moment().format('DD/MM/YYYY') 
    };

    this.unidadService.updateUnidad(unidad.id, unidadEnviar).subscribe({
      next: (response) => {
        console.log('Unidad actualizada:', response);
        this.getUnidades();
      },
      error: (e) => console.error('Error al actualizar la Unidad', e),
    });
  }



}
