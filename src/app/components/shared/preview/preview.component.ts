import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  fileType = '';
  isSupported = true;
  selectedFileUrl: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { url: string },
    private dialogRef: MatDialogRef<PreviewComponent>,
    private sanitizer: DomSanitizer
  ) {
    if (!this.data || !this.data.url) {
      this.isSupported = false;
    }
  }

  ngOnInit(): void {
    if (this.data && this.data.url) {
      this.data.url = this.replaceHttpWithHttps(this.data.url);
      this.determineFileType(this.data.url);
    } else {
      this.isSupported = false;
    }
    console.log(this.data.url);
  }

  replaceHttpWithHttps(url: string): string {
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  }

  determineFileType(url: string): void {
    this.selectedFileUrl = this.sanitizeUrl(url);
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        this.fileType = 'pdf';
        break;
      case 'xls':
      case 'xlsx':
        this.fileType = 'excel';
        this.downloadAndClose(url);
        break;
      case 'txt':
        this.fileType = 'txt';
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        this.fileType = 'image';
        break;
      default:
        this.downloadAndClose(url);
        break;
    }
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  downloadAndClose(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() ?? 'download';
    link.click();
    this.dialogRef.close();
  }

  downloadFile(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() ?? 'download';
    link.style.display = 'none'; // Hacer el elemento 'a' invisible
    document.body.appendChild(link); // Agregar el elemento 'a' al DOM
    link.click(); // Simular el clic en el enlace
    document.body.removeChild(link); // Eliminar el elemento 'a' del DOM después de la descarga
  }
}
