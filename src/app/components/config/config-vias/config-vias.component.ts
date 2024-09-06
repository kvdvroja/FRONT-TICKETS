import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { ViaRecepcionService } from 'src/app/services/selects/ViaRecepcion/via-recepcion.service';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigEditViasComponent } from 'src/app/components/config/config-edit-vias/config-edit-vias.component';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-config-vias',
  templateUrl: './config-vias.component.html',
  styleUrls: ['./config-vias.component.css']
})
export class ConfigViasComponent implements OnInit, AfterViewInit {
  @ViewChild('viaRecepcionForm') viaRecepcionForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public viaRecepcion: viaRecepcion = {
    id: '',
    codi: '',
    descripcion: '',
    fechaActividad: moment().format('DD/MM/YYYY'),
    idUsuario: '',
    unidCodi: '',
    indEstado: ''
  };

  filteredViaRecepcion: viaRecepcion[] = [];
  vias: viaRecepcion[] = [];
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'descripcion', 'acciones'];
  dataSource = new MatTableDataSource<viaRecepcion>();

  constructor(
    private viaRecepcionService: ViaRecepcionService,
    private authService: AuthService,
    private unidadService: UnidadService, // Integración con UnidadService
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();

    // Suscribirse a los cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarVias(unid_codi);
    });

    // Cargar vías según la unidad seleccionada inicialmente
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarVias(initialUnidad);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarVias(unid_codi: string): void {
    this.viaRecepcionService.getVias().subscribe({
      next: (data) => {
        // Filtrar vías según la unidad seleccionada
        this.vias = data.filter(via => via.unidCodi === unid_codi);
        this.filteredViaRecepcion = [...this.vias];
        this.dataSource.data = this.filteredViaRecepcion;
      },
      error: (error) => console.error('Error al obtener Vías de Recepción', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createVias(): void {
    if (!this.viaRecepcionForm.valid) {
      console.error('El formulario no es válido');
      return;
    }

    this.viaRecepcion.idUsuario = this.userDetail?.idUsuario || '';
    this.viaRecepcion.unidCodi = this.userDetail?.unid_codi || '0'; // Asignar unidCodi del usuario actual
    this.viaRecepcion.indEstado = "A";

    this.viaRecepcionService.createVia(this.viaRecepcion).subscribe({
      next: (viaCreada) => {
        console.log('Vía creada con éxito:', viaCreada);
        this.viaRecepcionForm.resetForm(); // Resetear el formulario aquí
        this.cargarVias(this.userDetail!.unid_codi!); // Recargar vías
        this.router.navigate(['/mant/vias']);
      },
      error: (error) => {
        console.error('Error al crear la Vía de Recepción', error);
      }
    });
  }

  onEditVia(via: viaRecepcion): void {
    const dialogRef = this.dialog.open(ConfigEditViasComponent, {
      width: '600px',
      data: { via }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.viaRecepcionService.updateVia(result.id, result).subscribe({
          next: (response) => {
            console.log('Vía actualizada:', response);
            this.cargarVias(this.userDetail!.unid_codi!);
          },
          error: (e) => console.error('Error al actualizar la vía', e),
        });
      }
    });
  }

  onDeleteVia(via: viaRecepcion): void {
    if (!via || !via.id) {
      console.error('Vía no válida para cambiar estado');
      return;
    }

    const nuevoEstado = via.indEstado === 'I' ? 'A' : 'I';
    const viaEnviar = { 
      ...via, 
      indEstado: nuevoEstado, 
      fechaActividad: moment().format('DD/MM/YYYY') 
    };

    this.viaRecepcionService.updateVia(via.id, viaEnviar).subscribe({
      next: (response) => {
        console.log('Vía actualizada:', response);
        this.cargarVias(this.userDetail!.unid_codi!);
      },
      error: (e) => console.error('Error al actualizar la vía', e),
    });
  }
}
