import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
@Component({
  selector: 'app-config-edit-organizacion',
  templateUrl: './config-edit-organizacion.component.html',
  styleUrls: ['./config-edit-organizacion.component.css']
})
export class ConfigEditOrganizacionComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfigEditOrganizacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organizacion: Organizacion }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.organizacion);
  }
}
