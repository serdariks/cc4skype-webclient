import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingMediaComponent } from './waiting-media.component';

describe('WaitingMediaComponent', () => {
  let component: WaitingMediaComponent;
  let fixture: ComponentFixture<WaitingMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingMediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
