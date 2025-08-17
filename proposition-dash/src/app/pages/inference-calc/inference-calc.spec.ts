import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InferenceCalc } from './inference-calc';

describe('InferenceCalc', () => {
  let component: InferenceCalc;
  let fixture: ComponentFixture<InferenceCalc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InferenceCalc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InferenceCalc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
