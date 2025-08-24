import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "react-native";

export default function ReportPage() {
  const reports = [
    { title: "Hari ini", value: "Rp 1.200.000" },
    { title: "Minggu ini", value: "Rp 8.750.000" },
    { title: "Bulan ini", value: "Rp 32.400.000" },
    { title: "Tahun ini", value: "Rp 287.000.000" },
    { title: "7 Hari Terakhir", value: "Rp 6.950.000" },
    { title: "30 Hari Terakhir", value: "Rp 27.800.000" },
    { title: "365 Hari Terakhir", value: "Rp 320.000.000" },
  ];

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack space="md" className="p-4">
        {reports.map((report, idx) => (
          <Box
            key={idx}
            className="bg-background-100 p-4 rounded-xl shadow-sm"
          >
            <HStack className="justify-between items-center">
              <Text className="text-lg font-bold">{report.title}</Text>
              <Text className="text-lg text-success-600 font-semibold">
                {report.value}
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </ScrollView>
  );
}
