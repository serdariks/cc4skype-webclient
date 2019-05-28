/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DynamicsOutboundCallViewComponent } from './dynamics-outbound-call-view.component';

describe('DynamicsOutboundCallViewComponent', () => {
  let component: DynamicsOutboundCallViewComponent;
  let fixture: ComponentFixture<DynamicsOutboundCallViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicsOutboundCallViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicsOutboundCallViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
