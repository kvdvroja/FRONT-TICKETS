import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { CargosService } from 'src/app/services/selects/Cargos/cargos.service';
import { Cargos } from 'src/app/interfaces/selects/Cargos/cargos';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-cargos',
  templateUrl: './config-cargos.component.html',
  styleUrls: ['./config-cargos.component.css']
})

export class ConfigCargosComponent implements OnInit {

  @ViewChild('cargoForm') cargoForm!: NgForm;

  public cargo: Cargos = {
    id: '',
    codi: '',
    descripcion: '',
    fechaActividad: new Date().toISOString(),
    idUsuario: '',
    indEstado: '',
    unidCodi: '',
  }
  filteredCargo: Cargos[] = [];
  cargos: Cargos[] = [];
  userDetail: UserDetail | null = null;

  constructor(
    private cargosService: CargosService,
    private authService: AuthService,
    private unidadService: UnidadService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarCargos(unid_codi);
    });
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarCargos(initialUnidad);
  }

  cargarCargos(unid_codi: string): void {
    if (this.userDetail && unid_codi) {
      this.cargosService.getCargosByUnidCodi(unid_codi).subscribe({
        next: (data) => {
          this.cargos = data.filter(cargo => cargo.unidCodi === unid_codi);
          this.filteredCargo = [...this.cargos];
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Error al obtener cargos', error)
      });
    } else {
      console.error('No se pudo cargar cargos: falta unid_codi en userDetail.');
    }
  }

  createCargos(): void {
    if (!this.cargoForm.valid) {
      console.error('El formulario no es válido');
      return;
    }

    if (this.userDetail && this.userDetail.idUsuario && this.userDetail.unid_codi) {
      this.cargo.idUsuario = this.userDetail.idUsuario;
      this.cargo.indEstado = "A"
      this.cargo.unidCodi = this.userDetail.unid_codi;
      this.cargo.fechaActividad = this.setFechaHora();

      this.cargosService.createCargos(this.cargo).subscribe({
        next: (cargoCreado) => {
          console.log('Cargo creado con éxito:', cargoCreado);
          this.cargarCargos(this.userDetail!.unid_codi!); 
          this.router.navigate(['/mant/categoria']);
        },
        error: (error) => console.error('Error al crear el cargo', error)
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

  onDeleteCargo(id?: string): void {
    if (!id) {
      console.error('Intentando eliminar un cargo sin ID válido' + id);
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este cargo?')) {
      this.cargosService.deleteCargos(id).subscribe({
        next: (response) => {
          console.log(response);
          this.cargos = this.cargos.filter((cargo) => cargo.id !== id);
          this.filteredCargo = this.filteredCargo.filter((cargo) => cargo.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
    }
  }

  
}
