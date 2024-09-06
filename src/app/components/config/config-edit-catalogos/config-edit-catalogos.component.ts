
import { ConfigEditCatalogoComponent } from '../config-edit-catalogo/config-edit-catalogo.component';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
@Component({
  selector: 'app-config-edit-catalogos',
  templateUrl: './config-edit-catalogos.component.html',
  styleUrls: ['./config-edit-catalogos.component.css']
})
export class ConfigEditCatalogosComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfigEditCatalogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { catalogo: Catalogo }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.catalogo);
  }
}
