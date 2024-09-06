import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCatalogoComponent } from './config-catalogo.component';

describe('ConfigCatalogoComponent', () => {
  let component: ConfigCatalogoComponent;
  let fixture: ComponentFixture<ConfigCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigCatalogoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
