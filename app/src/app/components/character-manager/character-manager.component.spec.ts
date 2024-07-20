import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterManagerComponent } from './character-manager.component';

describe('CharacterManagerComponent', () => {
  let component: CharacterManagerComponent;
  let fixture: ComponentFixture<CharacterManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharacterManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
