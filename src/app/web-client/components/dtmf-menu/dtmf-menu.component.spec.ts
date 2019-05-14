import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DtmfMenuComponent } from './dtmf-menu.component';

describe('DtmfMenuComponent', () => {
  let component: DtmfMenuComponent;
  let fixture: ComponentFixture<DtmfMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DtmfMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DtmfMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
