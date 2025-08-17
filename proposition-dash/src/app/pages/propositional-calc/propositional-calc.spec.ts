import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropositionalCalc } from './propositional-calc';

describe('PropositionalCalc', () => {
  let component: PropositionalCalc;
  let fixture: ComponentFixture<PropositionalCalc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropositionalCalc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropositionalCalc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
