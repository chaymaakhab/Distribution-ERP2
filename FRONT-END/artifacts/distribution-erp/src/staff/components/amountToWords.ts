// Utility to convert numbers to French words for Moroccan legal invoices and purchase orders.

const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];

  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7) {
    return unit === 1 ? 'soixante et onze' : `soixante-${TEENS[unit]}`;
  }
  if (ten === 9) {
    return `quatre-vingt-${TEENS[unit]}`;
  }

  const base = TENS[ten];
  if (unit === 0) {
    return ten === 8 ? 'quatre-vingts' : base;
  }
  if (unit === 1 && ten < 8) {
    return `${base} et un`;
  }
  return `${base}-${UNITS[unit]}`;
}

function convertHundreds(n: number): string {
  if (n === 0) return '';
  const c = Math.floor(n / 100);
  const rem = n % 100;
  let res = '';
  if (c > 0) {
    res = c === 1 ? 'cent' : `${UNITS[c]} cent${rem === 0 ? 's' : ''}`;
  }
  if (rem > 0) {
    const remStr = convertGroup(rem);
    res = res ? `${res} ${remStr}` : remStr;
  }
  return res;
}

export function numberToFrenchWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'Zéro Dirham';

  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const hundreds = intPart % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${convertHundreds(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${convertHundreds(thousands)} mille`);
  }
  if (hundreds > 0) {
    parts.push(convertHundreds(hundreds));
  }

  let text = parts.join(' ').trim();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text += intPart > 1 ? ' Dirhams' : ' Dirham';

  if (decPart > 0) {
    text += ` et ${decPart} centime${decPart > 1 ? 's' : ''}`;
  } else {
    text += ' et zéro centime';
  }

  return text;
}
