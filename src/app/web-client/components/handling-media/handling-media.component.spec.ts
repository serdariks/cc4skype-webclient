import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingMediaComponent } from './handling-media.component';

describe('HandlingMediaComponent', () => {
  let component: HandlingMediaComponent;
  let fixture: ComponentFixture<HandlingMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandlingMediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandlingMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
