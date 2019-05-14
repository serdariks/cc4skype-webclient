import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallCenterCallViewComponent } from './call-center-call-view.component';

describe('CallCenterCallViewComponent', () => {
  let component: CallCenterCallViewComponent;
  let fixture: ComponentFixture<CallCenterCallViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallCenterCallViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallCenterCallViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
