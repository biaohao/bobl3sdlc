export function isValidTicker(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
}

export function normalizeTicker(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}