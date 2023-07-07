import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsLicensePlateComponent } from './settings-license-plate.component';

describe('SettingsLicensePlateComponent', () => {
  let component: SettingsLicensePlateComponent;
  let fixture: ComponentFixture<SettingsLicensePlateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsLicensePlateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsLicensePlateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
