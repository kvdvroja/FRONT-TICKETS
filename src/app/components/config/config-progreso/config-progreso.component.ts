import { Component, OnInit, ViewChild } from '@angular/core';
import { ProgresoService } from 'src/app/services/Progreso/progreso.service';
import { Progreso } from 'src/app/interfaces/Progreso/Progreso';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigEditProgresoComponent } from 'src/app/components/config/config-edit-progreso/config-edit-progreso.component';

@Component({
  selector: 'app-config-progreso',
  templateUrl: './config-progreso.component.html',
  styleUrls: ['./config-progreso.component.css']
})
export class ConfigProgresoComponent implements OnInit {

  @ViewChild('progresoForm') progresoForm!: NgForm;

  public progreso: Progreso = {
    id: '',
    codi: '',
    nombre: '',
    fecha_actividad: new Date().toISOString(),
    idUsuario: '',
    unid_codi: '',
  }
  filteredProgreso: Progreso[] = [];
  progresos: Progreso[] = [];
  userDetail: UserDetail | null = null;

  constructor(
    private progresoService: ProgresoService,
    private authService: AuthService,
    private unidadService: UnidadService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarProgreso(unid_codi);
    });
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarProgreso(initialUnidad);
  }

  cargarProgreso(unid_codi: string): void {
    if (this.userDetail && unid_codi) {
      this.progresoService.getProgresos().subscribe({
        next: (data) => {
          this.progresos = data.filter(progreso => progreso.unid_codi === unid_codi);
          this.filteredProgreso = [...this.progresos];
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Error al obtener progresos', error)
      });
    } else {
      console.error('No se pudo cargar progresos: falta unid_codi en userDetail.');
    }
  }

  createProgreso(): void {
    if (!this.progresoForm.valid) {
      console.error('El formulario no es válido');
      return;
    }

    if (this.userDetail && this.userDetail.idUsuario && this.userDetail.unid_codi) {
      this.progreso.idUsuario = this.userDetail.idUsuario;
      this.progreso.unid_codi = this.userDetail.unid_codi;
      this.progreso.fecha_actividad = this.setFechaHora();

      this.progresoService.createProgreso(this.progreso).subscribe({
        next: (progresoCreado) => {
          console.log('Progreso creado con éxito:', progresoCreado);
          this.cargarProgreso(this.userDetail!.unid_codi!); 
          this.router.navigate(['/mant/progreso']);
        },
        error: (error) => console.error('Error al crear el progreso', error)
      });
    } else {
      console.error('No hay usuario actual o falta unid_codi');
    }
  }

  setFechaHora(): string {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Lima'
    });
  
    const hora = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
      hour12: true
    });
  
    return `${fecha} - ${hora}`;
  }

  onDeleteProgreso(id?: string): void {
    if (!id) {
      console.error('Intentando eliminar un progreso sin ID válido' + id);
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este progreso?')) {
      this.progresoService.deleteProgreso(id).subscribe({
        next: (response) => {
          console.log(response);
          this.progresos = this.progresos.filter((progreso) => progreso.id !== id);
          this.filteredProgreso = this.filteredProgreso.filter((progreso) => progreso.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
    }
  }

  onEditProgreso(progreso: Progreso): void {
    const dialogRef = this.dialog.open(ConfigEditProgresoComponent, {
      width: '600px',
      data: { progreso }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.progresoService.updateProgreso(result.id, result).subscribe({
          next: (response) => {
            console.log('Progreso actualizado:', response);
            this.cargarProgreso(this.userDetail!.unid_codi!);
          },
          error: (e) => console.error('Error al actualizar el progreso', e),
        });
      }
    });
  }
}
