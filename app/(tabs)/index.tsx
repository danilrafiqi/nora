import { db } from "@/services/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

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

      {/* Table Transaksi */}
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
                <Button onPress={() => setDeleteId(item.id)} action="negative" variant="solid">
                  <ButtonText>Delete</ButtonText>
                </Button>
              </TableData>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
