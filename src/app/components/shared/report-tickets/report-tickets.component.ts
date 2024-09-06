import { AfterViewInit, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Moment } from 'moment';
import { ChangeDetectorRef } from '@angular/core';
import { Catalogo } from 'src/app/interfaces/Catalogo/Catalogo';
import { CatalogoService } from 'src/app/services/Catalogo/catalogo.service';
import { OrganizacionService } from 'src/app/services/selects/Organizacion/organizacion.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Organizacion } from 'src/app/interfaces/selects/Organizacion/organizacion';
import { Tipologia } from 'src/app/interfaces/selects/Tipologia/tipologia';
import { TipologiaService } from 'src/app/services/selects/Tipologia/tipologia.service';
import { Categoria } from 'src/app/interfaces/selects/Categoria/categoria';
import { CategoriaService } from 'src/app/services/selects/Categoria/categoria.service';
import { PrioridadService } from 'src/app/services/selects/Prioridad/prioridad.service';
import { Prioridad } from 'src/app/interfaces/selects/Prioridad/prioridad';
import { ReportService } from 'src/app/services/report/report.service';
import { UnidadService } from 'src/app/services/Unidad/unidad.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';

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
  selector: 'app-report-tickets',
  templateUrl: './report-tickets.component.html',
  styleUrls: ['./report-tickets.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTicketsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['ticketID', 'nombre', 'asunto', 'organizacionDescripcion','catalogoDescripcion', 'tipologiaDescripcion', 'prioridadDescripcion', 'viaDescripcion', 'estado', 'fechaCreacion', 'fechaCierre','descripcion'];
  dataSource = new MatTableDataSource<any>([]);
  selectedFecha: Moment = moment();
  chosenYearDate: Moment = moment();

  selectedMes: any | null = null;
  selectedAnio: any | null = null;
  selectedFiltro: string = 'MesAnio';
  date = new FormControl(moment());
  dateInicio = new FormControl(moment());
  dateFin = new FormControl(moment());

  catalogos: Catalogo[] = [];
  filteredCatalogos!: Observable<Catalogo[]>;
  catalogoCtrl = new FormControl();
  selectedCatalogo: Catalogo | null = null;
  catalogoFilterCtrl = new FormControl();

  tipologias: Tipologia[] = [];
  selectedTipologia: any | null = null;

  organizaciones: Organizacion[] = [];
  filteredOrganizaciones!: Observable<Organizacion[]>;
  organizacionCtrl = new FormControl();
  selectedOrganizacion: Organizacion | null = null;
  unid_codi: string = "";
  organizacionFilterCtrl = new FormControl();
  userDetail: UserDetail | null = null;
  categorias: Categoria[] = [];
  selectedCategoria: any | null = null;

  prioridades: Prioridad[] = [];
  selectedPrioridad: any | null = null;

  isLoading: boolean = false;
  isTableLoading: boolean = false;

  public filter: any = { catalogo: null };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private adapter: DateAdapter<any>, private changeDetectorRef: ChangeDetectorRef,private unidadService: UnidadService,private authService: AuthService, private catalogoService: CatalogoService, private organizacionService: OrganizacionService, private tipologiaService: TipologiaService, private categoriaService: CategoriaService, private prioridadService: PrioridadService, private reportService: ReportService, private cdr: ChangeDetectorRef) {
    this.catalogoCtrl = new FormControl('');
    this.organizacionCtrl = new FormControl('');
    this.adapter.setLocale('es');
  }

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.loadCatalogos();
    this.filteredCatalogos = this.catalogoCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCatalogos(value))
    );
    this.loadOrganizaciones();
    this.filteredOrganizaciones = this.organizacionCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterOrganizaciones(value))
    );
    this.unid_codi = this.userDetail!.unid_codi || '';
    this.cargarTipologia();
    this.cargarCategorias();
    this.cargarPrioridad();
  
    this.unidadService.unidadSeleccionada$.subscribe(unid_codi => {
      if (unid_codi && unid_codi !== 'Seleccione') {
        console.log("Cambio de unidad detectado:", unid_codi);
        this.unid_codi = unid_codi;
        this.getRecords(this.unid_codi);
      }
    });        
  
    this.getRecords(this.unid_codi);
  }
  

  cargarPrioridad(): void {
    this.prioridadService.getPrioridad().subscribe({
      next: (data) => {
        this.prioridades = data;
      },
      error: (error) => console.error('Error al obtener prioridades', error)
    });
  }

  clearTipologia() {
    this.selectedTipologia = null;
    this.getRecords(this.unid_codi);
  }

  clearCatalogo(): void {
    this.selectedCatalogo = null;
    setTimeout(() => {
      this.catalogoCtrl.setValue('temp', { emitEvent: false }); // Establecer un valor temporal
      this.catalogoCtrl.setValue(''); // Limpiar el campo
    }, 0);
    this.getRecords(this.unid_codi);
  }

  clearOrganizacion(): void {
    this.selectedOrganizacion = null;
    setTimeout(() => {
      this.organizacionCtrl.setValue('temp', { emitEvent: false });
      this.organizacionCtrl.setValue('');
    }, 0);
    this.getRecords(this.unid_codi);
  }

  clearCategoria() {
    this.selectedCategoria = null;
    this.getRecords(this.unid_codi);
  }

  clearPrioridad() {
    this.selectedPrioridad = null;
    this.getRecords(this.unid_codi);
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => console.error('Error al obtener categorías', error)
    });
  }

  cargarTipologia(): void {
    this.tipologiaService.getTipologia().subscribe({
      next: (data) => {
        this.tipologias = data;
      },
      error: (error) => console.error('Error al obtener tipologias', error)
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private _filterCatalogos(value: string | null): Catalogo[] {
    if (value === null) {
      return this.catalogos;
    }
    const filterValue = value.toLowerCase();
    return this.catalogos.filter(catalogo => catalogo.nombre.toLowerCase().includes(filterValue));
  }

  private _filterOrganizaciones(value: string | null): Organizacion[] {
    if (value === null) {
      return this.organizaciones;
    }
    const filterValue = value.toLowerCase();
    return this.organizaciones.filter(organizacion => organizacion.descripcion.toLowerCase().includes(filterValue));
  }

  onCatalogoSelected(event: any): void {
    const selectedCatalogoName = event.option.value;
    this.selectedCatalogo = this.catalogos.find(catalogo => catalogo.nombre === selectedCatalogoName) || null;
    if (this.selectedCatalogo) {
      this.catalogoCtrl.setValue(this.selectedCatalogo.nombre, { emitEvent: false });
    }
    this.getRecords(this.unid_codi);
  }

  onOrganizacionSelected(event: any): void {
    const selectedOrganizacionName = event.option.value;
    this.selectedOrganizacion = this.organizaciones.find(organizacion => organizacion.descripcion === selectedOrganizacionName) || null;
    if (this.selectedOrganizacion) {
      this.organizacionCtrl.setValue(this.selectedOrganizacion.descripcion, { emitEvent: false });
    }
    this.getRecords(this.unid_codi);
  }

  loadCatalogos() {
    this.catalogoService.getCatalogosFilter().subscribe({
      next: (data) => {
        this.catalogos = data;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los catalogos', error);
        }
      }
    });
  }

  loadOrganizaciones() {
    this.organizacionService.getOrganizaciones().subscribe({
      next: (data) => {
        //console.log(data)
        this.organizaciones = data;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener las organizaciones', error);
        }
      }
    });
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
    this.selectedMes = ctrlValue.month() + 1;
    this.selectedAnio =  ctrlValue.year();
    this.getRecords(this.unid_codi);
  }

  downloadMonthlyReport(): void {
    this.isLoading = true;  // Mostrar spinner de carga
    this.cdr.detectChanges();  // Forzar detección de cambios
    const params = {
      year: this.selectedAnio ? this.selectedAnio : this.selectedFecha.year(),
      month: this.selectedMes ? this.selectedMes : this.selectedFecha.month() + 1,
      catalogo: this.selectedCatalogo ? this.selectedCatalogo.codi : '',
      organizacion: this.selectedOrganizacion ? this.selectedOrganizacion.codi : '',
      tipologia: this.selectedTipologia ? this.selectedTipologia : '',
      categoria: this.selectedCategoria ? this.selectedCategoria : '',
      prioridad: this.selectedPrioridad ? this.selectedPrioridad : '',
      unidCodi: this.unid_codi
    };
    const queryString = new URLSearchParams(params as any).toString();

    this.reportService.downloadReport(queryString).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Report.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      anchor.remove();
      this.isLoading = false; 
      this.cdr.detectChanges();  
      console.log(this.isLoading)
      console.log("descargado")
    }, error => {
      console.error('Error al descargar el reporte:', error);
      this.isLoading = false;  
      this.cdr.detectChanges(); 
    });
  }

  getRecords(unidCodi: string = ''): void {
    this.isTableLoading = true;  // Mostrar spinner de carga
    this.cdr.detectChanges();  // Forzar detección de cambios
  
    const params = {
      year: this.selectedAnio ? this.selectedAnio : this.selectedFecha.year(),
      month: this.selectedMes ? this.selectedMes : this.selectedFecha.month() + 1,
      catalogo: this.selectedCatalogo ? this.selectedCatalogo.codi : '',
      organizacion: this.selectedOrganizacion ? this.selectedOrganizacion.codi : '',
      tipologia: this.selectedTipologia ? this.selectedTipologia : '',
      categoria: this.selectedCategoria ? this.selectedCategoria : '',
      prioridad: this.selectedPrioridad ? this.selectedPrioridad : '',
      unidCodi: unidCodi // Agregar unidCodi a los parámetros
    };
    const queryString = new URLSearchParams(params as any).toString();
  
    this.reportService.getRecords(queryString).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isTableLoading = false;  // Ocultar spinner de carga
        this.cdr.detectChanges();  // Forzar detección de cambios
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al obtener los datos', error);
        }
        this.isTableLoading = false;  // Ocultar spinner de carga en caso de error
        this.cdr.detectChanges();  // Forzar detección de cambios
      }
    });
  }
  
  calcularTiempo(fechaCreacion: string, fechaCierre: string): string {
    if (!fechaCreacion || !fechaCierre) {
      return '';
    }

    const fechaCreacionParsed = moment(fechaCreacion, 'DD/MM/YYYY - hh:mm a');
    const fechaCierreParsed = moment(fechaCierre, 'DD/MM/YYYY - hh:mm a');

    if (!fechaCreacionParsed.isValid() || !fechaCierreParsed.isValid()) {
      return '';
    }

    const duration = moment.duration(fechaCierreParsed.diff(fechaCreacionParsed));
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();

    return `${days}d ${hours}h ${minutes}m`;
  }
}


