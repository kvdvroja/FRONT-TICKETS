import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCatalogoComponent } from './asignar-catalogo.component';

describe('AsignarCatalogoComponent', () => {
  let component: AsignarCatalogoComponent;
  let fixture: ComponentFixture<AsignarCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignarCatalogoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
