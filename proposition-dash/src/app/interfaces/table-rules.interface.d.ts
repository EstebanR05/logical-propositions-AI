export interface LogicalRule {
  name: string;
  operator: string;
  description: string;
  truthTable: Array<{ A: string, B?: string, result: string }>;
}