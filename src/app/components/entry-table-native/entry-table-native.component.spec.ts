import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryTableNativeComponent } from './entry-table-native.component';

describe('EntryTableNativeComponent', () => {
  let component: EntryTableNativeComponent;
  let fixture: ComponentFixture<EntryTableNativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntryTableNativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryTableNativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
