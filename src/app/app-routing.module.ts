import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HdeskCreateTicketComponent } from './components/hdesk/hdesk-create-ticket/hdesk-create-ticket.component';
import { HdeskListComponent } from './components/hdesk/hdesk-list/hdesk-list.component';
import { HdeskEditListComponent } from './components/hdesk/hdesk-edit-list/hdesk-edit-list.component';
import { TicketDetailComponent } from './components/shared/ticket-detail/ticket-detail.component';
import { LoginComponent } from './components/shared/login/login.component';
import { HdeskMenuComponent } from './components/hdesk/hdesk-menu/hdesk-menu.component';
import { AuthGuard } from './services/Auth/auth-guard.service';
import { MenuComponent } from './components/shared/menu/menu.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { ConfigAdminComponent } from './components/config/config-admin/config-admin.component';
import { RoleGuard } from './services/role.guard';
import { ConfigUserComponent } from './components/config/config-user/config-user.component';
import { ConfigUnidadComponent } from './components/config/config-unidad/config-unidad.component';
import { ConfigCatalogoComponent } from './components/config/config-catalogo/config-catalogo.component';
import { ConfigCategoriaComponent } from './components/config/config-categoria/config-categoria.component';
import { ConfigOrganizacionComponent } from './components/config/config-organizacion/config-organizacion.component';
import { ConfigPrioridadComponent } from './components/config/config-prioridad/config-prioridad.component';
import { ConfigTipologiaComponent } from './components/config/config-tipologia/config-tipologia.component';
import { ConfigViasComponent } from './components/config/config-vias/config-vias.component';
import { ConfigCargosComponent } from './components/config/config-cargos/config-cargos.component';
import { ReportsComponent } from './components/shared/reports/reports.component';
import { ReportTicketsComponent } from './components/shared/report-tickets/report-tickets.component';
import { DashboardComponent } from './components/shared/dashboard/dashboard.component';
import { CreateTareaTicketComponent } from './components/shared/create-tarea-ticket/create-tarea-ticket.component';
import { ConfigCatalogosComponent } from './components/config/config-catalogos/config-catalogos.component';
import { ConfigurarCuentaComponent } from './components/shared/configurar-cuenta/configurar-cuenta.component';
import { ConfigTrabajosComponent } from './components/config/config-trabajos/config-trabajos.component';
import { ConfigProgresoComponent } from './components/config/config-progreso/config-progreso.component';
import { HdeskCreateTicketUserComponent } from './components/hdesk/hdesk-create-ticket-user/hdesk-create-ticket-user.component';
import { HdeskListUserComponent } from './components/hdesk/hdesk-list-user/hdesk-list-user.component';
import { TraerLoginComponent } from './components/shared/traer-login/traer-login.component';

const routes: Routes = [
  { 
    path: 'menu',
    component: HdeskMenuComponent,
    canActivate: [AuthGuard,RoleGuard], // Protege esta ruta con AuthGuard
    children: [
      {
        path: 'create-ticket',
        component: HdeskCreateTicketComponent,
        canActivate: [RoleGuard],
        data: {roles: ['1','2'], categories: ['1'], cargos: ['1','2'] }  // Solo permite acceso a usuarios con categoría "1"
        //allowedUserId: '000005741'
      },
      {
        path: 'create-ticket-user',
        component: HdeskCreateTicketUserComponent,
        canActivate: [RoleGuard],
        data: {roles: ['1','2','4'], categories: ['1'], cargos: ['1','2'] }  // Solo permite acceso a usuarios con categoría "1"
        //allowedUserId: '000005741'
      },
      { path: 'list-tickets', component: HdeskListComponent },
      { path: 'list-tickets-user', component: HdeskListUserComponent },
      {
        path: 'edit-ticket/:id',
        component: HdeskEditListComponent,
        canActivate: [RoleGuard],
        data: {roles: ['1','2'], categories: ['1'],cargos: ['1','2'] }// Solo permite acceso a usuarios con categoría "1"
      },
      { path: 'ticket-detail/:id', component: TicketDetailComponent },
      { path: 'ticket-sheet-create/:id',
        component: CreateTareaTicketComponent,
        canActivate: [RoleGuard],
        data: {roles:['1','2','3']}
      },
      { path: 'inicio', component: MenuComponent },
      { path: 'reports', 
        component: ReportsComponent,
        canActivate: [RoleGuard],
        data: {roles:['1','2','3']}
       },
      { path: 'reports-tickets',
        component: ReportTicketsComponent,
        canActivate: [RoleGuard],
        data: {roles:['1','2','3']}

      },
      { path: 'dashboard', component: DashboardComponent },
      // ... otras rutas hijas ...
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'traer', component: TraerLoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'config', // Nuevo segmento de ruta para configuraciones
    component: HdeskMenuComponent,
    canActivate: [AuthGuard,RoleGuard], // Protege esta ruta con AuthGuard
    children: [
      {
        path: 'admin',
        component: ConfigAdminComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1'] } 
      },
      {
        path: 'user',
        component: ConfigUserComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'unidad', 
        component: ConfigUnidadComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1'] } 
      },
      {
        path: 'catalogo', 
        component: ConfigCatalogoComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'profile', 
        component: ConfigurarCuentaComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2','3'] } 
      }
    ]
  },
  {
    path: 'mant',
    component: HdeskMenuComponent,
    canActivate: [AuthGuard,RoleGuard], 
    children: [
      {
        path: 'organizacion',
        component: ConfigOrganizacionComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'categorias', 
        component: ConfigCategoriaComponent,
        canActivate: [RoleGuard],
        data: { roles: ['1','2'] } 
      },
      {
        path: 'tipologia', 
        component: ConfigTipologiaComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'vias', 
        component: ConfigViasComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'prioridad', 
        component: ConfigPrioridadComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'cargos', 
        component: ConfigCargosComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'catalogos', 
        component: ConfigCatalogosComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'trabajos', 
        component: ConfigTrabajosComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      },
      {
        path: 'progreso', 
        component: ConfigProgresoComponent,
        canActivate: [RoleGuard], 
        data: { roles: ['1','2'] } 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
