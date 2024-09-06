import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-config-prioridad',
  templateUrl: './config-prioridad.component.html',
  styleUrls: ['./config-prioridad.component.css']
})
export class ConfigPrioridadComponent implements OnInit {
  @ViewChild('prioridadForm') prioridadForm!: NgForm;

  limpiarHTML(contenidoHTML: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = contenidoHTML;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  public prioridad: Prioridad = {
    id: '',
    codi: '',
    imagen:'',
    descripcion: '',
    fechaActividad: new Date().toISOString(),
    idUsuario: '',
    unidCodi: '',
    indEstado: ''
  }
  filteredPrioridad: Prioridad[] = [];
  prioridades: Prioridad[] = [];
  userDetail: UserDetail | null = null;

  constructor(
    private prioridadservice: PrioridadService,
    private authService : AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private unidadService: UnidadService, // Importar y usar UnidadService
    private router: Router) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();

    // Suscribirse a los cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarPrioridades(unid_codi);
    });

    // Cargar prioridades según la unidad seleccionada inicialmente
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarPrioridades(initialUnidad);
  }

  cargarPrioridades(unid_codi: string): void {
    this.prioridadservice.getPrioridad().subscribe({
      next: (data) => {
        // Filtrar prioridades según la unidad seleccionada
        this.prioridades = data.filter(prioridad => prioridad.unidCodi === unid_codi);
        this.filteredPrioridad = [...this.prioridades];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al obtener prioridades', error)
    });
  }

  createPrioridad(): void {
    console.log('Objeto prioridad a enviar:', this.prioridad);
    
    if (!this.prioridadForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    if (this.userDetail && this.userDetail.idUsuario) {
      this.prioridad.idUsuario = this.userDetail.idUsuario;
      this.prioridad.fechaActividad = this.setFechaHora();
      this.prioridad.unidCodi = this.userDetail.unid_codi || '0'; // Asignar unidCodi del usuario actual

      this.prioridadservice.createPrioridad(this.prioridad).subscribe({
        next: (prioridadCreada) => {
          console.log('Prioridad creada con éxito:', prioridadCreada);
          this.cargarPrioridades(this.userDetail!.unid_codi!); // Recargar la lista de prioridades después de crear una nueva
          this.router.navigate(['/mant/prioridad']);
        },
        error: (error) => console.error('Error al crear la prioridad', error)
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

  onDeletePrioridad(id?: string): void {
    if (!id) {
      console.error('Intentando eliminar una prioridad sin ID válido' + id);
      return;
    }
  
    if (confirm('¿Estás seguro de que quieres eliminar esta prioridad?')) {
      this.prioridadservice.deletePrioridad(id).subscribe({
        next: (response) => {
          console.log(response);
          this.prioridades = this.prioridades.filter((prioridad) => prioridad.id !== id);
          this.filteredPrioridad = this.filteredPrioridad.filter((prioridad) => prioridad.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
    }
  }
}
