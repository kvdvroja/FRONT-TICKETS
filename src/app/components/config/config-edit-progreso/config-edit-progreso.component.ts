import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Progreso } from 'src/app/interfaces/Progreso/Progreso';

@Component({
  selector: 'app-config-edit-progreso',
  templateUrl: './config-edit-progreso.component.html',
  styleUrls: ['./config-edit-progreso.component.css']
})
export class ConfigEditProgresoComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfigEditProgresoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { progreso: Progreso }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.progreso);
  }
}
