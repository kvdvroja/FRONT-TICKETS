import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from 'src/app/services/report/report.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  constructor(
    private reportService: ReportService,
  ) {}


  ngOnInit() {
  }

  months = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 },
  ];


  selectedFechaInicio: Date | null = null;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = 0;


  downloadMonthlyReport(): void {
    if (!this.selectedYear || !this.selectedMonth) {
      alert('Por favor, selecciona un año y un mes válidos.');
      return;
    }

    this.reportService.downloadMonthlyReport(this.selectedYear, this.selectedMonth).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Report_${this.selectedMonth}_${this.selectedYear}.xlsx`;
      document.body.appendChild(anchor); // Necesario para Firefox
      anchor.click();
      window.URL.revokeObjectURL(url);
      anchor.remove();
    }, error => {
      console.error('Error al descargar el reporte:', error);
    });
  }
}
