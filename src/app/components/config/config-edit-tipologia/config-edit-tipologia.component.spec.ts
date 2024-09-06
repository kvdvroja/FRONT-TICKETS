import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigEditTipologiaComponent } from './config-edit-tipologia.component';

describe('ConfigEditTipologiaComponent', () => {
  let component: ConfigEditTipologiaComponent;
  let fixture: ComponentFixture<ConfigEditTipologiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigEditTipologiaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigEditTipologiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
