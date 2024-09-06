import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-asignados-detalle',
  templateUrl: './asignados-detalle.component.html',
  styleUrls: ['./asignados-detalle.component.css']
})
export class AsignadosDetalleComponent implements OnInit {
  coordinadoresAdicionales: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AsignadosDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { breq_codi: string, coordinaciones: string[], coordinadoresAdicionales: any[] }
  ) {}

  ngOnInit(): void {
    if (this.data.coordinadoresAdicionales) {
      this.coordinadoresAdicionales = this.data.coordinadoresAdicionales;
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
