import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrytableComponent } from './entrytable.component';

describe('EntrytableComponent', () => {
  let component: EntrytableComponent;
  let fixture: ComponentFixture<EntrytableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntrytableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrytableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
