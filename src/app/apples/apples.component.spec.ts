import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplesComponent } from './apples.component';

describe('ApplesComponent', () => {
  let component: ApplesComponent;
  let fixture: ComponentFixture<ApplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
