import { Component, OnInit, HostListener } from '@angular/core';
import { UserDetail } from 'src/app/interfaces/Login/userDetail';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-hdesk-header',
  templateUrl: './hdesk-header.component.html',
  styleUrls: []
})
export class HdeskHeaderComponent implements OnInit {
  userDetail: UserDetail | null = null;
  showUserMenu = false;
  imagenUsuario = '';
  imgError = false;
  mostrarUsuario = false;
  menuPanel = false;

  constructor(private authService: AuthService, private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.userDetail = this.authService.getCurrentUser();
    this.imagenUsuario = this.userDetail?.idUsuario
      ? `https://static.upao.edu.pe/upload/f/${this.userDetail.idUsuario}.jpg`
      : 'assets/UserSinFoto.svg';
    //console.log(this.userDetail?.idUsuario);
    this.toggleVerUsuario();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.showUserMenu = false;
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation(); // Prevent click from closing immediately
    this.showUserMenu = !this.showUserMenu;
  }

  manejarErrorImagen(): void {
    this.imagenUsuario = 'assets/UserSinFoto.svg'; // Fallback image on error
  }

  cerrarSesion(): void {
    this.authService.logout();
    // Redirect to login or appropriate page
  }

  toggleVerUsuario(): boolean{
    return !!(this.userDetail && (this.userDetail.rols_codi != '4'));
  }

  toggleSidebar(): void {
    this.sidebarService.toggleMenu();
  }
}
