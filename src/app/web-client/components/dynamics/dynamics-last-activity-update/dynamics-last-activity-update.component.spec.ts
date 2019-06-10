/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DynamicsLastActivityUpdateComponent } from './dynamics-last-activity-update.component';

describe('DynamicsLastActivityUpdateComponent', () => {
  let component: DynamicsLastActivityUpdateComponent;
  let fixture: ComponentFixture<DynamicsLastActivityUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicsLastActivityUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicsLastActivityUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
