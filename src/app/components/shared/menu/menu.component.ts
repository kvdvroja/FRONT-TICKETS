import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  userDetail: UserDetail | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userDetail = this.authService.getCurrentUser();
  }

  showConfiguracionAdmin(): boolean {
    const ocultarConfiguracion = this.userDetail?.rols_codi === '1';
    return ocultarConfiguracion;
  }

  showConfiguracionUsuario(): boolean {
    const ocultarConfiguracion = this.userDetail?.rols_codi === '3' || this.userDetail?.rols_codi === '4';
    return !ocultarConfiguracion;
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
