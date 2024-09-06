import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigEditTipologiaComponent } from 'src/app/components/config/config-edit-tipologia/config-edit-tipologia.component';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

@Component({
  selector: 'app-config-tipologia',
  templateUrl: './config-tipologia.component.html',
  styleUrls: ['./config-tipologia.component.css']
})
export class ConfigTipologiaComponent implements OnInit, AfterViewInit {
  @ViewChild('tipologiaForm') tipologiaForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public tipologia: Tipologia = {
    id: '',
    codi: '',
    imagen: '',
    descripcion: '',
    fechaActividad: moment().format('DD/MM/YYYY'),
    idUsuario: '',
    codigoBanner: '',
    unidCodi: '',
    indEstado: ''
  };
  filteredTipologia: Tipologia[] = [];
  tipologias: Tipologia[] = [];
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'descripcion', 'acciones'];
  dataSource = new MatTableDataSource<Tipologia>();

  constructor(
    private tipologiaService: TipologiaService,
    private authService: AuthService,
    private unidadService: UnidadService, // Integrar UnidadService
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();

    // Suscribirse a los cambios en la unidad seleccionada
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      console.log("Unidad seleccionada cambiada a:", unid_codi);
      this.cargarTipologias(unid_codi);
    });

    // Cargar tipologías según la unidad seleccionada inicialmente
    const initialUnidad = this.unidadService.getUnidadSeleccionada();
    this.cargarTipologias(initialUnidad);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarTipologias(unid_codi: string): void {
    this.tipologiaService.getTipologia().subscribe({
      next: (data) => {
        // Filtrar tipologías según la unidad seleccionada
        this.tipologias = data.filter(tipologia => tipologia.unidCodi === unid_codi);
        this.filteredTipologia = [...this.tipologias];
        this.dataSource.data = this.filteredTipologia;
      },
      error: (error) => console.error('Error al obtener tipologías', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTipologia(): void {
    console.log('Objeto tipología a enviar:', this.tipologia);
    
    if (!this.tipologiaForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    if (this.userDetail && this.userDetail.idUsuario) {
      this.tipologia.idUsuario = this.userDetail.idUsuario;
      this.tipologia.unidCodi = this.userDetail.unid_codi || '0';
      this.tipologia.indEstado = "A"

      this.tipologiaService.createTipologia(this.tipologia).subscribe({
        next: (tipologiaCreada) => {
          console.log('Tipología creada con éxito:', tipologiaCreada);
          this.cargarTipologias(this.userDetail!.unid_codi!);
          this.router.navigate(['/mant/tipologia']);
        },
        error: (error) => {
          console.error('Error al crear la tipología', error);
        }
      });
    } else {
      console.error('No hay usuario actual');
      return;
    }
  }

  onEditTipologia(tipologia: Tipologia): void {
    const dialogRef = this.dialog.open(ConfigEditTipologiaComponent, {
      width: '600px',
      data: { tipologia }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tipologiaService.updateTipologia(result.id, result).subscribe({
          next: (response) => {
            console.log('Tipología actualizada:', response);
            this.cargarTipologias(this.userDetail!.unid_codi!);
          },
          error: (e) => console.error('Error al actualizar la tipología', e),
        });
      }
    });
  }

  onDeleteTipologia(tipologia: Tipologia): void {
    if (!tipologia || !tipologia.id) {
      console.error('Tipología no válida para cambiar estado');
      return;
    }

    const nuevoEstado = tipologia.indEstado === 'I' ? 'A' : 'I';
    const tipologiaEnviar = { 
      ...tipologia, 
      indEstado: nuevoEstado, 
      fechaActividad: moment().format('DD/MM/YYYY') 
    };

    this.tipologiaService.updateTipologia(tipologia.id, tipologiaEnviar).subscribe({
      next: (response) => {
        console.log('Tipología actualizada:', response);
        this.cargarTipologias(this.userDetail!.unid_codi!);
      },
      error: (e) => console.error('Error al actualizar la tipología', e),
    });
  }
}
