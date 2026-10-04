const RUPEE_GROUPED = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const RUPEE_PLAIN = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * One money formatter for the whole app.
 * `formatRs(1250)` -> "Rs. 1,250"
 * `formatRs(1250.5)` -> "Rs. 1,250.50"
 * `formatRs(1250, { decimals: true })` -> always shows two decimals.
 * `formatRs(1250, { symbol: false })` -> "1,250"
 */
export function formatRs(
  value: number | string | null | undefined,
  options: { decimals?: boolean; symbol?: boolean } = {},
): string {
  const n = toNumber(value);
  const { decimals = false, symbol = true } = options;
  const hasFraction = decimals || Math.abs(n % 1) > 0.0000001;
  const grouped = hasFraction ? RUPEE_GROUPED.format(n) : RUPEE_PLAIN.format(n);
  return symbol ? `Rs. ${grouped}` : grouped;
}

/** Plain integer count with Indian grouping, no currency symbol. */
export function formatCount(value: number | string | null | undefined): string {
  return RUPEE_PLAIN.format(toNumber(value));
}

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : DATE_LONG.format(d);
}

export function formatDayMonth(value: string | number | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : DATE_SHORT.format(d);
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : DATE_TIME.format(d);
}

export function formatPhone(phone: string | null | undefined): string {
  const str = (phone ?? "").toString();
  if (str.length === 10) return `${str.slice(0, 3)}-${str.slice(3, 6)}-${str.slice(6)}`;
  return str;
}

/** "pending" -> "Pending", "khalti" -> "Khalti". Sentence-safe label casing. */
export function humanize(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}