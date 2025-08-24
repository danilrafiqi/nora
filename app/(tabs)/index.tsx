import { db } from "@/services/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Linking, Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

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

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const dimension = useWindowDimensions()

  const [form, setForm] = useState({
    link: "",
    name: "",
    package: "",
    phone: "",
    total_spending: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ambil transaction
  const loadTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "transaction"));
    const items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setTransactions(items);
  };

  // ambil package
  const loadPackages = async () => {
    const querySnapshot = await getDocs(collection(db, "package"));
    const items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setPackages(items);
  };

  useEffect(() => {
    loadTransactions();
    loadPackages();
  }, []);

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
    });

    setForm({ link: "", name: "", package: "", phone: "", total_spending: "" });
    loadTransactions();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "transaction", deleteId));
    setDeleteId(null);
    loadTransactions();
  };

  const templates = [
    (item: any) => `Halo ${item.name}, 👋

Terima kasih sudah memilih Nora Self Photo Studio dan membeli paket ${item.package}. ✨
Total belanja Anda: Rp ${item.total_spending}.

Berikut link hasil foto Anda (tersedia 7 hari saja, jangan lupa download ya):  
${item.link}

Kami akan sangat senang jika Anda bisa berbagi pengalaman dengan memberikan review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa tag kami di Instagram 📸  
👉 https://instagram.com/norastudioid  

Semoga hasil fotonya berkesan. Ditunggu kedatangan Anda kembali di sesi foto berikutnya! 💕`,

    (item: any) => `Halo ${item.name},  
Terima kasih atas kepercayaan Anda memilih paket ${item.package}.  
Total transaksi: Rp ${item.total_spending}.  

Silakan download hasil foto Anda di link berikut (berlaku 7 hari):  
${item.link}  

Kami akan sangat menghargai jika Anda meninggalkan review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Jangan lupa juga mention Instagram kami:  
https://instagram.com/norastudioid  

Sampai jumpa pada sesi pemotretan berikutnya.`,

    (item: any) => `Hai ${item.name}! 🎉  
Seru banget tadi sesi fotonya dengan paket ${item.package}.  
Total spending kamu: Rp ${item.total_spending}.  

Hasil fotonya bisa kamu download di sini (ingat, cuma 7 hari ya ⏳):  
${item.link}  

Kalau suka hasilnya, kasih review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload di IG jangan lupa tag kami ya 😍  
👉 https://instagram.com/norastudioid  

Yuk, bikin sesi foto seru lagi bareng Nora Studio!`,

    (item: any) => `Halo ${item.name}, 💖  
Setiap momen punya cerita, dan hari ini cerita Anda sudah terabadikan dengan paket ${item.package}.  
Total belanja: Rp ${item.total_spending}.  

Download hasil fotonya di sini (tersedia 7 hari):  
${item.link}  

Akan sangat berarti bagi kami jika Anda bisa berbagi pengalaman lewat review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Tag juga Instagram kami agar bisa kami repost:  
https://instagram.com/norastudioid  

Semoga hasil foto ini selalu membawa senyum, dan kami tunggu untuk memotret cerita Anda berikutnya.`,

    (item: any) => `Halo ${item.name},  
Terima kasih telah memilih paket ${item.package} eksklusif dari Nora Self Photo Studio.  
Total transaksi: Rp ${item.total_spending}.  

Link download foto Anda (hanya aktif 7 hari):  
${item.link}  

Dukung kami dengan review bintang 5 di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Tag Instagram kami agar hasil foto Anda bisa tampil di feed eksklusif Nora Studio:  
👉 https://instagram.com/norastudioid  

Kami siap memberikan pengalaman yang lebih istimewa pada sesi foto berikutnya.`,

    (item: any) => `Yo ${item.name}! 😎  
Thanks banget udah ambil paket ${item.package}.  
Total spending: Rp ${item.total_spending}.  

Ini link download foto kamu (ingat, 7 hari doang bro):  
${item.link}  

Kalau puas, review di Google Maps dong ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload IG? Jangan lupa tag kami! 📸  
👉 https://instagram.com/norastudioid  

Next time foto lagi bareng, biar makin kece!`,

    (item: any) => `Halo ${item.name}, 👨‍👩‍👧‍👦  
Terima kasih sudah mempercayakan momen keluarga pada paket ${item.package}.  
Total belanja: Rp ${item.total_spending}.  

Download hasil foto keluarga Anda di sini (hanya 7 hari):  
${item.link}  

Kami senang sekali jika Anda bisa memberi review di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa tag Instagram kami supaya kenangan keluarga Anda bisa kami bagikan:  
https://instagram.com/norastudioid  

Kami tunggu momen berharga berikutnya untuk diabadikan bersama Anda.`,

    (item: any) => `Halo ${item.name},  
Terima kasih sudah menggunakan paket ${item.package} (Rp ${item.total_spending}).  

Link download (7 hari): ${item.link}  

Review: https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  
IG: https://instagram.com/norastudioid  

Sampai jumpa di sesi foto berikutnya!`,

    (item: any) => `Halo ${item.name}, 🎁  
Terima kasih sudah ambil paket ${item.package} (Rp ${item.total_spending}).  

Hasil foto bisa diunduh (7 hari):  
${item.link}  

Boleh dong kasih review di Google Maps ⭐  
👉 https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Upload IG jangan lupa tag kami ya 📸  
👉 https://instagram.com/norastudioid  

✨ Spesial untuk Anda, dapatkan diskon 10% untuk sesi foto berikutnya. Yuk booking lagi sebelum bulan ini berakhir!`,

    (item: any) => `Halo ${item.name}, 🌟  
Momen spesial Anda dengan paket ${item.package} sudah terabadikan.  
Total belanja: Rp ${item.total_spending}.  

Silakan unduh hasil foto (7 hari saja):  
${item.link}  

Jadikan pengalaman ini inspirasi untuk berbagi cerita di Google Maps:  
https://maps.app.goo.gl/ZpW1UPQQfN51ycpN9  

Dan jangan lupa, tag Instagram kami agar kenangan Anda bisa menginspirasi banyak orang:  
https://instagram.com/norastudioid  

Kami tunggu momen indah Anda berikutnya untuk diabadikan bersama Nora Studio.`
  ];

  const handleSendWhatsApp = (item: any) => {
    // Pilih template random
    const randomIndex = Math.floor(Math.random() * templates.length);
    const message = templates[randomIndex](item);

    const url = `https://wa.me/${item.phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };


  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Form */}
      <View style={{ marginBottom: 16, gap: 12 }}>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Link"
            value={form.link}
            onChangeText={(text) => handleChange("link", text)}
          />
        </Input>

        <Input variant="outline" size="md">
          <InputField
            placeholder="Name"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
          />
        </Input>

        {/* Select dari package */}
        <Select
          onValueChange={(val) => handleChange("package", val)}
          selectedValue={form.package}
        >
          <SelectTrigger variant="outline" size="md">
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

        <Input variant="outline" size="md">
          <InputField
            placeholder="Phone"
            value={form.phone}
            onChangeText={(text) => handleChange("phone", text)}
            keyboardType="phone-pad"
          />
        </Input>

        <Input variant="outline" size="md">
          <InputField
            placeholder="Total Spending"
            value={form.total_spending}
            onChangeText={(text) => handleChange("total_spending", text)}
            keyboardType="numeric"
          />
        </Input>

        <Button onPress={handleSubmit} action="primary" variant="solid">
          <ButtonText>Simpan</ButtonText>
        </Button>
      </View>
      <ScrollView>
        {/* Container tabel */}
        <View className="w-screen flex-1">
          {/* Scroll vertikal untuk body */}
          <ScrollView style={{ flex: 1 }}>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableData>{item.package}</TableData>
                    <TableData>{item.name}</TableData>
                    <TableData>{item.phone}</TableData>
                    <TableData>{item.link}</TableData>
                    <TableData>{item.total_spending}</TableData>
                    <TableData>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <Button
                          onPress={() => setDeleteId(item.id)}
                          action="negative"
                          variant="solid"
                        >
                          <ButtonText>Delete</ButtonText>
                        </Button>
                        <Button
                          onPress={() => handleSendWhatsApp(item)}
                          action="positive"
                          variant="solid"
                        >
                          <ButtonText>Kirim WA</ButtonText>
                        </Button>
                      </View>
                    </TableData>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollView>
        </View>
      </ScrollView>
      {/* Modal Hapus */}
      <Modal visible={!!deleteId} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Yakin mau hapus data ini?
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                onPress={() => setDeleteId(null)}
                action="secondary"
                variant="outline"
                className="flex-1"
              >
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button
                onPress={handleDelete}
                action="negative"
                variant="solid"
                className="flex-1"
              >
                <ButtonText>Hapus</ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
});
