import { Input, InputField } from "@/components/ui/input";
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: "none" | "admin" | "super_admin";
};

export default function UsersPage() {
  const { role, user: currentUser } = useAuth();
  const canEdit = role === 'super_admin';
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email'));
    const unsub = onSnapshot(q, (snap) => {
      const list: UserDoc[] = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return users.filter(u => (u.email ?? '').toLowerCase().includes(f) || (u.displayName ?? '').toLowerCase().includes(f));
  }, [users, filter]);

  const hasSuperAdmin = useMemo(() => {
    return users.some(u => u.role === 'super_admin');
  }, [users]);

  const updateRole = async (uid: string, newRole: UserDoc['role']) => {
    await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text className="text-xl font-heading font-bold text-typography-900">Manage Users</Text>

        {!hasSuperAdmin && (
          <View className="bg-warning-100 border border-warning-300 rounded-lg p-4 shadow-sm">
            <Text className="font-heading font-semibold text-warning-800 mb-1">⚠️ Belum ada Super Admin</Text>
            <Text className="font-body text-warning-700 text-sm">
              Untuk set Super Admin pertama kali, buka Firestore Console dan tambahkan field role: &apos;super_admin&apos; pada document user Anda di collection &quot;users&quot;.
            </Text>
          </View>
        )}

        {!canEdit && (
          <View className="bg-background-100 border border-outline-300 rounded-lg p-4 shadow-sm">
            <Text className="font-body text-typography-700 text-sm">
              Anda tidak memiliki akses untuk mengubah role. Hanya Super Admin yang bisa mengelola role user.
            </Text>
          </View>
        )}

        <Input variant="outline" size="md" className="bg-white rounded border-outline-300">
          <InputField placeholder="Cari email/nama" value={filter} onChangeText={setFilter} className="font-body" />
        </Input>
        <View style={{ gap: 10 }}>
          {filtered.map((u) => (
            <View key={u.uid} className="bg-white border border-outline-200 rounded-lg p-4 shadow-medium" style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text className="font-heading font-semibold text-typography-900">{u.displayName || '-'} ({u.email || '-'})</Text>
                {u.uid === currentUser?.uid && (
                  <Text className="text-xs font-body bg-info-100 text-info-800 px-2 py-1 rounded">Anda</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text className="font-body text-typography-700">Role:</Text>
                <Select selectedValue={u.role ?? 'none'} onValueChange={(val) => canEdit ? updateRole(u.uid, val as any) : null}>
                  <SelectTrigger variant="outline" size="md" className="rounded border-outline-300">
                    <SelectInput placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="None" value="none" />
                      <SelectItem label="Admin" value="admin" />
                      <SelectItem label="Super Admin" value="super_admin" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
                {!canEdit && <Text className="font-body text-typography-500">(readonly)</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}


