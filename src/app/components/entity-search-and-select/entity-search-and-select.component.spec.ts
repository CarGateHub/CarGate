import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EntitySearchAndSelectComponent } from "./entity-search-and-select.component";

describe("EntitySearchAndSelectComponent", () => {
  let component: EntitySearchAndSelectComponent;
  let fixture: ComponentFixture<EntitySearchAndSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntitySearchAndSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySearchAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
