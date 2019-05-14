import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenceSelectComponent } from './presence-select.component';

describe('PresenceSelectComponent', () => {
  let component: PresenceSelectComponent;
  let fixture: ComponentFixture<PresenceSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresenceSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
