import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';

@Component({
  selector: 'app-config-edit-tipologia',
  templateUrl: './config-edit-tipologia.component.html',
  styleUrls: ['./config-edit-tipologia.component.css']
})
export class ConfigEditTipologiaComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfigEditTipologiaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tipologia: Tipologia }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.tipologia);
  }
}
