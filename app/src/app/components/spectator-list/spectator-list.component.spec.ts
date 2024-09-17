import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectatorListComponent } from './spectator-list.component';

describe('SpectatorListComponent', () => {
  let component: SpectatorListComponent;
  let fixture: ComponentFixture<SpectatorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpectatorListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpectatorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
