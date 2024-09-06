import { TestBed } from '@angular/core/testing';

import { RegistrarTareasService } from './registrar-tareas.service';

describe('RegistrarTareasService', () => {
  let service: RegistrarTareasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrarTareasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
