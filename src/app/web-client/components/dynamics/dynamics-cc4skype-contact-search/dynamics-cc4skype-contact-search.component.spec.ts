/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DynamicsCc4skypeContactSearchComponent } from './dynamics-cc4skype-contact-search.component';

describe('DynamicsCc4skypeContactSearchComponent', () => {
  let component: DynamicsCc4skypeContactSearchComponent;
  let fixture: ComponentFixture<DynamicsCc4skypeContactSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicsCc4skypeContactSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicsCc4skypeContactSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
