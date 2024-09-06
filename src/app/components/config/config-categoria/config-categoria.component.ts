import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Unidad } from 'src/app/interfaces/Unidad/unidad';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-config-categoria',
  templateUrl: './config-categoria.component.html',
  styleUrls: ['./config-categoria.component.css']
})
export class ConfigCategoriaComponent implements OnInit {
  @ViewChild('categoriaForm') categoriaForm!: NgForm;

  limpiarHTML(contenidoHTML: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = contenidoHTML;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  public categoria: Categoria = {
    id: '',
    codi: '',
    descripcion: '',
    indServUser:'',
    padreCodi:'',
    estado:'',
    fechaActividad: '',
    idUsuario: '',
    unidCodi: ''
  }
  filteredCategoria: Categoria[] = [];
  categorias: Categoria[] = [];
  userDetail: UserDetail | null = null;

  constructor(
    private categoriaservice: CategoriaService,
    private domSanitizer: DomSanitizer,
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
      this.cargarCategorias(unid_codi);
    });

    // Cargar categorías según la unidad seleccionada inicialmente
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarCategorias(initialUnidad);
  }

  cargarCategorias(unid_codi: string): void {
    this.categoriaservice.getCategorias().subscribe({
      next: (data) => {
        // Filtrar categorías según la unidad seleccionada
        this.categorias = data.filter(categoria => categoria.unidCodi === unid_codi);
        this.filteredCategoria = [...this.categorias];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al obtener categorías', error)
    });
  }

  createCategoria(): void {
    console.log('Objeto categoría a enviar:', this.categoria);
    
    if (!this.categoriaForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    if (this.userDetail && this.userDetail.idUsuario) {
      this.categoria.fechaActividad = this.setFechaHora();
      this.categoria.idUsuario = this.userDetail.idUsuario;
      this.categoria.unidCodi = this.userDetail.unid_codi || '0'; // Asignar unidCodi del usuario actual
      this.categoria.estado = "A"
      this.categoria.indServUser = "string"
      this.categoria.padreCodi = "string"
      this.categoriaservice.createCategoria(this.categoria).subscribe({
        next: (categoriaCreada) => {
          console.log('Categoría creada con éxito:', categoriaCreada);
          this.cargarCategorias(this.userDetail!.unid_codi!); // Recargar la lista de categorías después de crear una nueva
          this.router.navigate(['/mant/categoria']);
        },
        error: (error) => console.error('Error al crear la categoría', error)
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

  onDeleteCategoria(id?: string): void {
    if (!id) {
      console.error('Intentando eliminar una categoría sin ID válido' + id);
      return;
    }
  
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.categoriaservice.deleteCategoria(id).subscribe({
        next: (response) => {
          console.log(response);
          this.categorias = this.categorias.filter((categoria) => categoria.id !== id);
          this.filteredCategoria = this.filteredCategoria.filter((categoria) => categoria.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
    }
  }
}
