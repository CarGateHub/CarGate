import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDestinationComponent } from './settings-destination.component';

describe('SettingsDestinationComponent', () => {
  let component: SettingsDestinationComponent;
  let fixture: ComponentFixture<SettingsDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsDestinationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
