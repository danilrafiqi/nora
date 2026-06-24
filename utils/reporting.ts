export type TransactionRecord = {
  id: string;
  name?: string;
  package?: string;
  phone?: string;
  link?: string;
  total_spending?: number | string | null;
  created_at?: string;
};

export type NormalizedTransaction = {
  id: string;
  name: string;
  package: string;
  phone: string;
  link: string;
  total_spending: number;
  created_at: string;
  createdAtDate: Date | null;
};

export type TopPackage = {
  name: string;
  count: number;
  revenue: number;
};

export type MonthlyReportSummary = {
  revenue: number;
  count: number;
  avgTransaction: number;
  topPackages: TopPackage[];
};

export type MonthlyReportData = {
  month: number;
  year: number;
  monthLabel: string;
  fileLabel: string;
  generatedAtLabel: string;
  transactions: NormalizedTransaction[];
  summary: MonthlyReportSummary;
  previousMonth: {
    revenue: number;
    count: number;
  };
  monthlyGrowth: number;
};

export const MONTH_OPTIONS = [
  { value: 0, label: "Januari" },
  { value: 1, label: "Februari" },
  { value: 2, label: "Maret" },
  { value: 3, label: "April" },
  { value: 4, label: "Mei" },
  { value: 5, label: "Juni" },
  { value: 6, label: "Juli" },
  { value: 7, label: "Agustus" },
  { value: 8, label: "September" },
  { value: 9, label: "Oktober" },
  { value: 10, label: "November" },
  { value: 11, label: "Desember" },
] as const;

export function formatCurrency(value: number): string {
  return "Rp " + (Number.isFinite(value) ? value : 0).toLocaleString("id-ID");
}

export function formatNumber(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("id-ID");
}

export function formatMonthYearLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function formatReportGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function formatTransactionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getReportFileName(year: number, month: number): string {
  const normalizedMonth = `${month + 1}`.padStart(2, "0");
  return `report-transaksi-${year}-${normalizedMonth}.pdf`;
}

export function getAvailableReportYears(items: TransactionRecord[]): number[] {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>([currentYear]);

  items.forEach((item) => {
    const date = new Date(item.created_at ?? "");
    if (!Number.isNaN(date.getTime())) {
      years.add(date.getFullYear());
    }
  });

  return Array.from(years).sort((a, b) => b - a);
}

export function getAvailableYearsForMonth(
  items: TransactionRecord[],
  month: number
): number[] {
  const years = new Set<number>();

  items.forEach((item) => {
    const date = new Date(item.created_at ?? "");
    if (!Number.isNaN(date.getTime()) && date.getMonth() === month) {
      years.add(date.getFullYear());
    }
  });

  return Array.from(years).sort((a, b) => b - a);
}

export function normalizeTransaction(item: TransactionRecord): NormalizedTransaction {
  const date = new Date(item.created_at ?? "");
  const createdAtDate = Number.isNaN(date.getTime()) ? null : date;

  return {
    id: item.id,
    name: item.name?.trim() || "Tanpa Nama",
    package: item.package?.trim() || "Tanpa Paket",
    phone: item.phone?.trim() || "-",
    link: item.link?.trim() || "",
    total_spending: Number(item.total_spending) || 0,
    created_at: item.created_at || "",
    createdAtDate,
  };
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function calculateSummary(items: NormalizedTransaction[]): MonthlyReportSummary {
  const packageMap: Record<string, TopPackage> = {};
  let revenue = 0;
  let count = 0;

  items.forEach((item) => {
    revenue += item.total_spending;
    count += 1;

    if (!packageMap[item.package]) {
      packageMap[item.package] = {
        name: item.package,
        count: 0,
        revenue: 0,
      };
    }

    packageMap[item.package].count += 1;
    packageMap[item.package].revenue += item.total_spending;
  });

  return {
    revenue,
    count,
    avgTransaction: count > 0 ? revenue / count : 0,
    topPackages: Object.values(packageMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  };
}

export function buildMonthlyReport(
  items: TransactionRecord[],
  year: number,
  month: number
): MonthlyReportData {
  const normalizedItems = items
    .map(normalizeTransaction)
    .filter((item) => item.createdAtDate)
    .sort((a, b) => {
      return (b.createdAtDate?.getTime() || 0) - (a.createdAtDate?.getTime() || 0);
    });

  const monthlyItems = normalizedItems.filter((item) => {
    return (
      item.createdAtDate?.getFullYear() === year &&
      item.createdAtDate?.getMonth() === month
    );
  });

  const previousMonthDate = new Date(year, month - 1, 1);
  const previousMonthItems = normalizedItems.filter((item) => {
    return (
      item.createdAtDate?.getFullYear() === previousMonthDate.getFullYear() &&
      item.createdAtDate?.getMonth() === previousMonthDate.getMonth()
    );
  });

  const summary = calculateSummary(monthlyItems);
  const previousSummary = calculateSummary(previousMonthItems);

  return {
    month,
    year,
    monthLabel: formatMonthYearLabel(year, month),
    fileLabel: getReportFileName(year, month),
    generatedAtLabel: formatReportGeneratedAt(new Date()),
    transactions: monthlyItems,
    summary,
    previousMonth: {
      revenue: previousSummary.revenue,
      count: previousSummary.count,
    },
    monthlyGrowth: calculateGrowth(summary.revenue, previousSummary.revenue),
  };
}
