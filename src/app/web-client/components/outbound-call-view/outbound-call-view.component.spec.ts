import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundCallViewComponent } from './outbound-call-view.component';

describe('OutboundCallViewComponent', () => {
  let component: OutboundCallViewComponent;
  let fixture: ComponentFixture<OutboundCallViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCallViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCallViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
