import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeTrackerComponent } from './initiative-tracker.component';

describe('InitiativeTrackerComponent', () => {
  let component: InitiativeTrackerComponent;
  let fixture: ComponentFixture<InitiativeTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiativeTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitiativeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
