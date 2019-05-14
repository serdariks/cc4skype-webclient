import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorCallsComponent } from './operator-calls.component';

describe('OperatorCallsComponent', () => {
  let component: OperatorCallsComponent;
  let fixture: ComponentFixture<OperatorCallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatorCallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
