import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from 'src/app/services/Dashboard/dashboard.service';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle } from 'ng-apexcharts';
import * as moment from 'moment';
import { Moment } from 'moment';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { lastValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const MY_FORMATS_FULL = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DashboardComponent implements OnInit {
  selectedFecha: Moment;
  chosenYearDate: Moment;

  public chartOptions2: any;
  public chartOptions3: any;
  public chartOptions4: any;
  public chartOptions5: any;
  
  selectedFechaInicio: Date | null = null;
  catalogos: any[] = [];
  userDetail: UserDetail | null = null;
  unidCodi = '';
  selectedFechaFin: Date | null = null;
  selectedFiltro: string = 'MesAnio';
  date = new FormControl(moment());
  dateInicio = new FormControl(moment());
  dateFin = new FormControl(moment());
  inicial: any = {
    cantidad: [],
    labels: []
  };

  constructor(private adapter: DateAdapter<any>, private dashboardService: DashboardService,private unidadService:UnidadService, private changeDetectorRef: ChangeDetectorRef, private authService: AuthService) {
    this.selectedFecha = moment();
    this.chosenYearDate = moment();
    this.adapter.setLocale('es');
  }

  ngOnInit(): void {
    this.selectedFecha = moment();
    this.userDetail = this.authService.getCurrentUser();
    const currentMonth = this.selectedFecha.month() + 1; // months are 0-indexed in moment.js
    const currentYear = this.selectedFecha.year();
    this.unidCodi = this.userDetail!.unid_codi || '';
  
    // Inicializa los datos con la unidad predeterminada
    this.InicializarDatos(currentMonth, currentYear, this.unidCodi);
  
    // Suscríbete a los cambios de unidad
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      if (unid_codi && unid_codi !== 'Seleccione') {
        console.log("Cambio de unidad detectado:", unid_codi);
        this.unidCodi = unid_codi;
        this.InicializarDatos(currentMonth, currentYear, this.unidCodi);  // Recarga los tickets basados en la nueva unidad
      }
    });
  }
  

  async InicializarDatos(month: number, year: number, unidCodi: string): Promise<void> {
    await Promise.all([
      this.GetDataTotales(month, year, unidCodi),
      this.GetDataCoordinacion(month, year, unidCodi),
      this.GetDataTipologia(month, year, unidCodi),
      this.GetDataOrganizaciones(month, year, unidCodi),
      this.loadAllCatalogs(month, year, unidCodi)
    ]);
    this.changeDetectorRef.detectChanges();
  }

  aplicarFiltros() {
    if (this.selectedFiltro === 'MesAnio') {
      this.changeDateFormat(MY_FORMATS);
    } else if (this.selectedFiltro === 'EntreFechas') {
      this.changeDateFormat(MY_FORMATS_FULL);
    }
    this.adapter.setLocale('es'); // Reset the locale to trigger the date format update
  }

  changeDateFormat(format: any) {
    (this.adapter as MomentDateAdapter).setLocale('es');
    (this.adapter as any).formats = format;
    (this.adapter as any).formats = { ...format };
  }

  async setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
    await this.InicializarDatos(ctrlValue.month() + 1, ctrlValue.year(), this.unidCodi);
  }
  

  setDayMonthYear(normalizedDayMonthYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.dateInicio.value ?? moment();
    ctrlValue.date(normalizedDayMonthYear.date());
    ctrlValue.month(normalizedDayMonthYear.month());
    ctrlValue.year(normalizedDayMonthYear.year());
    this.dateInicio.setValue(ctrlValue);
    datepicker.close();
  }

  fechaFinFiltro = (d: Moment | null): boolean => {
    const fechaInicio = this.selectedFechaInicio;
    return d ? !fechaInicio || d.isSameOrAfter(fechaInicio, 'day') : true;
  };

  async GetDataTotales(month: number, year: number, unidCodi: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.dashboardService.getTicketByEstado(month, year, unidCodi));
      this.chartOptions4 = { ...this.construirDonut(data) };
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  }

  async GetDataCoordinacion(month: number, year: number, unidCodi: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.dashboardService.getTicketByCoordinacion(month, year, unidCodi));
      this.chartOptions2 = { ...this.construirBar(data) };
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  }

  async GetDataTipologia(month: number, year: number, unidCodi: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.dashboardService.getTicketByTipologia(month, year, unidCodi));
      this.chartOptions3 = { ...this.construirBar(data) };
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  }

  async GetDataOrganizaciones(month: number, year: number, unidCodi: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.dashboardService.getTicketByOrganizacion(month, year, unidCodi));
      this.chartOptions5 = { ...this.construirChart(data) };
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  }

  async loadAllCatalogs(month: number, year: number, unidCodi: string): Promise<void> {
    try {
      const data = await lastValueFrom(this.dashboardService.getCatalogo(month, year, unidCodi));
      this.catalogos = this.transformData(data.labels, data.cantidad);
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  }

  transformData(labels: string[], cantidad: number[]): any[] {
    const catalogMap = new Map();

    labels.forEach((label, index) => {
      const parts = label.split(' > ');
      this.addToMap(catalogMap, parts, cantidad[index]);
    });

    return this.convertMapToArray(catalogMap);
  }

  addToMap(map: Map<string, any>, parts: string[], cantidad: number) {
    if (parts.length === 0) return;

    const [first, ...rest] = parts;
    if (!map.has(first)) {
      map.set(first, {
        name: first,
        cantidad: 0,
        children: new Map()
      });
    }

    const node = map.get(first);
    node.cantidad += cantidad;

    this.addToMap(node.children, rest, cantidad);
  }

  convertMapToArray(map: Map<string, any>): any[] {
    return Array.from(map.values()).map(({ name, cantidad, children }) => ({
      name,
      cantidad,
      children: this.convertMapToArray(children)
    }));
  }

  toggleNode(node: any): void {
    node.expanded = !node.expanded;
  }

  getChildren(row: any): any[] {
    return this.catalogos.filter(item => item.parts.slice(0, row.parts.length).join(' > ') === row.parts.join(' > ') && item.parts.length === row.parts.length + 1);
  }

  construirChart(data: any) {
    const chartBar = {
      series: [
        {
          name: "Cant. Tickets",
          data: data.cantidad
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2
      },

      grid: {
        row: {
          colors: ["#fff", "#f2f2f2"]
        }
      },
      xaxis: {
        labels: {
          rotate: -45
        },
        categories: data.labels,
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: "Cantidad"
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100]
        }
      }
    }
    return chartBar;
  }

  construirDonut(data: any) {
    const chartOptions = {
      series: data.cantidad!,
      chart: {
        width: 380,
        type: "donut",
      },
      stroke: {
        width: 0
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true
              }
            }
          }
        }
      },
      labels: data.labels,
      dataLabels: {
        dropShadow: {
          blur: 3,
          opacity: 0.8
        }
      },

      states: {
        hover: {
          filter: {
            type: "none"
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
    return chartOptions;
  }

  construirBar(data: any) {
    const chartOptions = {
      series: data.cantidad!,
      chart: {
        width: 380,
        type: "pie",
        height: 350,
      },
      labels: data.labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
    return chartOptions;
  }
}
