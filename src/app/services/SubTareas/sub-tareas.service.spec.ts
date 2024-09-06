import { TestBed } from '@angular/core/testing';

import { SubTareasService } from './sub-tareas.service';

describe('SubTareasService', () => {
  let service: SubTareasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubTareasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
