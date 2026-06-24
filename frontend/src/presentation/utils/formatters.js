/**
 * Formats a numeric value into a localized currency string.
 * @param {number} value - The numeric value in base units.
 * @param {string} currency - The currency code (e.g., 'USD', 'INR').
 * @param {object} [options] - Optional Intl.NumberFormat options.
 * @returns {string}
 */
export function formatCurrency(value, currency = "USD", options = {}) {
  const defaultFractionDigits = currency === "USD" || currency === "INR" ? 2 : 2;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: options.fractionDigits !== undefined ? options.fractionDigits : defaultFractionDigits,
    ...options,
  }).format(value || 0);
}

/**
 * Converts sub-units (e.g., cents, paise) to base units (e.g., dollars, rupees).
 * @param {number} subUnitValue - Value in sub-units.
 * @returns {number}
 */
export function toBaseUnit(subUnitValue) {
  return (subUnitValue || 0) / 100;
}

/**
 * Converts base units (e.g., dollars, rupees) to sub-units (e.g., cents, paise).
 * @param {number} baseUnitValue - Value in base units.
 * @returns {number}
 */
export function toSubUnit(baseUnitValue) {
  const parsed = parseFloat(baseUnitValue);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
