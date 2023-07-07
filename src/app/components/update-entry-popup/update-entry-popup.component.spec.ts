import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEntryPopupComponent } from './update-entry-popup.component';

describe('UpdateEntryPopupComponent', () => {
  let component: UpdateEntryPopupComponent;
  let fixture: ComponentFixture<UpdateEntryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEntryPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEntryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
