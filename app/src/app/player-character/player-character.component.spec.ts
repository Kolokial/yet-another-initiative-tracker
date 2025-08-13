import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCharacterComponent } from './player-character.component';

describe('PlayerCharacterComponent', () => {
  let component: PlayerCharacterComponent;
  let fixture: ComponentFixture<PlayerCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCharacterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
