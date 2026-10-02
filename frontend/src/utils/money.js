// A API envia e recebe valores como texto com 2 casas ("35.90").
// No frontend os cálculos são feitos em centavos (inteiros) para evitar erros de arredondamento.

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function toCents(amount) {
  const [reais, centavos = '0'] = String(amount).split('.');
  return Number(reais) * 100 + Number(centavos.padEnd(2, '0').slice(0, 2));
}

export function centsToAmount(cents) {
  return `${Math.floor(cents / 100)}.${pad2(cents % 100)}`;
}

// "35.90" → "R$ 35,90"
export function formatMoney(amount) {
  return currency.format(toCents(amount) / 100);
}

export function formatCents(cents) {
  return currency.format(cents / 100);
}

// 3590 → "35,90" (sem o símbolo da moeda, para o campo de valor)
export function formatCentsPlain(cents) {
  return decimal.format(cents / 100);
}

function pad2(number) {
  return String(number).padStart(2, '0');
}
