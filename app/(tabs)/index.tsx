import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface Transaction {
  id: string; // Firestore doc ID
  link: string;
  name: string;
  package: string;
  phone: string;
  total_spending: number;
}

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({
    link: "",
    name: "",
    package: "",
    phone: "",
    total_spending: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "transaction"));
      const items: Transaction[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Transaction, "id">),
      }));
      setTransactions(items);
    } catch (err) {
      console.error("Error ambil data:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.package || !form.phone || !form.total_spending) {
      alert("Semua field wajib diisi");
      return;
    }

    try {
      await addDoc(collection(db, "transaction"), {
        link: form.link,
        name: form.name,
        package: form.package,
        phone: form.phone,
        total_spending: Number(form.total_spending),
      });

      alert("Transaksi berhasil ditambahkan");
      setForm({
        link: "",
        name: "",
        package: "",
        phone: "",
        total_spending: "",
      });
      loadTransactions();
    } catch (err) {
      console.error("Error tambah data:", err);
      alert("Gagal menambahkan transaksi");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "transaction", deleteId));
      setDeleteId(null);
      loadTransactions();
    } catch (err) {
      console.error("Error hapus data:", err);
      alert("Gagal menghapus transaksi");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Form Input */}
      <View style={styles.form}>
        <TextInput
          placeholder="Link"
          value={form.link}
          onChangeText={(text) => handleChange("link", text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Name"
          value={form.name}
          onChangeText={(text) => handleChange("name", text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Package"
          value={form.package}
          onChangeText={(text) => handleChange("package", text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone"
          value={form.phone}
          onChangeText={(text) => handleChange("phone", text)}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Total Spending"
          value={form.total_spending}
          onChangeText={(text) => handleChange("total_spending", text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <Button title="Simpan" onPress={handleSubmit} />
      </View>

      {/* List Transaksi */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text>📦 Package: {item.package}</Text>
              <Text>👤 Name: {item.name}</Text>
              <Text>📞 Phone: {item.phone}</Text>
              <Text>🔗 Link: {item.link}</Text>
              <Text>💰 Total Spending: {item.total_spending}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setDeleteId(item.id)}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal Konfirmasi Hapus */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Yakin mau hapus data ini?
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setDeleteId(null)}
                style={[styles.btn, { backgroundColor: "gray" }]}
              >
                <Text style={{ color: "white" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.btn, { backgroundColor: "red" }]}
              >
                <Text style={{ color: "white" }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
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
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
