
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { ConfigUsuariosService } from 'src/app/services/Configs/config-usuarios.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { ConfigFull } from 'src/app/interfaces/Config/configUsuario';
import { AsignarCatalogo } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { AsignarCatalogoService } from 'src/app/services/Assign/asignar-catalogo.service';
import * as moment from 'moment';
import { AsignarCatalogoFull } from 'src/app/interfaces/Asignacion/AsignarCatalogo';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-config-edit-catalogo',
  templateUrl: './config-edit-catalogo.component.html',
  styleUrls: ['./config-edit-catalogo.component.css']
})

export class ConfigEditCatalogoComponent implements OnInit {
  catalogoCtrl = new FormControl();
  filteredCatalogos!: Observable<Catalogo[]>;
  catalogos: Catalogo[] = [];
  selectedCatalogo: Catalogo | null = null;
  userDetail: UserDetail | null = null;
  asignarCatalogoEdit : AsignarCatalogo | null = null;

  constructor(
    public dialogRef: MatDialogRef<ConfigEditCatalogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignarCatalogoFull,
    private catalogoService: CatalogoService,
    private asignarCatalogoService: AsignarCatalogoService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.loadCatalogos();
    this.filteredCatalogos = this.catalogoCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCatalogos(value))
    );
    this.userDetail = this.authService.getCurrentUser();
  }

  loadCatalogos() {
    this.catalogoService.getCatalogosFilter().subscribe({
      next: (data) => {
        this.catalogos = data;
          this.selectedCatalogo = this.catalogos.find(catalogo => catalogo.codi === this.data.cata_codi) || null;
          console.log(this.catalogos)
          console.log(this.selectedCatalogo)
          this.catalogoCtrl.setValue(this.selectedCatalogo?.nombre || '', { emitEvent: true });
          console.log(this.catalogoCtrl)
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los catalogos', error);
        }
      }
    });
  }

  private _filterCatalogos(value: string | null): Catalogo[] {
    if (value === null) {
      return this.catalogos;
    }
    const filterValue = value.toLowerCase();
    return this.catalogos.filter(catalogo => catalogo.nombre.toLowerCase().includes(filterValue));
  }

  onCatalogoSelected(event: any): void {
    const selectedCatalogoName = event.option.value;
    this.selectedCatalogo = this.catalogos.find(catalogo => catalogo.nombre === selectedCatalogoName) || null;
    if (this.selectedCatalogo) {
      this.catalogoCtrl.setValue(this.selectedCatalogo.nombre, { emitEvent: false });
    }
  }

  onSave(): void {
    const params: AsignarCatalogo = {
      id : this.data.id,
      codi: this.data.codi,
      cata_codi: this.selectedCatalogo?.codi || '',
      usun_codi: this.data.usun_codi,
      fechaActividad: moment().format('DD/MM/YYYY HH:mm:ss'),
      idUsuario: this.userDetail?.idUsuario || '',
      estado : this.data.estado

    };
    this.asignarCatalogoEdit = {...params};

    console.log(params)
    this.asignarCatalogoService.updateAsignarCatalogo(this.asignarCatalogoEdit.id!, this.asignarCatalogoEdit).subscribe({
      next: (response) => {
        console.log('asignación actualizada:', response);
        this.dialogRef.close(true);
      },
      error: (e) => console.error('Error al asignar el catálogo', e),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
