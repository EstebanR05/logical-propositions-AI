import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableRuleService } from '../../services/tables.service';

@Component({
  selector: 'app-propositional-calc',
  imports: [CommonModule, FormsModule],
  providers: [TableRuleService],
  templateUrl: './propositional-calc.html',
  styleUrl: './propositional-calc.css'
})
export class PropositionalCalc {
  public proposition: string = '';
  public error: string = '';
  public result: string = '';

  public symbols: string[] = ['¬', '∧', '∨', '→', '↔'];
  public letters: string[] = ['p', 'q', 'r'];

  public showModal: boolean = false;
  public truthTableSteps: Array<any> = [];
  public truthTableHeaders: string[] = [];

  constructor(private tableRuleService: TableRuleService) { }

  public addSymbol(symbol: string) {
    this.proposition += symbol;
  }

  public removeLast() {
    this.proposition = this.proposition.slice(0, -1);
  }

  public clearAll() {
    this.proposition = '';
    this.error = '';
    this.result = '';
    this.truthTableSteps = [];
    this.showModal = false;
  }

  public closeModal() {
    this.showModal = false;
    this.truthTableSteps = [];
    this.result = '';
  }

  public onValidate(event: Event) {
    event.preventDefault();
    this.error = '';
    this.result = '';
    this.truthTableSteps = [];
    const validation = this.validateProposition(this.proposition.trim());
    
    if (!validation) {
      this.result = 'La proposición es válida.';
      this.generateTruthTable(this.proposition.trim());
      this.showModal = true;
      return;
    }

    this.error = validation;
  }

  private validateProposition(expr: string): string | null {
    const allowed = /^[pqr()¬∧∨→↔\s]+$/;
    const op = '[¬∧∨→↔]';
    let balance = 0;

    if (!allowed.test(expr)) {
      return 'Solo puedes usar p, q, r y operadores lógicos.';
    }

    for (const char of expr) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) return 'Paréntesis desbalanceados.';
    }
    
    if (balance !== 0) return 'Paréntesis desbalanceados.';
    if (new RegExp(`${op}{2,}`).test(expr)) return 'No puedes poner operadores seguidos.';
    if (new RegExp(`^${op}`).test(expr)) return 'No puedes iniciar con un operador.';
    if (new RegExp(`${op}$`).test(expr)) return 'No puedes terminar con un operador.';

    // No permitir operadores sin operandos válidos antes/después
    if (/([∧∨→↔])\)/.test(expr) || /\(([∧∨→↔])/.test(expr)) return 'Operador mal ubicado cerca de paréntesis.';
    if (/([∧∨→↔]){2,}/.test(expr)) return 'Operadores mal ubicados.';
    if (/([∧∨→↔])$/.test(expr)) return 'Operador sin operando después.';
    if (/^([∧∨→↔])/.test(expr)) return 'Operador sin operando antes.';
    if (/([pqr])([∧∨→↔])\1/.test(expr)) return 'No puedes comparar una variable consigo misma (ejemplo: p∧p, q↔q, r→r).';

    const variables = Array.from(new Set(expr.match(/[pqr]/g) || []));
    if (variables.length === 0) return 'Debes usar al menos una variable (p, q o r).';
    return null;
  }

  private evalProposition(expr: string, values: { [k: string]: boolean }): boolean {
    const tokens = expr.replace(/\s+/g, '').split("");
    const posObj = { pos: 0 };
    try {
      return this.evalParser(tokens, values, posObj);
    } catch {
      return false;
    }
  }

  private generateTruthTable(expr: string) {
    this.truthTableSteps = [];
    this.truthTableHeaders = [];
    const variables: string[] = [];

    for (const v of expr) {
      if ((v === 'p' || v === 'q' || v === 'r') && !variables.includes(v)) variables.push(v);
    }

    const subprops: string[] = [];
    const regexSub = /\(([^()]+)\)/g;
    let match;

    while ((match = regexSub.exec(expr)) !== null) {
      if (!subprops.includes(match[1])) subprops.push(match[1]);
    }

    const simpleOps = expr.match(/([pqr][¬]?([∧∨→↔])[pqr][¬]?)/g) || [];
    simpleOps.forEach(op => { if (!subprops.includes(op)) subprops.push(op); });
    this.truthTableHeaders = [...variables, ...subprops, expr];

    const combos = (vars: string[]): boolean[][] => {
      if (vars.length === 0) return [[]];
      const rest = combos(vars.slice(1));
      return [
        ...rest.map(c => [true, ...c]),
        ...rest.map(c => [false, ...c])
      ];
    };

    const allCombos = combos(variables);

    for (const combo of allCombos) {
      const values: { [k: string]: boolean } = {};
      variables.forEach((v, i) => values[v] = combo[i]);
      const row: any = {};
      variables.forEach(v => row[v] = values[v] ? 'V' : 'F');
      subprops.forEach(sub => row[sub] = this.evalProposition(sub, values) ? 'V' : 'F');
      row[expr] = this.evalProposition(expr, values) ? 'V' : 'F';
      this.truthTableSteps.push(row);
    }
  }

  private evalParser(tokens: string[], values: { [k: string]: boolean }, posObj: { pos: number }): boolean {
    let result = this.getTokenValue(tokens, values, posObj);
    while (posObj.pos < tokens.length) {
      const op = tokens[posObj.pos];
      if (!['∧', '∨', '→', '↔'].includes(op)) break;
      posObj.pos++;
      const right = this.getTokenValue(tokens, values, posObj);
      result = this.applyOp(result, right, op);
    }
    return result;
  }

  private getTokenValue(tokens: string[], values: { [k: string]: boolean }, posObj: { pos: number }): boolean {
    const token = tokens[posObj.pos];
    switch (token) {
      case '(': {
        posObj.pos++;
        const val = this.evalParser(tokens, values, posObj);
        if (tokens[posObj.pos] === ')') posObj.pos++;
        return val;
      }
      case '¬': {
        posObj.pos++;
        return this.tableRuleService.negacion(this.getTokenValue(tokens, values, posObj));
      }
      case 'p': posObj.pos++; return values['p'];
      case 'q': posObj.pos++; return values['q'];
      case 'r': posObj.pos++; return values['r'];
      default:
        posObj.pos++;
        return false;
    }
  }

  private applyOp(a: boolean, b: boolean, op: string): boolean {
    switch (op) {
      case '∧': return this.tableRuleService.conjuncion(a, b);
      case '∨': return this.tableRuleService.disyuncion(a, b);
      case '→': return this.tableRuleService.condicional(a, b);
      case '↔': return this.tableRuleService.bicondicional(a, b);
      default: return false;
    }
  }
}
