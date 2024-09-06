import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarDialogComponent } from './asignar-dialog.component';

describe('AsignarDialogComponent', () => {
  let component: AsignarDialogComponent;
  let fixture: ComponentFixture<AsignarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignarDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
