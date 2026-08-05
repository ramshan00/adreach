export function normalizePakistaniMobile(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, "");
  if (/^03\d{9}$/.test(compact)) return `+92${compact.slice(1)}`;
  if (/^923\d{9}$/.test(compact)) return `+${compact}`;
  if (/^\+923\d{9}$/.test(compact)) return compact;
  return null;
}
