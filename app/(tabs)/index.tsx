import { db } from "@/services/firebase";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
export interface Transaction {
  id: string; // Firestore doc ID
  link: string;
  name: string;
  package: string;
  phone: string;
  total_spending: number;
}
export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const querySnapshot = await getDocs(collection(db, "transaction"));
        const items: Transaction[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">), // cast aman ke tipe Transaction
        }));
        setTransactions(items);
      } catch (err) {
        console.error("Error ambil data:", err);
      }
    }

    loadTransactions();
  }, []);

  if (transactions.length === 0) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text>📦 Package: {item.package}</Text>
          <Text>👤 Name: {item.name}</Text>
          <Text>📞 Phone: {item.phone}</Text>
          <Text>🔗 Link: {item.link}</Text>
          <Text>💰 Total Spending: {item.total_spending}</Text>
        </View>
      )}
    />
  );
}
