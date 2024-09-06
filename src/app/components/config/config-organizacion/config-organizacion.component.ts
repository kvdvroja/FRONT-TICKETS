import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { SequenceService } from 'src/app/services/sequence.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/Auth/auth.service';
import * as moment from 'moment';
import { ConfigEditOrganizacionComponent } from 'src/app/components/config/config-edit-organizacion/config-edit-organizacion.component';

@Component({
  selector: 'app-config-organizacion',
  templateUrl: './config-organizacion.component.html',
  styleUrls: ['./config-organizacion.component.css']
})
export class ConfigOrganizacionComponent implements OnInit {
  @ViewChild('organizacionForm') organizacionForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public organizacion: Organizacion = {
    id: '',
    codi: '',
    descripcion: '',
    fechaActividad: new Date().toISOString(),
    idUsuario: '',
    codigoBanner: '',
    unidCodi: '',
    indEstado: ''
  }
  organizacionEnviar : any;

  filteredOrganizacion: Organizacion[] = [];
  organizaciones: Organizacion[] = [];
  userDetail: UserDetail | null = null;
  displayedColumns: string[] = ['codi', 'descripcion', 'acciones'];
  dataSource = new MatTableDataSource<Organizacion>();

  constructor(
    private organizacionService: OrganizacionService,
    private sequenceService : SequenceService,
    private domSanitizer: DomSanitizer,
    private authService : AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router) {}

  ngOnInit() {
    this.cargarOrganizaciones();
    this.userDetail = this.authService.getCurrentUser();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarOrganizaciones(): void {
    this.organizacionService.getOrganizaciones().subscribe({
      next: (data) => {
        this.organizaciones = data;
        this.filteredOrganizacion = [...this.organizaciones];
        this.dataSource.data = this.filteredOrganizacion;
      },
      error: (error) => console.error('Error al obtener organizaciones', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createOrganizacion(): void {
    console.log('Objeto organizacion a enviar:', this.organizacion);
    
    if (!this.organizacionForm.valid) {
      console.error('El formulario no es válido');
      return;
    }
  
    if (this.userDetail && this.userDetail.idUsuario) {
      this.organizacion.idUsuario = this.userDetail.idUsuario;
      this.organizacion.unidCodi = this.userDetail.unid_codi || '0';

      this.organizacionService.createOrganizacion(this.organizacion).subscribe({
        next: (organizacionCreada) => {
          console.log('Organización creada con éxito:', organizacionCreada);
          this.cargarOrganizaciones();
          this.router.navigate(['/mant/organizacion']);
        },
        error: (error) => {
          console.error('Error al crear la organización', error);
        }
      });
    } else {
      console.error('No hay usuario actual');
      return;
    }
  }
  onEditOrganizacion(organizacion: Organizacion): void {
    const dialogRef = this.dialog.open(ConfigEditOrganizacionComponent, {
      width: '600px',
      data: { organizacion }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizacionService.updateOrganizacion(result.id, result).subscribe({
          next: (response) => {
            console.log('Organización actualizada:', response);
            this.cargarOrganizaciones();
          },
          error: (e) => console.error('Error al actualizar la organización', e),
        });
      }
    });
  }


  onDeleteOrganizacion(organizacion?: Organizacion): void {
    if (!organizacion || !organizacion.id) {
      console.error('Organización no válida para cambiar estado');
      return;
    }

    const nuevoEstado = organizacion.indEstado === 'I' ? 'A' : 'I';
    const organizacionEnviar = { 
      ...organizacion, 
      indEstado: nuevoEstado, 
      fechaActividad: moment().format('DD/MM/YYYY') 
    };

    this.organizacionService.updateOrganizacion(organizacion.id, organizacionEnviar).subscribe({
      next: (response) => {
        console.log('Organización actualizada:', response);
        this.cargarOrganizaciones();
      },
      error: (e) => console.error('Error al actualizar la organización', e),
    });
  }
}
