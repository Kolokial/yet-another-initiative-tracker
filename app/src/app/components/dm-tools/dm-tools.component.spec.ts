import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmToolsComponent } from './dm-tools.component';

describe('DmToolsComponent', () => {
  let component: DmToolsComponent;
  let fixture: ComponentFixture<DmToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmToolsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
