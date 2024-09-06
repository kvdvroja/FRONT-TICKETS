import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Trabajos } from 'src/app/interfaces/Trabajos/Trabajos';

@Component({
  selector: 'app-config-edit-trabajos',
  templateUrl: './config-edit-trabajos.component.html',
  styleUrls: ['./config-edit-trabajos.component.css']
})
export class ConfigEditTrabajosComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfigEditTrabajosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { trabajo: Trabajos }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.trabajo);
  }
}
