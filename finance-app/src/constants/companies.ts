export interface CompanyConfig {
  symbol: string;
  name: string;
  color: string;
  isPrimary: boolean;
}

export const DEFAULT_COMPANIES: CompanyConfig[] = [
  { symbol: 'IBM', name: 'International Business Machines', color: '#0066FF', isPrimary: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', color: '#00A4EF', isPrimary: false },
  { symbol: 'ORCL', name: 'Oracle Corporation', color: '#F80000', isPrimary: false },
  { symbol: 'SAP', name: 'SAP SE', color: '#0099D5', isPrimary: false },
  { symbol: 'CRM', name: 'Salesforce Inc.', color: '#00A1E0', isPrimary: false },
];

export const PRIMARY_SYMBOL = 'IBM' as const;

export function getCompanyConfig(symbol: string): CompanyConfig | undefined {
  return DEFAULT_COMPANIES.find((c) => c.symbol === symbol);
}

export function getPrimaryCompany(): CompanyConfig {
  return DEFAULT_COMPANIES.find((c) => c.isPrimary)!;
}

export function getCompetitors(): CompanyConfig[] {
  return DEFAULT_COMPANIES.filter((c) => !c.isPrimary);
}

export function getAllSymbols(): string[] {
  return DEFAULT_COMPANIES.map((c) => c.symbol);
}