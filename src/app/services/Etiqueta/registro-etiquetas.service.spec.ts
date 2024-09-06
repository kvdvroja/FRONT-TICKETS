import { TestBed } from '@angular/core/testing';

import { RegistroEtiquetasService } from './registro-etiquetas.service';

describe('RegistroEtiquetasService', () => {
  let service: RegistroEtiquetasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroEtiquetasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
