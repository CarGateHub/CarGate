import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEntryWindowComponent } from './new-entry-window.component';

describe('NewEntryWindowComponent', () => {
  let component: NewEntryWindowComponent;
  let fixture: ComponentFixture<NewEntryWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEntryWindowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEntryWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
