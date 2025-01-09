import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private menuState = new BehaviorSubject<boolean>(false);
  menuState$ = this.menuState.asObservable();

  toggleMenu(): void {
    this.menuState.next(!this.menuState.value);
    //console.log('Menu state toggled:', this.menuState.value);
  }
  
}
