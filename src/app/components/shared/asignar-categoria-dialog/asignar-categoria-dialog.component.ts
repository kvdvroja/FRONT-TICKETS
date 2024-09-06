// asignar-categoria-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';

@Component({
  selector: 'app-asignar-categoria-dialog',
  templateUrl: './asignar-categoria-dialog.component.html',
  styleUrls: ['./asignar-categoria-dialog.component.css']
})
export class AsignarCategoriaDialogComponent implements OnInit {
  categoriass: Categoria[] = [];

  constructor(
    public dialogRef: MatDialogRef<AsignarCategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categorias: AsignarCategoria[], allCategorias: Categoria[] }
  ) {}

  ngOnInit() {
    this.categoriass = this.data.allCategorias;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCategoriaSelect(categoria: AsignarCategoria): void {
    this.dialogRef.close(categoria);
  }

  getCategoriaDescripcion(cateCodi: string): string {
    const categoria = this.categoriass.find(cat => cat.codi === cateCodi);
    return categoria ? categoria.descripcion : 'Categoría no encontrada';
  }
}
