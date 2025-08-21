
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
  letters: string[] = ['p', 'q', 'r'];

  showModal: boolean = false;
  truthTableSteps: Array<any> = [];
  truthTableHeaders: string[] = [];

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
    this.truthTableSteps = [];
    this.showModal = false;
  }

  // Validación básica de proposiciones lógicas
  validateProposition(expr: string): string | null {
    const allowed = /^[pqr()¬∧∨→↔\s]+$/;
    if (!allowed.test(expr)) {
      return 'Solo puedes usar p, q, r y operadores lógicos.';
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

  // Evaluador seguro de proposiciones lógicas
  evalProposition(expr: string, values: { [k: string]: boolean }): boolean {
    // Parser recursivo para ¬, ∧, ∨, →, ↔ y paréntesis
    // Adaptado para expresiones con p, q, r y operadores
    const tokens = expr.replace(/\s+/g, '').split("");
    let pos = 0;

    function parseExpr(): boolean {
      let result = parseTerm();
      while (pos < tokens.length) {
        if (tokens[pos] === '∨') {
          pos++;
          result = result || parseTerm();
        } else if (tokens[pos] === '↔') {
          pos++;
          result = result === parseTerm();
        } else {
          break;
        }
      }
      return result;
    }

    function parseTerm(): boolean {
      let result = parseFactor();
      while (pos < tokens.length) {
        if (tokens[pos] === '∧') {
          pos++;
          result = result && parseFactor();
        } else if (tokens[pos] === '→') {
          pos++;
          // a → b es (!a || b)
          result = (!result) || parseFactor();
        } else {
          break;
        }
      }
      return result;
    }

    function parseFactor(): boolean {
      if (tokens[pos] === '¬') {
        pos++;
        return !parseFactor();
      } else if (tokens[pos] === '(') {
        pos++;
        const val = parseExpr();
        if (tokens[pos] === ')') pos++;
        return val;
      } else if (tokens[pos] === 'p' || tokens[pos] === 'q' || tokens[pos] === 'r') {
        const v = values[tokens[pos] as 'p' | 'q' | 'r'];
        pos++;
        return v;
      } else {
        // Si hay error de parsing, retorna false
        pos++;
        return false;
      }
    }

    pos = 0;
    try {
      const val = parseExpr();
      return val;
    } catch {
      return false;
    }
  }

  // Generar la tabla de verdad dinámica
  generateTruthTable(expr: string) {
  this.truthTableSteps = [];
  this.truthTableHeaders = [];
    // Detectar variables presentes
    const variables = Array.from(new Set(expr.match(/[pqr]/g) || []));
    // Detectar subproposiciones (solo nivel 1: paréntesis y operadores principales)
    // Para demo, extraer subproposiciones entre paréntesis y operadores principales
    const subprops: string[] = [];
    const regexSub = /\(([^()]+)\)/g;
    let match;
    while ((match = regexSub.exec(expr)) !== null) {
      if (!subprops.includes(match[1])) subprops.push(match[1]);
    }
    // También agregar subproposiciones simples (por ejemplo, p→q)
    const simpleOps = expr.match(/([pqr][¬]?([∧∨→↔])[pqr][¬]?)/g) || [];
    simpleOps.forEach(op => { if (!subprops.includes(op)) subprops.push(op); });
    // Encabezados: variables + subproposiciones + proposición principal
    this.truthTableHeaders = [...variables, ...subprops, expr];

    // Generar todas las combinaciones de variables
    const combos = (vars: string[]): boolean[][] => {
      if (vars.length === 0) return [[]];
      const rest = combos(vars.slice(1));
      return [
        ...rest.map(c => [true, ...c]),
        ...rest.map(c => [false, ...c])
      ];
    };
    const allCombos = combos(variables);

    // Para cada combinación, calcular subproposiciones y resultado final
    for (const combo of allCombos) {
      const values: { [k: string]: boolean } = {};
      variables.forEach((v, i) => values[v] = combo[i]);
      const row: any = {};
      // Variables
      variables.forEach(v => row[v] = values[v] ? 'V' : 'F');
      // Subproposiciones
      subprops.forEach(sub => {
        row[sub] = this.evalProposition(sub, values) ? 'V' : 'F';
      });
      // Proposición principal
      row[expr] = this.evalProposition(expr, values) ? 'V' : 'F';
      this.truthTableSteps.push(row);
  // ...no explanation needed...
    }
  }

  onValidate(event: Event) {
    event.preventDefault();
    this.error = '';
    this.result = '';
    this.truthTableSteps = [];
    const validation = this.validateProposition(this.proposition.trim());
    if (validation) {
      this.error = validation;
    } else {
      this.result = 'La proposición es válida.';
      this.generateTruthTable(this.proposition.trim());
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.truthTableSteps = [];
    this.result = '';
  }
}
