import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { TrabajosService } from 'src/app/services/Trabajos/trabajos.service';
import { Trabajos } from 'src/app/interfaces/Trabajos/Trabajos';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigEditTrabajosComponent } from 'src/app/components/config/config-edit-trabajos/config-edit-trabajos.component';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-config-trabajos',
  templateUrl: './config-trabajos.component.html',
  styleUrls: ['./config-trabajos.component.css']
})
export class ConfigTrabajosComponent implements OnInit, AfterViewInit {
  @ViewChild('trabajoForm') trabajoForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public trabajo: Trabajos = {
    id: '',
    codi: '',
    nombre: '',
    fechaActividad: moment().format('DD/MM/YYYY'),
    idUsuario: '',
    unid_codi: ''
  };

  filteredTrabajos: Trabajos[] = [];
  trabajos: Trabajos[] = [];
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<Trabajos>();

  constructor(
    private trabajosService: TrabajosService,
    private authService: AuthService,
    private unidadService: UnidadService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();

    // Suscribirse a los cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarTrabajos(unid_codi);
    });

    // Cargar trabajos según la unidad seleccionada inicialmente
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarTrabajos(initialUnidad);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarTrabajos(unid_codi: string): void {
    this.trabajosService.getTrabajos().subscribe({
      next: (data) => {
        // Filtrar trabajos según la unidad seleccionada
        this.trabajos = data.filter(trabajo => trabajo.unid_codi === unid_codi);
        this.filteredTrabajos = [...this.trabajos];
        this.dataSource.data = this.filteredTrabajos;
      },
      error: (error) => console.error('Error al obtener Trabajos', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTrabajo(): void {
    if (!this.trabajoForm.valid) {
      console.error('El formulario no es válido');
      return;
    }

    this.trabajo.idUsuario = this.userDetail?.idUsuario || '';
    this.trabajo.unid_codi = this.userDetail?.unid_codi || '0'; // Asignar unid_codi del usuario actual

    this.trabajosService.createTrabajo(this.trabajo).subscribe({
      next: (trabajoCreado) => {
        console.log('Trabajo creado con éxito:', trabajoCreado);
        this.trabajoForm.resetForm(); // Resetear el formulario aquí
        this.cargarTrabajos(this.userDetail!.unid_codi!); // Recargar trabajos
        this.router.navigate(['/mant/trabajos']);
      },
      error: (error) => {
        console.error('Error al crear el Trabajo', error);
      }
    });
  }

  onEditTrabajo(trabajo: Trabajos): void {
    const dialogRef = this.dialog.open(ConfigEditTrabajosComponent, {
      width: '600px',
      data: { trabajo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trabajosService.updateTrabajo(result.id, result).subscribe({
          next: (response) => {
            console.log('Trabajo actualizado:', response);
            this.cargarTrabajos(this.userDetail!.unid_codi!);
          },
          error: (e) => console.error('Error al actualizar el trabajo', e),
        });
      }
    });
  }

  onDeleteTrabajo(id?: string): void {
    if (!id) {
      console.error('Intentando eliminar un trabajo sin ID válido' + id);
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      this.trabajosService.deleteTrabajo(id).subscribe({
        next: (response) => {
          console.log(response);
          this.trabajos = this.trabajos.filter((trabajo) => trabajo.id !== id);
          this.filteredTrabajos = this.filteredTrabajos.filter((trabajo) => trabajo.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
    }
  }
}
