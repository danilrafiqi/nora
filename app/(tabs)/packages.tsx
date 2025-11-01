import { db } from "@/services/firebase";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, View } from "react-native";

type PackageDoc = {
  id: string;
  name: string;
  price: number;
};

export default function PackagesPage() {
  const [items, setItems] = useState<PackageDoc[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const isValid = useMemo(() => !!name.trim() && !!price && !isNaN(Number(price)), [name, price]);

  const load = async () => {
    const q = query(collection(db, 'package'), orderBy('name'));
    const snap = await getDocs(q);
    const list: PackageDoc[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    setItems(list);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPrice("");
  };

  const openCreate = () => { resetForm(); setIsOpen(true); };
  const openEdit = (pkg: PackageDoc) => { setEditId(pkg.id); setName(pkg.name); setPrice(String(pkg.price)); setIsOpen(true); };

  const save = async () => {
    if (!isValid) return;
    const payload = { name: name.trim(), price: Number(price) };
    if (editId) {
      await updateDoc(doc(db, 'package', editId), payload);
    } else {
      await addDoc(collection(db, 'package'), payload);
    }
    setIsOpen(false);
    resetForm();
    await load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'package', id));
    await load();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text className="text-xl font-bold">Packages</Text>
        <Button onPress={openCreate} action="primary" variant="solid">
          <ButtonText>Tambah Paket</ButtonText>
        </Button>

        <View style={{ gap: 10 }}>
          {items.map((pkg) => (
            <View key={pkg.id} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, gap: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text className="font-semibold">{pkg.name}</Text>
                <Text>Rp {pkg.price.toLocaleString('id-ID')}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button onPress={() => openEdit(pkg)} action="secondary" variant="outline">
                  <ButtonText>Edit</ButtonText>
                </Button>
                <Button onPress={() => remove(pkg.id)} action="negative" variant="solid">
                  <ButtonText>Hapus</ButtonText>
                </Button>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%', gap: 10 }}>
            <Text className="text-lg font-bold">{editId ? 'Edit Paket' : 'Tambah Paket'}</Text>
            <Input variant="outline" size="md">
              <InputField placeholder="Nama paket" value={name} onChangeText={setName} />
            </Input>
            <Input variant="outline" size="md">
              <InputField placeholder="Harga" value={price} onChangeText={setPrice} keyboardType="numeric" />
            </Input>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button onPress={() => { setIsOpen(false); resetForm(); }} action="secondary" variant="outline" className="flex-1">
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button onPress={save} action="primary" variant="solid" className="flex-1" disabled={!isValid}>
                <ButtonText>Simpan</ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


