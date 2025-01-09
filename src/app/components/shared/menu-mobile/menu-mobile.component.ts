import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-menu-mobile',
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.css']
})
export class MenuMobileComponent implements OnInit {
  userDetail: UserDetail | null = null;
  isMenuOpen = false;

  constructor(private sidebarService: SidebarService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.sidebarService.menuState$.subscribe(state => {
      //console.log('Estado del menú recibido en MenuMobileComponent:', state);
      this.isMenuOpen = state;
    });
  }

  closeMenu(): void {
    this.sidebarService.toggleMenu(); // Alterna el estado del menú
  }

  showConfiguracionAdmin(): boolean {
    const ocultarConfiguracion = this.userDetail?.rols_codi === '1';
    return ocultarConfiguracion;
  }

  showConfiguracionUsuario(): boolean {
    const ocultarConfiguracion = this.userDetail?.rols_codi === '3' || this.userDetail?.rols_codi === '4';
    return !ocultarConfiguracion;
  }


  toggleVerUsuario(): boolean{
    return !!(this.userDetail && (this.userDetail.rols_codi != '4'));
  }

  showCreate(): boolean {
    const ocultarCreate = 
    this.userDetail?.cate_codi === '1' || 
    this.userDetail?.rols_codi === '1' || 
    this.userDetail?.rols_codi === '2' ||
    this.userDetail?.cargo_codi == "1" ||
    this.userDetail?.cargo_codi == "2";
    return ocultarCreate;
  }

  showCreateUser(): boolean {
    const ocultarCreate = 
    this.userDetail?.cate_codi === '1' || 
    this.userDetail?.rols_codi === '1' || 
    this.userDetail?.rols_codi === '2' ||
    this.userDetail?.cargo_codi == "1" ||
    this.userDetail?.cargo_codi == "2" ||
    this.userDetail?.rols_codi == "4";
    return ocultarCreate;
  }
  
  
}
