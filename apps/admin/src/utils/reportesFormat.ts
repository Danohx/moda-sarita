export function formatMoney(value: unknown) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(number) ? number : 0);
}

export function formatNumber(value: unknown) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX").format(
    Number.isFinite(number) ? number : 0,
  );
}

export function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysYmd(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}