import { Injectable } from "@angular/core";
import { LogicalRule } from "../interfaces/table-rules.interface";


@Injectable({
    providedIn: "root",
})
export class TableRuleService {
    negacion(a: boolean): boolean {
        return !a;
    }
    
    conjuncion(a: boolean, b: boolean): boolean {
        return a && b;
    }
    
    disyuncion(a: boolean, b: boolean): boolean {
        return a || b;
    }
    
    condicional(a: boolean, b: boolean): boolean {
        return !a || b;
    }
    
    bicondicional(a: boolean, b: boolean): boolean {
        return a === b;
    }

    public static RULES: LogicalRule[] = [
        {
            name: "Negación",
            operator: "¬",
            description: "La negación invierte el valor de verdad.",
            truthTable: [
                { A: "V", result: "F" },
                { A: "F", result: "V" },
            ],
        },
        {
            name: "Conjunción",
            operator: "∧",
            description: "La conjunción es verdadera solo si ambos son verdaderos.",
            truthTable: [
                { A: "V", B: "V", result: "V" },
                { A: "V", B: "F", result: "F" },
                { A: "F", B: "V", result: "F" },
                { A: "F", B: "F", result: "F" },
            ],
        },
        {
            name: "Disyunción",
            operator: "∨",
            description: "La disyunción es verdadera si al menos uno es verdadero.",
            truthTable: [
                { A: "V", B: "V", result: "V" },
                { A: "V", B: "F", result: "V" },
                { A: "F", B: "V", result: "V" },
                { A: "F", B: "F", result: "F" },
            ],
        },
        {
            name: "Condicionalidad",
            operator: "→",
            description: "La condicionalidad es falsa solo si el antecedente es verdadero y el consecuente falso.",
            truthTable: [
                { A: "V", B: "V", result: "V" },
                { A: "V", B: "F", result: "F" },
                { A: "F", B: "V", result: "V" },
                { A: "F", B: "F", result: "V" },
            ],
        },
        {
            name: "Bicondicionalidad",
            operator: "↔",
            description: "La bicondicionalidad es verdadera si ambos tienen el mismo valor de verdad.",
            truthTable: [
                { A: "V", B: "V", result: "V" },
                { A: "V", B: "F", result: "F" },
                { A: "F", B: "V", result: "F" },
                { A: "F", B: "F", result: "V" },
            ],
        },
    ];
}