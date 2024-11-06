import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/services/ticket.service';
import { Ticket } from 'src/app/interfaces/ticket';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AsignarCategoriaService } from 'src/app/services/Assign/asignar-categoria.service'; // Asegúrate de importar el servicio correcto
import { AsignarCategoria } from 'src/app/interfaces/AsignarCategoria'; // Importar el modelo adecuado
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { MatDialog } from '@angular/material/dialog';
import { UbicacionDialogComponent } from '../../shared/ubicacion-dialog/ubicacion-dialog.component';


Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-final-message',
  templateUrl: './final-message.component.html',
  styleUrls: ['./final-message.component.css']
})
export class FinalMessageComponent implements OnInit {
  public editorInstance: Quill | null = null;
  descEditor: string = '';
  editorConfig = {
    imageDrop: true,
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };
  public finalMessage = '';
  selectedFiles: File[] = [];
  ticket: Ticket;
  isLoading: boolean = false;
  ubicacionJerarquia: string = '';
  campusF: string = '';

  constructor(
    private dialogRef: MatDialogRef<FinalMessageComponent>,
    private ticketService: TicketService,
    private asignarCategoriaService: AsignarCategoriaService, // Inyectar el servicio correcto
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket },
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.ticket = data.ticket;
  }

  ngOnInit(): void {
    // Inicialización necesaria
  }

  setFechaHora(): string {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Lima'
    });

    const hora = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
      hour12: true
    });

    return `${fecha} - ${hora}`;
  }

  public setEditorInstance(editor: Quill): void {
    this.editorInstance = editor;
    this.editorInstance.on('text-change', () => {
      this.descEditor = this.editorInstance!.root.innerHTML;
    });
  }

  public onEditorChange(event: any): void {
    const content = event.editor.root.innerHTML;
    this.descEditor = content;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onChangeTicketStatus(close: boolean): void {
    if (this.ticket && this.ticket.id) {
      const confirmation = confirm(close ? "¿Desea cerrar el ticket?" : "¿Desea abrir el ticket?");
      if (confirmation) {
        this.isLoading = true;
        const fechaYHora = close ? this.setFechaHora() : this.ticket.fechaCierre;

        // Obtener las categorías asignadas actuales
        this.asignarCategoriaService.getAsignacionCategoriaByBreq(this.ticket.ticketID).subscribe({
          next: (asignaciones: AsignarCategoria[]) => {
            const categoriasAsignadas = asignaciones.map((asignacion: AsignarCategoria) => asignacion.cate_codi);

            // Actualizar el ticket con las categorías asignadas actuales
            const updatedTicket = {
              ...this.ticket,
              mensaje_final: this.descEditor,
              estado: close ? 'Cerrado' : 'Recibido',
              fechaCierre: fechaYHora,
              cate_codi_asignar: categoriasAsignadas // Asignar las categorías actuales
            };

            // Enviar la actualización en segundo plano
            this.ticketService.updateTicketEstado(this.ticket.id!, updatedTicket).subscribe({
              next: (data) => {
                this.isLoading = false;
                this.snackBar.open('Estado del ticket actualizado', 'Cerrar', {
                  duration: 3000,
                });
                this.router.navigate(['/menu/list-tickets']);
                this.dialogRef.close();
              },
              error: (err) => {
                console.error('Error al actualizar el estado del ticket:', err);
                this.isLoading = false;
                this.snackBar.open('Error al actualizar el ticket', 'Cerrar', {
                  duration: 3000,
                });
              }
            });
          },
          error: (err: any) => {
            console.error('Error al obtener categorías asignadas:', err);
            this.isLoading = false;
            this.snackBar.open('Error al obtener categorías asignadas', 'Cerrar', {
              duration: 3000,
            });
          }
        });
      }
    } else {
      console.error('No se ha seleccionado ningún ticket o falta el ID del ticket.');
    }
  }

  openUbicacion() {
    const dialogRef = this.dialog.open(UbicacionDialogComponent, {
      width: '800px'
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { codi, campus, pabellon, pabellon_desc, aula, aula_desc } = result;
        if(campus == "M"){
          this.campusF = "TRUJILLO"
        }
        else if(campus == "PI"){
          this.campusF = "PIURA"
        }
        this.ticket.ubicacion = codi;
        this.ubicacionJerarquia = `${this.campusF} > ${pabellon_desc} > ${aula} (${aula_desc})`;
      }
    });
  }
}
