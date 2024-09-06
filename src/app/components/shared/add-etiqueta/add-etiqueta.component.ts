import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EtiquetaService } from 'src/app/services/Etiqueta/etiqueta.service';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { RegistrarEtiqueta } from 'src/app/interfaces/Etiqueta/RegistrarEtiqueta';
import { RegistroEtiquetasService } from 'src/app/services/Etiqueta/registro-etiquetas.service';
import { Etiqueta } from 'src/app/interfaces/Etiqueta/Etiqueta';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-add-etiqueta',
  templateUrl: './add-etiqueta.component.html',
  styleUrls: ['./add-etiqueta.component.css']
})
export class AddEtiquetaComponent implements OnInit {
  @Output() etiquetasCambiadas = new EventEmitter<Etiqueta[]>();
  etiquetaForm!: FormGroup;
  etiquetas: Etiqueta[] = [];
  mostrarFormulario = false;
  userDetail: UserDetail | null = null;
  etiquetasFiltradas: Etiqueta[] = [];
  etiquetasSeleccionadas: Etiqueta[] = [];
  editandoEtiqueta: Etiqueta | null = null;
  unid_codi: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { tareaCodi: string },
    private fb: FormBuilder,
    private etiquetaService: EtiquetaService,
    private authService: AuthService,
    private registroEtiquetasService: RegistroEtiquetasService,
    private unidadService: UnidadService
  ) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
    this.unid_codi = this.userDetail?.unid_codi || '';

    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      this.unid_codi = unid_codi; // Actualizar el unid_codi cuando cambia en el sidebar
      this.cargarEtiquetas();
    });

    this.etiquetaForm = this.fb.group({
      nombre: ['', Validators.required],
      color: ['#FF0000', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]]
    });
    this.cargarEtiquetas();
  }

  cargarEtiquetasSeleccionadas() {
    this.registroEtiquetasService.getRegistroEtiquetasByRan1Codi(this.data.tareaCodi).subscribe(
      (registros) => {
        const etiquetasIds = registros.map(registro => registro.etiq_codi);
        this.etiquetasSeleccionadas = this.etiquetas.filter(etiqueta => etiquetasIds.includes(etiqueta.codi));
        this.etiquetasFiltradas = this.etiquetas;
      },
      (error) => {
        console.error('Error al cargar etiquetas seleccionadas:', error);
      }
    );
  }

  onColorChange(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      this.etiquetaForm.patchValue({ color: color });
    } else {
      console.error('Color inválido:', color);
    }
  }


  toggleSeleccionEtiqueta(etiqueta: Etiqueta) {
    const index = this.etiquetasSeleccionadas.findIndex(e => e.codi === etiqueta.codi);
    if (index > -1) {
      this.etiquetasSeleccionadas.splice(index, 1);
      this.eliminarRegistroEtiqueta(etiqueta);
    } else {
      this.etiquetasSeleccionadas.push(etiqueta);
      this.createRegistroEtiqueta(etiqueta);
    }

    // Emitir el evento cuando cambian las etiquetas seleccionadas
    this.etiquetasCambiadas.emit(this.etiquetasSeleccionadas);
  }
  formatFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const periodo = hora >= 12 ? 'p. m.' : 'a. m.';
    const horaFormato12 = hora % 12 || 12;

    return `${dia}/${mes}/${anio} - ${horaFormato12}:${minuto} ${periodo}`;
  }

  cargarEtiquetas() {
    if (!this.unid_codi) {
      console.error('El unid_codi no está definido.');
      return;
    }

    this.etiquetaService.getEtiquetasByUnidCodi(this.unid_codi).subscribe(
      (etiquetas) => {
        this.etiquetas = etiquetas.map(etiqueta => ({
          ...etiqueta,
          color: etiqueta.color_fondo || '#000000' // Asume un color por defecto si no existe
        }));
        this.etiquetasFiltradas = this.etiquetas;
        this.cargarEtiquetasSeleccionadas();
      },
      (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    );
  }

  guardarEtiqueta() {
    if (this.etiquetaForm.valid) {
      const nuevaEtiqueta: Etiqueta = {
        ...this.editandoEtiqueta,
        ...this.etiquetaForm.value,
        color_fondo: this.etiquetaForm.get('color')?.value
      };

      if (this.editandoEtiqueta) {
        // Editar etiqueta existente
        if (/^#[0-9A-F]{6}$/i.test(nuevaEtiqueta.color_fondo)) {
          this.etiquetaService.updateEtiqueta(nuevaEtiqueta.codi!, nuevaEtiqueta).subscribe(
            () => {
              console.log('Etiqueta actualizada');
              const index = this.etiquetas.findIndex(e => e.codi === nuevaEtiqueta.codi);
              if (index > -1) {
                this.etiquetas[index] = nuevaEtiqueta;
              }
              this.resetForm();
            },
            (error) => {
              console.error('Error al actualizar etiqueta:', error);
            }
          );
        } else {
          console.error('Color inválido:', nuevaEtiqueta.color_fondo);
        }
      } else {
        // Crear nueva etiqueta
        const nuevaEtiqueta: Etiqueta = {
          codi: '',
          unid_codi: this.unid_codi,
          nombre: this.etiquetaForm.value.nombre,
          color_letra: '#FFFFFF',
          color_fondo: this.etiquetaForm.get('color')?.value,
          fechaActividad: this.formatFecha(new Date()),
          idUsuario: this.userDetail!.idUsuario
        };
        this.etiquetaService.createEtiqueta(nuevaEtiqueta).subscribe(
          (etiquetaCreada) => {
            console.log('Etiqueta creada:', etiquetaCreada);
            this.etiquetas.push({
              ...etiquetaCreada,
              color: this.etiquetaForm.get('color')?.value // Asignar el color_fondo aquí
            });
            this.resetForm();
          },
          (error) => {
            console.error('Error al crear etiqueta:', error);
          }
        );
      }
    }
  }

  resetForm() {
    this.etiquetaForm.reset({ color: '#FF0000' }); // Establecer un valor por defecto para el color
    this.mostrarFormulario = false;
    this.editandoEtiqueta = null;
  }

  createRegistroEtiqueta(etiqueta: Etiqueta) {
    const nuevoRegistro: RegistrarEtiqueta = {
      codi: '',
      ran1_codi: this.data.tareaCodi,
      etiq_codi: etiqueta.codi,
      fechaActividad: this.formatFecha(new Date()),
      idUsuario: this.userDetail!.idUsuario
    };

    this.registroEtiquetasService.createRegistroEtiqueta(nuevoRegistro).subscribe(
      response => {
        console.log('Etiqueta creada:', response);
      },
      error => {
        console.error('Error al crear etiqueta:', error);
      }
    );
  }

  eliminarRegistroEtiqueta(etiqueta: Etiqueta) {
    this.registroEtiquetasService.getRegistroEtiquetasByRan1Codi(this.data.tareaCodi).subscribe(
      (registros) => {
        const registro = registros.find(r => r.etiq_codi === etiqueta.codi);
        if (registro) {
          this.registroEtiquetasService.deleteRegistroEtiqueta(registro.id!).subscribe(
            () => {
              console.log('Registro de etiqueta eliminado');
            },
            (error) => {
              console.error('Error al eliminar registro de etiqueta:', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error al cargar registros de etiquetas:', error);
      }
    );
  }

  eliminarEtiqueta(codi: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta etiqueta?')) {
      this.etiquetaService.deleteEtiqueta(codi).subscribe(
        () => {
          console.log('Etiqueta eliminada');
          this.cargarEtiquetas(); // Vuelve a cargar las etiquetas
        },
        (error) => {
          console.error('Error al eliminar etiqueta:', error);
        }
      );
    }
  }

  toggleFormulario() {
    if (this.mostrarFormulario) {
      this.resetForm();
    } else {
      this.mostrarFormulario = true;
      this.editandoEtiqueta = null; // Restablecer el estado de edición
      this.etiquetaForm.reset({ color: '#FF0000' }); // Establecer un valor por defecto para el color
    }
  }

  guardarSeleccion() {
    console.log('Etiquetas seleccionadas:', this.etiquetasSeleccionadas);
  }

  filtrarEtiquetas(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.etiquetasFiltradas = this.etiquetas.filter(etiqueta =>
      etiqueta.nombre.toLowerCase().includes(searchTerm)
    );
  }

  editarEtiqueta(codi: string) {
    this.etiquetaService.getEtiquetaByCodi(codi).subscribe(
      (etiqueta) => {
        this.editandoEtiqueta = etiqueta;
        this.etiquetaForm.patchValue({
          nombre: etiqueta.nombre,
          color: etiqueta.color_fondo
        });
        this.mostrarFormulario = true;
      },
      (error) => {
        console.error('Error al cargar etiqueta:', error);
      }
    );
  }
}
