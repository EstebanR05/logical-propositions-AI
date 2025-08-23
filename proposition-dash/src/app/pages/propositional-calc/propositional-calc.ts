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
  const binOp = '[∧∨→↔]';
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
    // Solo operadores binarios seguidos, no ¬
    if (new RegExp(`${binOp}{2,}`).test(expr)) return 'No puedes poner operadores binarios seguidos.';
    // Negación seguida de operador binario (¬∧, ¬∨, ¬→, ¬↔)
    if (new RegExp(`¬${binOp}`).test(expr)) return 'La negación debe aplicarse a una variable o subexpresión, no a un operador.';
    // Variable seguida de negación (p¬, q¬, r¬)
    if (new RegExp(`[pqr]¬`).test(expr)) return 'La negación debe ir antes de la variable, no después.';
    // Solo operadores binarios no pueden ir al inicio (¬ sí puede)
    if (new RegExp(`^${binOp}`).test(expr)) return 'No puedes iniciar con un operador binario.';
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
    // Preprocesar para tratar negaciones como tokens únicos
    let processedExpr = expr.replace(/\s+/g, '');
    
    // Reemplazar todas las negaciones ¬[variable] con tokens especiales
    const variables = Object.keys(values).filter(key => !key.startsWith('¬') && /^[pqr]$/.test(key));
    variables.forEach((variable, index) => {
      const negation = `¬${variable}`;
      const token = `§N${index}§`;
      processedExpr = processedExpr.replace(new RegExp(`¬${variable}`, 'g'), token);
    });
    
    const tokens = processedExpr.split("");
    const posObj = { pos: 0 };
    try {
      return this.evalParser(tokens, values, posObj, variables);
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

    // 1. Negaciones simples
    const negations: string[] = [];
    variables.forEach(v => {
      if (expr.includes(`¬${v}`)) negations.push(`¬${v}`);
    });

    // 2. Subproposiciones internas (solo las de primer nivel de paréntesis)
    const subprops: string[] = [];
    const regexSub = /\(([^()]+)\)/g;
    let match;
    while ((match = regexSub.exec(expr)) !== null) {
      if (!subprops.includes(match[1])) subprops.push(match[1]);
    }

    // 3. Proposición principal
    this.truthTableHeaders = [...variables, ...negations, ...subprops, expr];

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
      // Variables
      variables.forEach(v => row[v] = values[v] ? 'V' : 'F');
      // Negaciones
      negations.forEach(n => {
        const varName = n.replace('¬', '');
        row[n] = this.tableRuleService.negacion(values[varName]) ? 'V' : 'F';
      });
      // Subproposiciones (usando los resultados de negaciones)
      subprops.forEach(sub => {
        // Para evaluar la subproposición, crear un nuevo objeto de valores incluyendo negaciones
        const subValues = { ...values };
        negations.forEach(n => {
          const varName = n.replace('¬', '');
          subValues[n] = this.tableRuleService.negacion(values[varName]);
        });
        row[sub] = this.evalProposition(sub, subValues) ? 'V' : 'F';
      });
      // Proposición principal (reemplazando subproposiciones con sus valores)
      let mainExpr = expr;
      subprops.forEach(sub => {
        const subValue = row[sub] === 'V';
        // Reemplazar la subproposición completa con su valor
        mainExpr = mainExpr.replace(`(${sub})`, subValue ? 'TEMP_TRUE' : 'TEMP_FALSE');
      });
      
      const mainValues = { ...values };
      negations.forEach(n => {
        const varName = n.replace('¬', '');
        mainValues[n] = this.tableRuleService.negacion(values[varName]);
      });
      // Agregar valores temporales para las subproposiciones evaluadas
      mainValues['TEMP_TRUE'] = true;
      mainValues['TEMP_FALSE'] = false;
      
      row[expr] = this.evalProposition(mainExpr, mainValues) ? 'V' : 'F';
      this.truthTableSteps.push(row);
    }
  }

  private evalParser(tokens: string[], values: { [k: string]: boolean }, posObj: { pos: number }, variables?: string[]): boolean {
    let result = this.getTokenValue(tokens, values, posObj, variables);
    while (posObj.pos < tokens.length) {
      const op = tokens[posObj.pos];
      if (!['∧', '∨', '→', '↔'].includes(op)) break;
      posObj.pos++;
      const right = this.getTokenValue(tokens, values, posObj, variables);
      // Asegurar el orden correcto: result es el operando izquierdo, right es el operando derecho
      result = this.applyOp(result, right, op);
    }
    return result;
  }

  private getTokenValue(tokens: string[], values: { [k: string]: boolean }, posObj: { pos: number }, variables?: string[]): boolean {
    const token = tokens[posObj.pos];
    switch (token) {
      case '(': {
        posObj.pos++;
        const val = this.evalParser(tokens, values, posObj, variables);
        if (tokens[posObj.pos] === ')') posObj.pos++;
        return val;
      }
      case '¬': {
        posObj.pos++;
        return this.tableRuleService.negacion(this.getTokenValue(tokens, values, posObj, variables));
      }
      case '§': {
        // Manejar tokens especiales de negación ¬[variable]
        let tokenStr = '';
        let i = posObj.pos;
        while (i < tokens.length && tokens[i] !== '§') {
          tokenStr += tokens[i];
          i++;
        }
        if (i < tokens.length && tokens[i] === '§') {
          tokenStr += tokens[i];
          i++;
        }
        
        // Extraer el índice de la variable desde el token §N[index]§
        const match = tokenStr.match(/§N(\d+)§/);
        if (match && variables) {
          const varIndex = parseInt(match[1]);
          const variable = variables[varIndex];
          const negationKey = `¬${variable}`;
          posObj.pos = i;
          return values[negationKey] !== undefined ? values[negationKey] : this.tableRuleService.negacion(values[variable]);
        }
        posObj.pos++;
        return false;
      }
      default:
        // Manejar variables p, q, r directamente
        if (/^[pqr]$/.test(token)) {
          posObj.pos++;
          return values[token] !== undefined ? values[token] : false;
        }
        // Manejar tokens temporales para subproposiciones
        if (token === 'T') {
          const tempToken = tokens.slice(posObj.pos, posObj.pos + 9).join('');
          if (tempToken === 'TEMP_TRUE') {
            posObj.pos += 9;
            return values['TEMP_TRUE'] !== undefined ? values['TEMP_TRUE'] : true;
          }
          const tempFalseToken = tokens.slice(posObj.pos, posObj.pos + 10).join('');
          if (tempFalseToken === 'TEMP_FALSE') {
            posObj.pos += 10;
            return values['TEMP_FALSE'] !== undefined ? values['TEMP_FALSE'] : false;
          }
        }
        posObj.pos++;
        return false;
    }
  }

  private applyOp(a: boolean, b: boolean, op: string): boolean {
    switch (op) {
      case '∧': return this.tableRuleService.conjuncion(a, b);
      case '∨': return this.tableRuleService.disyuncion(a, b);
      case '→': 
        // En A→B: a es el antecedente, b es el consecuente
        return this.tableRuleService.condicional(a, b);
      case '↔': return this.tableRuleService.bicondicional(a, b);
      default: return false;
    }
  }
}
