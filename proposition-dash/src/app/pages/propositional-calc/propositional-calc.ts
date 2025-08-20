
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-propositional-calc',
  imports: [CommonModule, FormsModule],
  templateUrl: './propositional-calc.html',
  styleUrl: './propositional-calc.css'
})
export class PropositionalCalc {
  proposition: string = '';
  error: string = '';
  result: string = '';

  symbols: string[] = ['¬', '∧', '∨', '→', '↔'];
  letters: string[] = Array.from({ length: 6 }, (_, i) => String.fromCharCode(65 + i)); // A-F, puedes ampliar a A-Z si lo deseas

  addSymbol(symbol: string) {
    this.proposition += symbol;
  }

  removeLast() {
    this.proposition = this.proposition.slice(0, -1);
  }

  clearAll() {
    this.proposition = '';
    this.error = '';
    this.result = '';
  }

  // Validación básica de proposiciones lógicas
  validateProposition(expr: string): string | null {
    const allowed = /^[A-Za-z()¬∧∨→↔\s]+$/;
    if (!allowed.test(expr)) {
      return 'La proposición contiene caracteres inválidos.';
    }
    let balance = 0;
    for (const char of expr) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) return 'Paréntesis desbalanceados.';
    }
    if (balance !== 0) return 'Paréntesis desbalanceados.';
    return null;
  }

  onValidate(event: Event) {
    event.preventDefault();
    this.error = '';
    this.result = '';
    const validation = this.validateProposition(this.proposition.trim());
    if (validation) {
      this.error = validation;
    } else {
      this.result = 'La proposición es válida.';
    }
  }
}
