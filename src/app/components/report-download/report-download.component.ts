import { Component } from '@angular/core';
import { ReportService } from 'src/app/services/report/report.service';

@Component({
  selector: 'app-report-download',
  templateUrl: './report-download.component.html',
  styleUrls: ['./report-download.component.css']
})
export class ReportDownloadComponent {

  constructor(private reportService: ReportService) { }

  downloadReport(): void {
    const year = 2024; // Ejemplo, ajusta según sea necesario
    const month = 3; // Ejemplo, ajusta según sea necesario

    this.reportService.downloadMonthlyReport(year, month).subscribe(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Report_${month}_${year}.xlsx`;
      anchor.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
    });
  }
}
