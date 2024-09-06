import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponsesService } from 'src/app/services/Responses/responses.service';
import { Responses } from 'src/app/interfaces/Responses/responses';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { AdjuntoService } from 'src/app/services/Attach/adjunto.service';
import { AdjuntoInfo } from 'src/app/interfaces/AdjuntoInfo';
import { MatSnackBar } from '@angular/material/snack-bar';

Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-editar-respuesta',
  templateUrl: './editar-respuesta.component.html',
  styleUrls: ['./editar-respuesta.component.css']
})
export class EditarRespuestaComponent {
  respuesta: Responses;
  public editorInstance: Quill | null = null;
  descEditor: string = '';
  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  selectedFiles: File[] = [];
  existingAdjuntos: AdjuntoInfo[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditarRespuestaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { respuesta: Responses },
    private responsesService: ResponsesService,
    private adjuntoService: AdjuntoService,
    private snackBar: MatSnackBar
  ) {
    this.respuesta = { ...data.respuesta };
    this.descEditor = this.respuesta.descripcion || '';
    this.loadExistingAdjuntos(this.respuesta.codi!);
  }

  loadExistingAdjuntos(respuestaId: string): void {
    this.adjuntoService.getAdjuntosByRespuestaId(respuestaId).subscribe({
      next: (adjuntos) => {
        this.existingAdjuntos = adjuntos;
      },
      error: (error) => {
        console.error('Error al cargar los adjuntos existentes:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  removeAdjunto(adjuntoId: string): void {
    this.adjuntoService.deleteAdjunto(adjuntoId).subscribe({
      next: () => {
        this.existingAdjuntos = this.existingAdjuntos.filter(a => a.id !== adjuntoId);
        this.snackBar.open('Adjunto eliminado', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error al eliminar adjunto:', error);
        this.snackBar.open('Error al eliminar adjunto', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.respuesta.descripcion = this.descEditor; // Asegúrate de actualizar la descripción

    // Primero, actualizar la respuesta sin los adjuntos
    this.responsesService.updateResponses(this.respuesta.codi!, this.respuesta).subscribe({
      next: (response) => {
        console.log('Respuesta actualizada:', response);

        // Luego, si hay archivos seleccionados, subirlos
        if (this.selectedFiles.length > 0) {
          const formData = new FormData();
          this.selectedFiles.forEach(file => {
            formData.append('files', file, file.name);
          });
          formData.append('respuestaId', this.respuesta.codi!);

          this.responsesService.createResponseWithAttachments(formData).subscribe({
            next: (uploadResponse) => {
              console.log('Archivos subidos:', uploadResponse);
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error al subir archivos:', error);
              this.dialogRef.close(true); // Aún cerrar el diálogo si hay un error al subir archivos
            }
          });
        } else {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        console.error('Error al actualizar respuesta:', error);
      }
    });
  }

  public setEditorInstance(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.root.innerHTML = this.descEditor;
  }

  public onEditorChange(event: any): void {
    this.descEditor = event.html;
  }
}
