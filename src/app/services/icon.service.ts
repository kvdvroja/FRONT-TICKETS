import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor(private domSanitizer: DomSanitizer) {}

  public getIconUrl(iconName: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/${iconName}.svg`);
  }
  public getIconUrlTipologia(iconName: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/tipologia/${iconName}.svg`);
  }
}
