import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

// Gluestack
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  differenceInDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  subDays,
  subMonths,
} from "date-fns";

type Transaction = {
  id: string;
  name: string;
  package: string;
  phone: string;
  link: string;
  total_spending: number;
  created_at: string; // ISO string
};

export default function ReportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<any>({
    daily: { revenue: 0, count: 0 },
    weekly: { revenue: 0, count: 0 },
    monthly: { revenue: 0, count: 0 },
    yearly: { revenue: 0, count: 0 },
    last7: { revenue: 0, count: 0 },
    last30: { revenue: 0, count: 0 },
    last365: { revenue: 0, count: 0 },
    all: { revenue: 0, count: 0 },
    previousMonth: { revenue: 0, count: 0 },
    previousWeek: { revenue: 0, count: 0 },
    topPackages: [] as { name: string; count: number; revenue: number }[],
    avgTransaction: 0,
  });

  // ambil data transaksi dari firestore
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "transaction"));
      const items: Transaction[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(items);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReports = (items: Transaction[]) => {
    const now = new Date();
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    
    // Previous periods for comparison
    const lastMonthStart = subMonths(nowUTC, 1);
    const lastWeekStart = subDays(nowUTC, 7);

    const stats = {
      daily: { revenue: 0, count: 0 },
      weekly: { revenue: 0, count: 0 },
      monthly: { revenue: 0, count: 0 },
      yearly: { revenue: 0, count: 0 },
      last7: { revenue: 0, count: 0 },
      last30: { revenue: 0, count: 0 },
      last365: { revenue: 0, count: 0 },
      all: { revenue: 0, count: 0 },
      previousMonth: { revenue: 0, count: 0 },
      previousWeek: { revenue: 0, count: 0 },
      topPackages: {} as Record<string, { count: number; revenue: number }>,
    };

    items.forEach((t) => {
      const d = new Date(t.created_at);
      const spend = Number(t.total_spending) || 0;
      const pkgName = t.package || "Unknown";

      // Initialize package stats
      if (!stats.topPackages[pkgName]) {
        stats.topPackages[pkgName] = { count: 0, revenue: 0 };
      }
      stats.topPackages[pkgName].count += 1;
      stats.topPackages[pkgName].revenue += spend;

      // All time stats
      stats.all.revenue += spend;
      stats.all.count += 1;

      // Period-based stats
      if (isSameDay(d, nowUTC)) {
        stats.daily.revenue += spend;
        stats.daily.count += 1;
      }
      if (isSameWeek(d, nowUTC, { weekStartsOn: 1 })) {
        stats.weekly.revenue += spend;
        stats.weekly.count += 1;
      }
      if (isSameMonth(d, nowUTC)) {
        stats.monthly.revenue += spend;
        stats.monthly.count += 1;
      }
      if (isSameYear(d, nowUTC)) {
        stats.yearly.revenue += spend;
        stats.yearly.count += 1;
      }

      const diffDays = differenceInDays(nowUTC, d);
      if (diffDays <= 7) {
        stats.last7.revenue += spend;
        stats.last7.count += 1;
      }
      if (diffDays <= 30) {
        stats.last30.revenue += spend;
        stats.last30.count += 1;
      }
      if (diffDays <= 365) {
        stats.last365.revenue += spend;
        stats.last365.count += 1;
      }

      // Previous periods
      if (d >= lastMonthStart && d < subMonths(nowUTC, 0)) {
        if (!isSameMonth(d, nowUTC)) {
          stats.previousMonth.revenue += spend;
          stats.previousMonth.count += 1;
        }
      }
      if (d >= lastWeekStart && d < subDays(nowUTC, 0)) {
        if (!isSameWeek(d, nowUTC, { weekStartsOn: 1 })) {
          stats.previousWeek.revenue += spend;
          stats.previousWeek.count += 1;
        }
      }
    });

    // Calculate average transaction
    const avgTransaction = stats.all.count > 0 ? stats.all.revenue / stats.all.count : 0;

    // Convert topPackages to array and sort
    const topPackages = Object.entries(stats.topPackages)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setReport({
      ...stats,
      topPackages,
      avgTransaction,
    });
  };


  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!loading && user) {
      loadTransactions();
    }
  }, [loading, user]);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateReports(transactions);
    }
  }, [transactions]);

  const formatCurrency = (num: number) =>
    "Rp " + num?.toLocaleString("id-ID");

  const formatNumber = (num: number) => num?.toLocaleString("id-ID");

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-success-600";
    if (growth < 0) return "text-error-600";
    return "text-typography-500";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "📈";
    if (growth < 0) return "📉";
    return "➡️";
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background-0">
        <VStack space="md" className="p-4">
          <Box className="bg-background-100 p-8 rounded-lg border border-outline-200 shadow-medium items-center">
            <Text className="text-lg font-body text-typography-500">Memuat data...</Text>
          </Box>
        </VStack>
      </ScrollView>
    );
  }

  const monthlyGrowth = calculateGrowth(report.monthly.revenue, report.previousMonth.revenue);
  const weeklyGrowth = calculateGrowth(report.weekly.revenue, report.previousWeek.revenue);

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack space="lg" className="p-4">
        {/* Summary Cards - Highlighted */}
        <VStack space="md">
          <Text className="text-2xl font-heading font-bold text-typography-900">Dashboard Report</Text>
          
          {/* Main Stats Grid */}
          <View style={{ gap: 12 }}>
            {/* Total Revenue - Large Card */}
            <Box className="bg-accent-orange/10 p-6 rounded-lg border-2 border-accent-orange shadow-medium">
              <VStack space="sm">
                <Text className="text-sm font-body text-typography-600">Total Revenue</Text>
                <Text className="text-3xl font-heading font-bold text-accent-orange">
                  {formatCurrency(report.all.revenue)}
                </Text>
                <HStack className="items-center gap-2 mt-1">
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.all.count)} transaksi
                  </Text>
                  <Text className="text-xs font-body text-typography-500">•</Text>
                  <Text className="text-xs font-body text-typography-500">
                    Avg: {formatCurrency(report.avgTransaction)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Monthly & Weekly - Side by Side */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Box className="flex-1 bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Bulan Ini</Text>
                  <Text className="text-xl font-heading font-bold text-typography-900">
                    {formatCurrency(report.monthly.revenue)}
                  </Text>
                  <HStack className="items-center gap-1">
                    <Text className="text-xs">{getGrowthIcon(monthlyGrowth)}</Text>
                    <Text className={`text-xs font-body ${getGrowthColor(monthlyGrowth)}`}>
                      {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% vs bulan lalu
                    </Text>
                  </HStack>
                  <Text className="text-xs font-body text-typography-500 mt-1">
                    {formatNumber(report.monthly.count)} transaksi
                  </Text>
                </VStack>
              </Box>

              <Box className="flex-1 bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Minggu Ini</Text>
                  <Text className="text-xl font-heading font-bold text-typography-900">
                    {formatCurrency(report.weekly.revenue)}
                  </Text>
                  <HStack className="items-center gap-1">
                    <Text className="text-xs">{getGrowthIcon(weeklyGrowth)}</Text>
                    <Text className={`text-xs font-body ${getGrowthColor(weeklyGrowth)}`}>
                      {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}% vs minggu lalu
                    </Text>
                  </HStack>
                  <Text className="text-xs font-body text-typography-500 mt-1">
                    {formatNumber(report.weekly.count)} transaksi
                  </Text>
                </VStack>
              </Box>
            </View>
          </View>
        </VStack>

        {/* Today & Year Stats */}
        <VStack space="sm">
          <Text className="text-lg font-heading font-bold text-typography-900">Ringkasan</Text>
          <View style={{ gap: 10 }}>
            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Hari Ini</Text>
                  <Text className="text-lg font-heading font-bold text-typography-900">
                    {formatCurrency(report.daily.revenue)}
                  </Text>
                </VStack>
                <VStack space="xs" className="items-end">
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.daily.count)} transaksi
                  </Text>
                  {report.daily.count > 0 && (
                    <Text className="text-xs font-body text-typography-500">
                      Avg: {formatCurrency(report.daily.revenue / report.daily.count)}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Tahun Ini</Text>
                  <Text className="text-lg font-heading font-bold text-typography-900">
                    {formatCurrency(report.yearly.revenue)}
                  </Text>
                </VStack>
                <VStack space="xs" className="items-end">
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.yearly.count)} transaksi
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </View>
        </VStack>

        {/* Top Packages */}
        {report.topPackages.length > 0 && (
          <VStack space="sm">
            <Text className="text-lg font-heading font-bold text-typography-900">Paket Populer</Text>
            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <VStack space="sm">
                {report.topPackages.map((pkg, idx) => (
                  <View key={idx} className="pb-3" style={{ borderBottomWidth: idx < report.topPackages.length - 1 ? 1 : 0, borderBottomColor: '#e5e7eb' }}>
                    <HStack className="justify-between items-start">
                      <VStack space="xs" className="flex-1">
                        <HStack className="items-center gap-2">
                          <Text className="text-base font-heading font-bold text-typography-900">
                            #{idx + 1} {pkg.name}
                          </Text>
                        </HStack>
                        <Text className="text-sm font-body text-typography-600">
                          {formatNumber(pkg.count)} transaksi
                        </Text>
                      </VStack>
                      <VStack space="xs" className="items-end">
                        <Text className="text-base font-heading font-bold text-success-600">
                          {formatCurrency(pkg.revenue)}
                        </Text>
                        {pkg.count > 0 && (
                          <Text className="text-xs font-body text-typography-500">
                            Avg: {formatCurrency(pkg.revenue / pkg.count)}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </View>
                ))}
              </VStack>
            </Box>
          </VStack>
        )}

        {/* Period Stats - Collapsed */}
        <VStack space="sm">
          <Text className="text-lg font-heading font-bold text-typography-900">Periode Lainnya</Text>
          <View style={{ gap: 10 }}>
            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <Text className="text-sm font-body text-typography-700">7 Hari Terakhir</Text>
                <VStack space="xs" className="items-end">
                  <Text className="text-base font-heading font-semibold text-typography-900">
                    {formatCurrency(report.last7.revenue)}
                  </Text>
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.last7.count)} transaksi
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <Text className="text-sm font-body text-typography-700">30 Hari Terakhir</Text>
                <VStack space="xs" className="items-end">
                  <Text className="text-base font-heading font-semibold text-typography-900">
                    {formatCurrency(report.last30.revenue)}
                  </Text>
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.last30.count)} transaksi
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <Text className="text-sm font-body text-typography-700">365 Hari Terakhir</Text>
                <VStack space="xs" className="items-end">
                  <Text className="text-base font-heading font-semibold text-typography-900">
                    {formatCurrency(report.last365.revenue)}
                  </Text>
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.last365.count)} transaksi
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </View>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
