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
  isSimulated?: boolean;
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
  simulation?: {
    enabled: boolean;
    target: number;
    total: number;
    difference: number;
    count: number;
  };
};

export type SimulationPackageOption = {
  package: string;
  amount: number;
  name: string;
  preferenceWeight: number;
};

export type SimulationResult = {
  rows: NormalizedTransaction[];
  total: number;
  difference: number;
  target: number;
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

export const SIMULATION_PACKAGE_OPTIONS: SimulationPackageOption[] = [
  { package: "Wedding", amount: 600000, name: "Wedding Session", preferenceWeight: 1 },
  { package: "Wedding", amount: 1800000, name: "Wedding Session", preferenceWeight: 2 },
  { package: "Wedding", amount: 3000000, name: "Wedding Session", preferenceWeight: 12 },
  { package: "Prewedding", amount: 400000, name: "Prewedding Session", preferenceWeight: 3 },
  { package: "Prewedding", amount: 750000, name: "Prewedding Session", preferenceWeight: 1 },
  { package: "Prewedding", amount: 1100000, name: "Prewedding Session", preferenceWeight: 1 },
  { package: "Lamaran", amount: 600000, name: "Lamaran Session", preferenceWeight: 1 },
  { package: "Lamaran", amount: 1200000, name: "Lamaran Session", preferenceWeight: 1 },
  { package: "Photoshoot Birthday", amount: 300000, name: "Birthday Session", preferenceWeight: 3 },
];

const SIMULATION_SCALE = 50000;
const SIMULATION_PERSON_POOL = [
  { name: "rentia", phone: "6285609411244" },
  { name: "ardi", phone: "6282279087904" },
  { name: "akbar", phone: "6285832551447" },
  { name: "fira", phone: "6282177683718" },
  { name: "iin", phone: "6281267472535" },
  { name: "vita", phone: "6281379211622" },
  { name: "ulfa", phone: "6285366191212" },
  { name: "afifah", phone: "6285769535618" },
  { name: "rika", phone: "6281352755934" },
  { name: "Eli", phone: "6282179449744" },
  { name: "lisa", phone: "6285213807567" },
  { name: "david", phone: "6285273264705" },
  { name: "nanda", phone: "6285769532312" },
  { name: "cipa", phone: "6281379456095" },
  { name: "cutia", phone: "6287860477220" },
  { name: "amel", phone: "6283187708049" },
  { name: "riska", phone: "6287867977447" },
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

function createSimulationRow(
  option: SimulationPackageOption,
  year: number,
  month: number,
  index: number
): NormalizedTransaction {
  const day = ((index * 3) % 24) + 3;
  const createdAtDate = new Date(year, month, day, 12, index % 60, 0, 0);
  const seed = year * 100 + month * 10 + index + Math.round(option.amount / 100000);
  const person = SIMULATION_PERSON_POOL[seed % SIMULATION_PERSON_POOL.length];

  return {
    id: `simulation-${year}-${month + 1}-${index + 1}-${option.package}-${option.amount}`,
    name: person.name,
    package: option.package,
    phone: person.phone,
    link: "",
    total_spending: option.amount,
    created_at: createdAtDate.toISOString(),
    createdAtDate,
    isSimulated: true,
  };
}

export function parseCurrencyInput(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value.replace(/[^\d]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

export function buildSimulationTransactions(
  targetInput: string | number,
  year: number,
  month: number
): SimulationResult {
  const target = parseCurrencyInput(targetInput);
  if (target <= 0) {
    return {
      rows: [],
      total: 0,
      difference: 0,
      target: 0,
    };
  }

  const scaledTarget = Math.round(target / SIMULATION_SCALE);
  const scaledOptions = SIMULATION_PACKAGE_OPTIONS.map((option) => ({
    ...option,
    scaledAmount: Math.round(option.amount / SIMULATION_SCALE),
  }));
  const maxScaledOption = Math.max(...scaledOptions.map((option) => option.scaledAmount));
  const searchLimit = scaledTarget + maxScaledOption;

  const dp: ({
    count: number;
    previous: number;
    optionIndex: number;
    penalty: number;
  } | null)[] = new Array(
    searchLimit + 1
  ).fill(null);
  dp[0] = { count: 0, previous: -1, optionIndex: -1, penalty: 0 };

  for (let sum = 1; sum <= searchLimit; sum += 1) {
    for (let optionIndex = 0; optionIndex < scaledOptions.length; optionIndex += 1) {
      const option = scaledOptions[optionIndex];
      const previous = sum - option.scaledAmount;
      if (previous < 0 || !dp[previous]) {
        continue;
      }

      const candidateCount = (dp[previous]?.count || 0) + 1;
      const candidatePenalty = (dp[previous]?.penalty || 0) + option.preferenceWeight;
      const existing = dp[sum];
      if (
        !existing ||
        candidatePenalty < existing.penalty ||
        (candidatePenalty === existing.penalty && candidateCount < existing.count)
      ) {
        dp[sum] = {
          count: candidateCount,
          previous,
          optionIndex,
          penalty: candidatePenalty,
        };
      }
    }
  }

  let bestSum = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  let bestPenalty = Number.POSITIVE_INFINITY;
  let bestCount = Number.POSITIVE_INFINITY;

  for (let sum = 1; sum <= searchLimit; sum += 1) {
    if (!dp[sum]) continue;

    const diff = Math.abs(sum - scaledTarget);
    const penalty = dp[sum]?.penalty || 0;
    const count = dp[sum]?.count || 0;
    if (
      diff < bestDiff ||
      (diff === bestDiff && penalty < bestPenalty) ||
      (diff === bestDiff && penalty === bestPenalty && count < bestCount)
    ) {
      bestSum = sum;
      bestDiff = diff;
      bestPenalty = penalty;
      bestCount = count;
    }
  }

  if (!bestSum) {
    const fallbackOption = scaledOptions.reduce((best, current) => {
      const currentDiff = Math.abs(current.amount - target);
      const bestDiffAmount = Math.abs(best.amount - target);
      if (currentDiff !== bestDiffAmount) {
        return currentDiff < bestDiffAmount ? current : best;
      }

      return current.preferenceWeight < best.preferenceWeight ? current : best;
    });

    return {
      rows: [createSimulationRow(fallbackOption, year, month, 0)],
      total: fallbackOption.amount,
      difference: Math.abs(fallbackOption.amount - target),
      target,
    };
  }

  const chosenOptions: SimulationPackageOption[] = [];
  let pointer = bestSum;

  while (pointer > 0) {
    const step = dp[pointer];
    if (!step || step.optionIndex < 0) {
      break;
    }

    chosenOptions.push(scaledOptions[step.optionIndex]);
    pointer = step.previous;
  }

  const rows = chosenOptions
    .sort((a, b) => b.amount - a.amount)
    .map((option, index) => createSimulationRow(option, year, month, index));
  const total = rows.reduce((sum, row) => sum + row.total_spending, 0);

  return {
    rows,
    total,
    difference: Math.abs(total - target),
    target,
  };
}

export function buildMonthlyReport(
  items: TransactionRecord[],
  year: number,
  month: number,
  additionalTransactions: NormalizedTransaction[] = [],
  simulationTarget = 0
): MonthlyReportData {
  const normalizedItems = items
    .map(normalizeTransaction)
    .filter((item): item is NormalizedTransaction => Boolean(item.createdAtDate))
    .sort((a, b) => {
      return (b.createdAtDate?.getTime() || 0) - (a.createdAtDate?.getTime() || 0);
    });
  const mergedItems = [...normalizedItems, ...additionalTransactions].sort((a, b) => {
    return (b.createdAtDate?.getTime() || 0) - (a.createdAtDate?.getTime() || 0);
  });

  const monthlyItems = mergedItems.filter((item) => {
    return (
      item.createdAtDate?.getFullYear() === year &&
      item.createdAtDate?.getMonth() === month
    );
  });

  const previousMonthDate = new Date(year, month - 1, 1);
  const previousMonthItems = mergedItems.filter((item) => {
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
    simulation: {
      enabled: additionalTransactions.length > 0,
      target: simulationTarget,
      total: additionalTransactions.reduce((sum, item) => sum + item.total_spending, 0),
      difference: Math.abs(
        additionalTransactions.reduce((sum, item) => sum + item.total_spending, 0) - simulationTarget
      ),
      count: additionalTransactions.length,
    },
  };
}
