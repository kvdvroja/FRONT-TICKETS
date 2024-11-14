import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtInterceptor } from './jwt.interceptor';

import {MatSelectModule} from '@angular/material/select'
import {MatInputModule} from '@angular/material/input'
import {MatButtonModule} from '@angular/material/button'
import {MatCardModule} from '@angular/material/card'
import {MatIconModule} from '@angular/material/icon'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import {MatChipsModule}  from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTableModule} from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HdeskCreateTicketComponent } from './components/hdesk/hdesk-create-ticket/hdesk-create-ticket.component';
import { HdeskMenuComponent } from './components/hdesk/hdesk-menu/hdesk-menu.component';
import { HdeskListComponent } from './components/hdesk/hdesk-list/hdesk-list.component';
import { HdeskHeaderComponent } from './components/shared/headers/hdesk-header/hdesk-header.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HdeskEditListComponent } from './components/hdesk/hdesk-edit-list/hdesk-edit-list.component';
import { UserSearchDialogComponent } from './components/shared/user-search-dialog/user-search-dialog.component';
import { AssignDialogComponent } from './components/shared/assign-dialog/assign-dialog.component';
import { TicketDetailComponent } from './components/shared/ticket-detail/ticket-detail.component';
import { LoginComponent } from './components/shared/login/login.component';
import { PreviewComponent } from './components/shared/preview/preview.component';
import { MenuComponent } from './components/shared/menu/menu.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { ConfigUserComponent } from './components/config/config-user/config-user.component';
import { ConfigViasComponent } from './components/config/config-vias/config-vias.component';
import { ConfigCategoriaComponent } from './components/config/config-categoria/config-categoria.component';
import { ConfigOrganizacionComponent } from './components/config/config-organizacion/config-organizacion.component';
import { ConfigPrioridadComponent } from './components/config/config-prioridad/config-prioridad.component';
import { ConfigTipologiaComponent } from './components/config/config-tipologia/config-tipologia.component';
import { ConfigUnidadComponent } from './components/config/config-unidad/config-unidad.component';
import { ConfigAdminComponent } from './components/config/config-admin/config-admin.component';
import { RoleGuard } from './services/role.guard';
import { ReportDownloadComponent } from './components/report-download/report-download.component';
import { ConfigCargosComponent } from './components/config/config-cargos/config-cargos.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ReportsComponent } from './components/shared/reports/reports.component';
import { CatalogoDialogComponent } from './components/shared/catalogo-dialog/catalogo-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FinalMessageComponent } from './components/shared/final-message/final-message.component';
import { CustomHeaderInterceptor } from './interceptors/custom-header.interceptor';
import { EditarRespuestaComponent } from './components/shared/editar-respuesta/editar-respuesta.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { DashboardComponent } from './components/shared/dashboard/dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportTicketsComponent } from './components/shared/report-tickets/report-tickets.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsignarTareaComponent } from './components/shared/asignar-tarea/asignar-tarea.component';
import { AsignarCatalogoComponent } from './components/shared/asignar-catalogo/asignar-catalogo.component';
import { AsignadosDetalleComponent } from './components/shared/asignados-detalle/asignados-detalle.component';
import { CreateTareaTicketComponent } from './components/shared/create-tarea-ticket/create-tarea-ticket.component';
import { CreateBasicTareaComponent } from './components/shared/create-basic-tarea/create-basic-tarea.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DetalleTareaTicketComponent } from './components/shared/detalle-tarea-ticket/detalle-tarea-ticket.component';
import { CreateBasicTareaAssignComponent } from './components/shared/create-basic-tarea-assign/create-basic-tarea-assign.component';
import { AddEtiquetaComponent } from './components/shared/add-etiqueta/add-etiqueta.component';
import { ConfigEditOrganizacionComponent } from './components/config/config-edit-organizacion/config-edit-organizacion.component';
import { ConfigEditTipologiaComponent } from './components/config/config-edit-tipologia/config-edit-tipologia.component';
import { ConfigEditViasComponent } from './components/config/config-edit-vias/config-edit-vias.component';
import { ConfigCatalogoComponent } from './components/config/config-catalogo/config-catalogo.component';
import { ConfigEditCatalogoComponent } from './components/config/config-edit-catalogo/config-edit-catalogo.component';
import { ConfigCatalogosComponent } from './components/config/config-catalogos/config-catalogos.component';
import { PreviewSolucionComponent } from './components/shared/preview-solucion/preview-solucion.component';
import { ConfigEditCatalogosComponent } from './components/config/config-edit-catalogos/config-edit-catalogos.component';
import { ConfigurarCuentaComponent } from './components/shared/configurar-cuenta/configurar-cuenta.component';
import { MatListModule } from '@angular/material/list';
import { AsignarCategoriaDialogComponent } from './components/shared/asignar-categoria-dialog/asignar-categoria-dialog.component';
import { CambiarClaveComponent } from './components/shared/cambiar-clave/cambiar-clave.component';
import { AsignarDialogComponent } from './components/shared/asignar-dialog/asignar-dialog.component';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { VinculacionComponent } from './components/shared/vinculacion/vinculacion.component';
import { AddConfigUserComponent } from './components/config/add-config-user/add-config-user.component';
import { ConfigProgresoComponent } from './components/config/config-progreso/config-progreso.component';
import { ConfigEditProgresoComponent } from './components/config/config-edit-progreso/config-edit-progreso.component';
import { ConfigTrabajosComponent } from './components/config/config-trabajos/config-trabajos.component';
import { ConfigEditTrabajosComponent } from './components/config/config-edit-trabajos/config-edit-trabajos.component';
import { AddSolucionComponent } from './components/shared/add-solucion/add-solucion.component';
import { HdeskCreateTicketUserComponent } from './components/hdesk/hdesk-create-ticket-user/hdesk-create-ticket-user.component';
import { HdeskListUserComponent } from './components/hdesk/hdesk-list-user/hdesk-list-user.component';
import { UbicacionDialogComponent } from './components/shared/ubicacion-dialog/ubicacion-dialog.component';
import { EditSolucionComponent } from './components/shared/edit-solucion/edit-solucion.component';
import { InstruccionesComponent } from './components/shared/instrucciones/instrucciones.component';

