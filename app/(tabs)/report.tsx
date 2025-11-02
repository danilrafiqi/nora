import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

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
  const [report, setReport] = useState<any>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    last7: 0,
    last30: 0,
    last365: 0,
  });

  // ambil data transaksi dari firestore
  const loadTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "transaction"));
    const items: Transaction[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    setTransactions(items);
  };

  const calculateReports = (items: Transaction[], timezone = 'Asia/Jakarta') => {
    // Dapatkan tanggal saat ini dalam UTC
    const now = new Date();
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

    let daily = 0,
      weekly = 0,
      monthly = 0,
      yearly = 0,
      last7 = 0,
      last30 = 0,
      last365 = 0,
      all = 0;

    items.forEach((t) => {
      const d = new Date(t.created_at); // Ini sudah UTC
      const spend = Number(t.total_spending) || 0;

      all += spend;

      // Bandingkan dalam UTC
      if (isSameDay(d, nowUTC)) daily += spend;
      if (isSameWeek(d, nowUTC, { weekStartsOn: 1 })) weekly += spend;
      if (isSameMonth(d, nowUTC)) monthly += spend;
      if (isSameYear(d, nowUTC)) yearly += spend;

      const diffDays = differenceInDays(nowUTC, d);
      if (diffDays <= 7) last7 += spend;
      if (diffDays <= 30) last30 += spend;
      if (diffDays <= 365) last365 += spend;
    });

    setReport({ daily, weekly, monthly, yearly, last7, last30, last365, all });
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

  const reportCards = [
    { title: "Hari ini", value: report.daily },
    { title: "Minggu ini", value: report.weekly },
    { title: "Bulan ini", value: report.monthly },
    { title: "Tahun ini", value: report.yearly },
    { title: "7 Hari Terakhir", value: report.last7 },
    { title: "30 Hari Terakhir", value: report.last30 },
    { title: "365 Hari Terakhir", value: report.last365 },
    { title: "Total Keseluruhan", value: report.all }, // 🔹 tambahan
  ];

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack space="md" className="p-4">
        {/* Report Cards */}
        {reportCards.map((card, idx) => (
          <Box
            key={idx}
            className="bg-background-100 p-4 rounded-lg border border-outline-200 shadow-medium"
          >
            <HStack className="justify-between items-center">
              <Text className="text-lg font-heading font-bold text-typography-900">{card.title}</Text>
              <Text className="text-lg font-body text-success-600 font-semibold">
                {formatCurrency(card.value)}
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </ScrollView>
  );
}
