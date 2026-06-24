import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";
import { exportMonthlyReportPdf } from "@/utils/reportPdf";
import {
  MONTH_OPTIONS,
  buildMonthlyReport,
  formatCurrency,
  formatNumber,
  formatTransactionDate,
  getAvailableReportYears,
  type TransactionRecord,
} from "@/utils/reporting";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

// Gluestack
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { ChevronDownIcon } from "@/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function ReportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const now = new Date();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const reportQuery = query(collection(db, "transaction"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(reportQuery);
      const items: TransactionRecord[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TransactionRecord[];
      setTransactions(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!loading && user) {
      loadTransactions();
    }
  }, [loading, router, user]);

  const availableYears = useMemo(() => getAvailableReportYears(transactions), [transactions]);
  const report = useMemo(() => {
    return buildMonthlyReport(transactions, Number(selectedYear), Number(selectedMonth));
  }, [transactions, selectedMonth, selectedYear]);

  const handleExportPdf = async () => {
    if (report.transactions.length === 0) {
      Alert.alert("Tidak ada data", "Belum ada transaksi pada bulan yang dipilih.");
      return;
    }

    try {
      setIsExporting(true);
      await exportMonthlyReportPdf(report);
      if (typeof document === "undefined") {
        Alert.alert("Berhasil", "Report PDF berhasil disiapkan.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuat report PDF";
      Alert.alert("Error", message);
    } finally {
      setIsExporting(false);
    }
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

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack space="lg" className="p-4">
        <VStack space="md">
          <Text className="text-2xl font-heading font-bold text-typography-900">Report Bulanan</Text>
          <Text className="text-sm font-body text-typography-600">
            Pilih bulan dan tahun untuk melihat ringkasan transaksi lalu export PDF.
          </Text>
        </VStack>

        <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
          <VStack space="md">
            <Text className="text-base font-heading font-bold text-typography-900">Filter Periode</Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Select selectedValue={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger variant="outline" size="md" className="rounded border-outline-300 bg-white">
                      <SelectInput placeholder="Pilih Bulan" />
                      <SelectIcon as={ChevronDownIcon} className="mr-3" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {MONTH_OPTIONS.map((month) => (
                          <SelectItem
                            key={month.value}
                            label={month.label}
                            value={month.value.toString()}
                          />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </View>

                <View style={{ flex: 1 }}>
                  <Select selectedValue={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger variant="outline" size="md" className="rounded border-outline-300 bg-white">
                      <SelectInput placeholder="Pilih Tahun" />
                      <SelectIcon as={ChevronDownIcon} className="mr-3" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {availableYears.map((year) => (
                          <SelectItem key={year} label={year.toString()} value={year.toString()} />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </View>
              </View>

              <Button
                onPress={handleExportPdf}
                disabled={isExporting || report.transactions.length === 0}
                action="primary"
                variant="solid"
                size="md"
                className="bg-accent-orange data-[hover=true]:bg-accent-orangeDark data-[active=true]:bg-accent-orangeDark shadow-medium"
              >
                <ButtonText className="text-white">
                  {isExporting ? "Menyiapkan PDF..." : `Export PDF ${report.monthLabel}`}
                </ButtonText>
              </Button>
            </View>
          </VStack>
        </Box>

        <VStack space="sm">
          <Text className="text-lg font-heading font-bold text-typography-900">
            Ringkasan {report.monthLabel}
          </Text>
          <View style={{ gap: 10 }}>
            <Box className="bg-accent-orange/10 p-6 rounded-lg border-2 border-accent-orange shadow-medium">
              <VStack space="sm">
                <Text className="text-sm font-body text-typography-600">Total Revenue</Text>
                <Text className="text-3xl font-heading font-bold text-accent-orange">
                  {formatCurrency(report.summary.revenue)}
                </Text>
                <HStack className="items-center gap-2 mt-1">
                  <Text className="text-xs font-body text-typography-500">
                    {formatNumber(report.summary.count)} transaksi
                  </Text>
                  <Text className="text-xs font-body text-typography-500">•</Text>
                  <Text className="text-xs font-body text-typography-500">
                    Avg: {formatCurrency(report.summary.avgTransaction)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Box className="flex-1 bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Bulan Dipilih</Text>
                  <Text className="text-xl font-heading font-bold text-typography-900">
                    {formatCurrency(report.summary.revenue)}
                  </Text>
                  <Text className="text-xs font-body text-typography-500 mt-1">
                    {formatNumber(report.summary.count)} transaksi
                  </Text>
                </VStack>
              </Box>

              <Box className="flex-1 bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Bulan Sebelumnya</Text>
                  <Text className="text-xl font-heading font-bold text-typography-900">
                    {formatCurrency(report.previousMonth.revenue)}
                  </Text>
                  <Text className="text-xs font-body text-typography-500 mt-1">
                    {formatNumber(report.previousMonth.count)} transaksi
                  </Text>
                </VStack>
              </Box>
            </View>

            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <HStack className="justify-between items-center">
                <VStack space="xs">
                  <Text className="text-sm font-body text-typography-600">Growth Omzet</Text>
                  <Text className="text-lg font-heading font-bold text-typography-900">
                    {report.monthlyGrowth > 0 ? "+" : ""}
                    {report.monthlyGrowth.toFixed(1)}%
                  </Text>
                </VStack>
                <Text className="text-xs font-body text-typography-500">
                  Dibanding bulan sebelumnya
                </Text>
              </HStack>
            </Box>
          </View>
        </VStack>

        {report.summary.topPackages.length > 0 && (
          <VStack space="sm">
            <Text className="text-lg font-heading font-bold text-typography-900">Paket Populer</Text>
            <Box className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium">
              <VStack space="sm">
                {report.summary.topPackages.map((pkg, idx) => (
                  <View
                    key={`${pkg.name}-${idx}`}
                    className="pb-3"
                    style={{
                      borderBottomWidth: idx < report.summary.topPackages.length - 1 ? 1 : 0,
                      borderBottomColor: "#e5e7eb",
                    }}
                  >
                    <HStack className="justify-between items-start">
                      <VStack space="xs" className="flex-1">
                        <Text className="text-base font-heading font-bold text-typography-900">
                          #{idx + 1} {pkg.name}
                        </Text>
                        <Text className="text-sm font-body text-typography-600">
                          {formatNumber(pkg.count)} transaksi
                        </Text>
                      </VStack>
                      <VStack space="xs" className="items-end">
                        <Text className="text-base font-heading font-bold text-success-600">
                          {formatCurrency(pkg.revenue)}
                        </Text>
                        <Text className="text-xs font-body text-typography-500">
                          Avg: {formatCurrency(pkg.revenue / pkg.count)}
                        </Text>
                      </VStack>
                    </HStack>
                  </View>
                ))}
              </VStack>
            </Box>
          </VStack>
        )}

        <VStack space="sm">
          <HStack className="justify-between items-center">
            <Text className="text-lg font-heading font-bold text-typography-900">
              Daftar Transaksi
            </Text>
            <Text className="text-sm font-body text-typography-500">
              {formatNumber(report.transactions.length)} item
            </Text>
          </HStack>

          {report.transactions.length === 0 ? (
            <Box className="bg-background-100 p-6 rounded-lg border border-outline-200 shadow-medium">
              <Text className="text-sm font-body text-typography-500">
                Belum ada transaksi untuk {report.monthLabel}.
              </Text>
            </Box>
          ) : (
            <VStack space="sm">
              {report.transactions.map((transaction) => (
                <Box
                  key={transaction.id}
                  className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium"
                >
                  <HStack className="justify-between items-start">
                    <VStack space="xs" className="flex-1">
                      <Text className="text-base font-heading font-bold text-typography-900">
                        {transaction.name}
                      </Text>
                      <Text className="text-sm font-body text-typography-600">
                        {transaction.package}
                      </Text>
                      <Text className="text-xs font-body text-typography-500">
                        {transaction.phone}
                      </Text>
                    </VStack>

                    <VStack space="xs" className="items-end">
                      <Text className="text-base font-heading font-bold text-success-600">
                        {formatCurrency(transaction.total_spending)}
                      </Text>
                      <Text className="text-xs font-body text-typography-500">
                        {formatTransactionDate(transaction.created_at)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
