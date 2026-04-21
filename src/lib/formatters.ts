export const fmtUSD = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const fmtBs = (n: number): string =>
  `Bs ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

export const fmtRate = (n: number): string =>
  `${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} Bs/$`;

export const fmtDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const fmtPercent = (n: number): string =>
  `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
