import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { viaRecepcion } from 'src/app/interfaces/selects/ViaRecepcion/viaRecepcion';
@Component({
  selector: 'app-config-edit-vias',
  templateUrl: './config-edit-vias.component.html',
  styleUrls: ['./config-edit-vias.component.css']
})
export class ConfigEditViasComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfigEditViasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { via: viaRecepcion }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.via);
  }
}
