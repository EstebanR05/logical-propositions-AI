
import { Routes } from '@angular/router';
import { PropositionalCalc } from './pages/propositional-calc/propositional-calc';
import { InferenceCalc } from './pages/inference-calc/inference-calc';

export const routes: Routes = [
	{
		path: 'propositional-calc',
		component: PropositionalCalc
	},
	{
		path: 'inference-calc',
		component: InferenceCalc
	},
	{
		path: '',
		redirectTo: 'propositional-calc',
		pathMatch: 'full'
	}
];
