import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";
import { normalizePhone } from "@/utils/phoneNormalizer";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { addDoc, collection, deleteDoc, doc, limit as fbLimit, getDocs, orderBy, query, startAfter } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, Modal, ScrollView, Text, View, Pressable } from "react-native";

// Gluestack Select
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

// Gluestack Input
import { Input, InputField } from "@/components/ui/input";

// Gluestack Table
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Gluestack Button
import { Button, ButtonText } from "@/components/ui/button";

type TransactionItem = {
  id: string;
  link: string;
  name: string;
  package: string;
  phone: string;
  total_spending: number;
  created_at: string;
};

type PackageItem = {
  id: string;
  name: string;
};

export default function TransactionScreen() {
  const router = useRouter();
  const { user, loading, role, signOut } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastVisible, setLastVisible] = useState<unknown | null>(null);
  const pageSize = 20;

  const [form, setForm] = useState({
    link: "",
    name: "",
    package: "",
    phone: "",
    total_spending: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // ambil transaction (paginated)
  const loadTransactions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "transaction"),
        orderBy("created_at", "desc"),
        fbLimit(pageSize)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const items = docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as TransactionItem[];
      setTransactions(items);
      setLastVisible(docs[docs.length - 1] || null);
      setHasMore(docs.length === pageSize);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (isLoading || !hasMore || !lastVisible) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "transaction"),
        orderBy("created_at", "desc"),
        startAfter(lastVisible),
        fbLimit(pageSize)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const items = docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as TransactionItem[];
      setTransactions((prev) => [...prev, ...items]);
      setLastVisible(docs[docs.length - 1] || null);
      setHasMore(docs.length === pageSize);
    } finally {
      setIsLoading(false);
    }
  };

  // ambil package
  const loadPackages = async () => {
    const querySnapshot = await getDocs(collection(db, "package"));
    const items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as PackageItem[];
    setPackages(items);
  };

  // Reload data setiap kali screen difokuskan (termasuk saat refresh)
  useFocusEffect(
    useCallback(() => {
      if (!loading && user) {
        // Reset pagination
        setLastVisible(null);
        setHasMore(true);
        setTransactions([]);
        // Load data
        loadTransactions();
        loadPackages();
      }
    }, [loading, user])
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.package || !form.phone || !form.total_spending) {
      alert("Semua field wajib diisi");
      return;
    }

    await addDoc(collection(db, "transaction"), {
      ...form,
      total_spending: Number(form.total_spending),
      created_at: new Date().toISOString(), // <<<< TAMBAH created_at
    });

    setForm({ link: "", name: "", package: "", phone: "", total_spending: "" });
    // reset pagination and reload first page
    setLastVisible(null);
    setHasMore(true);
    setTransactions([]);
    await loadTransactions();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "transaction", deleteId));
    setDeleteId(null);
    // reload from first page to ensure consistency
    setLastVisible(null);
    setHasMore(true);
    setTransactions([]);
    await loadTransactions();
  };

  type TransactionItem = {
    id: string;
    link: string;
    name: string;
    package: string;
    phone: string;
    total_spending: number;
    created_at: string;
  };

  const templates: ((item: TransactionItem) => string)[] = [
    (item) => `Halo ${item.name}, 👋

Terima kasih sudah memilih Nora Self Photo Studio dan membeli paket ${item.package}. ✨
Total belanja Anda: Rp ${item.total_spending}.

Berikut link hasil foto Anda (tersedia 7 hari saja, jangan lupa download ya):  
${item.link}

Kami akan sangat senang jika Anda bisa berbagi pengalaman dengan memberikan review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa tag kami di Instagram 📸  
👉 https://instagram.com/norastudioid  

Semoga hasil fotonya berkesan. Ditunggu kedatangan Anda kembali di sesi foto berikutnya! 💕`,

    (item) => `Halo ${item.name},  
Terima kasih atas kepercayaan Anda memilih paket ${item.package}.  
Total transaksi: Rp ${item.total_spending}.  

Silakan download hasil foto Anda di link berikut (berlaku 7 hari):  
${item.link}  

Kami akan sangat menghargai jika Anda meninggalkan review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Jangan lupa juga mention Instagram kami:  
https://instagram.com/norastudioid  

Sampai jumpa pada sesi pemotretan berikutnya.`,

    (item) => `Hai ${item.name}! 🎉  
Seru banget tadi sesi fotonya dengan paket ${item.package}.  
Total spending kamu: Rp ${item.total_spending}.  

Hasil fotonya bisa kamu download di sini (ingat, cuma 7 hari ya ⏳):  
${item.link}  

Kalau suka hasilnya, kasih review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload di IG jangan lupa tag kami ya 😍  
👉 https://instagram.com/norastudioid  

Yuk, bikin sesi foto seru lagi bareng Nora Studio!`,

    (item) => `Halo ${item.name}, 💖  
Setiap momen punya cerita, dan hari ini cerita Anda sudah terabadikan dengan paket ${item.package}.  
Total belanja: Rp ${item.total_spending}.  

Download hasil fotonya di sini (tersedia 7 hari):  
${item.link}  

Akan sangat berarti bagi kami jika Anda bisa berbagi pengalaman lewat review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Tag juga Instagram kami agar bisa kami repost:  
https://instagram.com/norastudioid  

Semoga hasil foto ini selalu membawa senyum, dan kami tunggu untuk memotret cerita Anda berikutnya.`,

    (item) => `Halo ${item.name},  
Terima kasih telah memilih paket ${item.package} eksklusif dari Nora Self Photo Studio.  
Total transaksi: Rp ${item.total_spending}.  

Link download foto Anda (hanya aktif 7 hari):  
${item.link}  

Dukung kami dengan review bintang 5 di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Tag Instagram kami agar hasil foto Anda bisa tampil di feed eksklusif Nora Studio:  
👉 https://instagram.com/norastudioid  

Kami siap memberikan pengalaman yang lebih istimewa pada sesi foto berikutnya.`,

    (item) => `Yo ${item.name}! 😎  
Thanks banget udah ambil paket ${item.package}.  
Total spending: Rp ${item.total_spending}.  

Ini link download foto kamu (ingat, 7 hari doang bro):  
${item.link}  

Kalau puas, review di Google Maps dong ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload IG? Jangan lupa tag kami! 📸  
👉 https://instagram.com/norastudioid  

Next time foto lagi bareng, biar makin kece!`,

    (item) => `Halo ${item.name}, 👨‍👩‍👧‍👦  
Terima kasih sudah mempercayakan momen keluarga pada paket ${item.package}.  
Total belanja: Rp ${item.total_spending}.  

Download hasil foto keluarga Anda di sini (hanya 7 hari):  
${item.link}  

Kami senang sekali jika Anda bisa memberi review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa tag Instagram kami supaya kenangan keluarga Anda bisa kami bagikan:  
https://instagram.com/norastudioid  

Kami tunggu momen berharga berikutnya untuk diabadikan bersama Anda.`,

    (item) => `Halo ${item.name},  
Terima kasih sudah menggunakan paket ${item.package} (Rp ${item.total_spending}).  

Link download (7 hari): ${item.link}  

Review: https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  
IG: https://instagram.com/norastudioid  

Sampai jumpa di sesi foto berikutnya!`,

    (item) => `Halo ${item.name}, 🎁  
Terima kasih sudah ambil paket ${item.package} (Rp ${item.total_spending}).  

Hasil foto bisa diunduh (7 hari):  
${item.link}  

Boleh dong kasih review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload IG jangan lupa tag kami ya 📸  
👉 https://instagram.com/norastudioid  

✨ Spesial untuk Anda, dapatkan diskon 10% untuk sesi foto berikutnya. Yuk booking lagi sebelum bulan ini berakhir!`,

    (item) => `Halo ${item.name}, 🌟  
Momen spesial Anda dengan paket ${item.package} sudah terabadikan.  
Total belanja: Rp ${item.total_spending}.  

Silakan unduh hasil foto (7 hari saja):  
${item.link}  

Jadikan pengalaman ini inspirasi untuk berbagi cerita di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa, tag Instagram kami agar kenangan Anda bisa menginspirasi banyak orang:  
https://instagram.com/norastudioid  

Kami tunggu momen indah Anda berikutnya untuk diabadikan bersama Nora Studio.`,
  ];

  const getPhotosUrl = (phone: string): string => {
    const normalized = normalizePhone(phone);
    const baseUrl = 'https://nora.daridasar.com';
    return `${baseUrl}/photos/${normalized}`;
  };

  const handleSendWhatsApp = (item: TransactionItem) => {
    // Generate link photos page
    const photosUrl = getPhotosUrl(item.phone);

    // Pilih template random
    const randomIndex = Math.floor(Math.random() * templates.length);
    let message = templates[randomIndex](item);

    // Replace item.link dengan photosUrl
    message = message.replace(item.link, photosUrl);

    const url = `https://wa.me/${item.phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-bg-muted p-4">
      {/* Header actions */}
      <View className="mb-3 flex-row gap-3">
        <Pressable
          onPress={() => setIsFormOpen(true)}
          className="flex-1 bg-accent-orange px-4 py-3 rounded shadow-medium active:bg-accent-orangeDark"
        >
          <Text className="text-white font-body font-semibold text-center">Tambah Transaksi</Text>
        </Pressable>
        <Pressable
          onPress={signOut}
          className="border border-outline-300 bg-white px-4 py-3 rounded active:bg-outline-100"
        >
          <Text className="font-body text-center text-typography-700">Logout</Text>
        </Pressable>
      </View>
      <ScrollView>
        {/* Container tabel */}
        <View className="w-screen flex-1">
          {/* Scroll vertikal untuk body */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ width: '100%' }}
            >
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {transactions.map((item) => (
                    <TableRow key={item.id}>
                      <TableData>{item.name.slice(0, 12)}</TableData>
                      <TableData>{item.phone}</TableData>
                      <TableData>{item.package}</TableData>
                      <TableData>{item.link}</TableData>
                      <TableData>{item.total_spending}</TableData>
                      <TableData>
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          {(role === 'super_admin' || role === 'admin') && (
                            <Pressable
                              onPress={() => setDeleteId(item.id)}
                              className="bg-error-500 px-3 py-1.5 rounded shadow-sm active:bg-error-600"
                            >
                              <Text className="font-body text-xs text-white">Delete</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => handleSendWhatsApp(item)}
                            className="bg-accent-orange px-3 py-1.5 rounded shadow-medium active:bg-accent-orangeDark"
                          >
                            <Text className="font-body font-semibold text-xs text-white">Kirim WA</Text>
                          </Pressable>
                        </View>
                      </TableData>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Load more control under the table to keep UI intact */}
              <View className="py-3">
                {hasMore ? (
                  <Pressable
                    onPress={loadMoreTransactions}
                    disabled={isLoading}
                    className="border border-outline-300 bg-white px-4 py-2.5 rounded active:bg-outline-100 disabled:opacity-50"
                  >
                    <Text className="font-body text-center text-typography-700">
                      {isLoading ? "Loading..." : "Load More"}
                    </Text>
                  </Pressable>
                ) : (
                  transactions.length > 0 ? (
                    <Text className="text-center font-body text-typography-600">Semua data sudah ditampilkan</Text>
                  ) : null
                )}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </ScrollView>
      {/* Modal Hapus */}
      <Modal visible={!!deleteId} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-lg w-4/5 items-center shadow-lg">
            <Text className="text-base font-body text-typography-900 mb-5">
              Yakin mau hapus data ini?
            </Text>
            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => setDeleteId(null)}
                className="flex-1 border border-outline-300 bg-white px-4 py-2.5 rounded active:bg-outline-100"
              >
                <Text className="font-body text-center text-typography-700">Batal</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                className="flex-1 bg-error-500 px-4 py-2.5 rounded shadow-sm active:bg-error-600"
              >
                <Text className="font-body font-semibold text-center text-white">Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Form Transaksi */}
      <Modal visible={isFormOpen} transparent animationType="slide" onRequestClose={() => setIsFormOpen(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-lg w-4/5 items-center shadow-lg">
            <Text className="text-lg font-heading font-bold text-typography-900 mb-3">
              Tambah Transaksi
            </Text>
            <View className="w-full gap-3">
              <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
                <InputField
                  placeholder="Link"
                  value={form.link}
                  onChangeText={(text) => handleChange("link", text)}
                  className="font-body"
                />
              </Input>
              <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
                <InputField
                  placeholder="Name"
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                  className="font-body"
                />
              </Input>
              <Select
                onValueChange={(val) => handleChange("package", val)}
                selectedValue={form.package}
              >
                <SelectTrigger variant="outline" size="md" className="rounded border-outline-300">
                  <SelectInput placeholder="Pilih Package" />
                  <SelectIcon as={ChevronDownIcon} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} label={pkg.name} value={pkg.name} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
                <InputField
                  placeholder="Phone"
                  value={form.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  keyboardType="phone-pad"
                  className="font-body"
                />
              </Input>
              <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
                <InputField
                  placeholder="Total Spending"
                  value={form.total_spending}
                  onChangeText={(text) => handleChange("total_spending", text)}
                  keyboardType="numeric"
                  className="font-body"
                />
              </Input>
              <View className="flex-row gap-3 mt-1">
                <Pressable
                  onPress={() => setIsFormOpen(false)}
                  className="flex-1 border border-outline-300 bg-white px-4 py-2.5 rounded active:bg-outline-100"
                >
                  <Text className="font-body text-center text-typography-700">Batal</Text>
                </Pressable>
                <Pressable
                  onPress={async () => { await handleSubmit(); setIsFormOpen(false); }}
                  className="flex-1 bg-accent-orange px-4 py-2.5 rounded shadow-medium active:bg-accent-orangeDark"
                >
                  <Text className="font-body font-semibold text-center text-white">Simpan</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