//import { NgxDocViewerModule } from 'ngx-doc-viewer';

// const MY_DATE_FORMATS: MatDateFormats = {
//   parse: {
//     dateInput: 'DD/MM/YYYY',
//   },
//   display: {
//     dateInput: 'DD/MM/YYYY',
//     monthYearLabel: 'MMM YYYY',
//     dateA11yLabel: 'DD/MM/YYYY',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

@NgModule({
  declarations: [
    AppComponent,
    HdeskCreateTicketComponent,
    HdeskMenuComponent,
    HdeskListComponent,
    HdeskHeaderComponent,
    SidebarComponent,
    HdeskEditListComponent,
    UserSearchDialogComponent,
    AssignDialogComponent,
    TicketDetailComponent,
    LoginComponent,
    PreviewComponent,
    MenuComponent,
    RegisterComponent,
    ConfigUserComponent,
    ConfigViasComponent,
    ConfigCategoriaComponent,
    ConfigOrganizacionComponent,
    ConfigPrioridadComponent,
    ConfigTipologiaComponent,
    ConfigUnidadComponent,
    ConfigAdminComponent,
    ReportDownloadComponent,
    ConfigCargosComponent,
    TruncatePipe,
    ReportsComponent,
    DashboardComponent,
    CatalogoDialogComponent,
    FinalMessageComponent,
    EditarRespuestaComponent,
    AsignarTareaComponent,
    AsignarCatalogoComponent,
    AsignadosDetalleComponent,
    CreateTareaTicketComponent,
    CreateBasicTareaComponent,
    ReportTicketsComponent,
    DetalleTareaTicketComponent,
    CreateBasicTareaAssignComponent,
    AddEtiquetaComponent,
    ConfigEditOrganizacionComponent,
    ConfigEditTipologiaComponent,
    ConfigEditViasComponent,
    ConfigCatalogoComponent,
    ConfigEditCatalogoComponent,
    ConfigCatalogosComponent,
    PreviewSolucionComponent,
    ConfigEditCatalogosComponent,
    ConfigurarCuentaComponent,
    AsignarCategoriaDialogComponent,
    CambiarClaveComponent,
    AsignarDialogComponent,
    VinculacionComponent,
    AddConfigUserComponent,
    ConfigProgresoComponent,
    ConfigEditProgresoComponent,
    ConfigTrabajosComponent,
    ConfigEditTrabajosComponent,
    AddSolucionComponent,
    HdeskCreateTicketUserComponent,
    HdeskListUserComponent,
    UbicacionDialogComponent,
    EditSolucionComponent,
    InstruccionesComponent
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CKEditorModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatChipsModule,
    MatPaginatorModule,
    NgxPaginationModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSnackBarModule,
    QuillModule.forRoot(),
    MatExpansionModule,
    MatProgressBarModule,
    NgApexchartsModule,
    MatMomentDateModule,
    MatTableModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatCheckboxModule
  ],
  providers: [    
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CustomHeaderInterceptor, multi: true },
    // { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    // { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
],
  bootstrap: [AppComponent]
})
  export class AppModule {  
    // constructor(private dateAdapter: DateAdapter<Date>) {
    // dateAdapter.setLocale('es-PE');
  //}
}