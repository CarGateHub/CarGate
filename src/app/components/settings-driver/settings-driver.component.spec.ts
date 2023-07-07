import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDriverComponent } from './settings-driver.component';

describe('SettingsDriverComponent', () => {
  let component: SettingsDriverComponent;
  let fixture: ComponentFixture<SettingsDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsDriverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
