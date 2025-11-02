/**
 * Packages Page - Bitcoin Energy Style
 */

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
        <Text className="text-xl font-heading font-bold text-typography-900">Packages</Text>
        <Button
          onPress={openCreate}
          action="primary"
          variant="solid"
          size="md"
          className="bg-accent-orange data-[hover=true]:bg-accent-orangeDark data-[active=true]:bg-accent-orangeDark shadow-medium"
        >
          <ButtonText className="text-white">Tambah Paket</ButtonText>
        </Button>

        <View style={{ gap: 10 }}>
          {items.map((pkg) => (
            <View key={pkg.id} className="bg-white p-4 rounded-lg border border-outline-200 shadow-medium">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text className="font-heading font-semibold text-typography-900">{pkg.name}</Text>
                  <Text className="font-body text-typography-600">Rp {pkg.price.toLocaleString('id-ID')}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    onPress={() => openEdit(pkg)}
                    action="secondary"
                    variant="outline"
                    size="sm"
                  >
                    <ButtonText className="text-xs">Edit</ButtonText>
                  </Button>
                  <Button
                    onPress={() => remove(pkg.id)}
                    action="negative"
                    variant="solid"
                    size="sm"
                  >
                    <ButtonText className="text-xs text-white">Hapus</ButtonText>
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-lg w-[90%] shadow-lg" style={{ gap: 10 }}>
            <Text className="text-lg font-heading font-bold text-typography-900">
              {editId ? 'Edit Paket' : 'Tambah Paket'}
            </Text>
            <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
              <InputField
                placeholder="Nama paket"
                value={name}
                onChangeText={setName}
                className="font-body"
              />
            </Input>
            <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
              <InputField
                placeholder="Harga"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                className="font-body"
              />
            </Input>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                onPress={() => { setIsOpen(false); resetForm(); }}
                action="secondary"
                variant="outline"
                size="md"
                className="flex-1"
              >
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button
                onPress={save}
                disabled={!isValid}
                action="primary"
                variant="solid"
                size="md"
                className={`flex-1 shadow-medium ${isValid ? 'bg-accent-orange data-[hover=true]:bg-accent-orangeDark data-[active=true]:bg-accent-orangeDark' : ''}`}
              >
                <ButtonText className="text-white">Simpan</ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
