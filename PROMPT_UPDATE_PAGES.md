# Prompt untuk Update Admin Pages

Update semua halaman admin berikut dengan Bitcoin Energy style yang konsisten dengan design system yang sudah dibuat:

## Pages yang Perlu Diupdate:
1. `app/(tabs)/booth-event.tsx`
2. `app/(tabs)/packages.tsx`
3. `app/(tabs)/qrcode.tsx`
4. `app/(tabs)/report.tsx`
5. `app/(tabs)/users.tsx`

## Design System Rules (KONSISTEN dengan pages yang sudah diupdate):

### Button Pattern
- **Ganti semua `Button` component jadi `Pressable`** dengan styling manual
- **Primary Button**: 
  ```tsx
  <Pressable
    onPress={handleAction}
    className="bg-accent-orange px-4 py-3 rounded shadow-medium active:bg-accent-orangeDark"
  >
    <Text className="text-white font-body font-semibold text-center">Action</Text>
  </Pressable>
  ```

- **Secondary Button**:
  ```tsx
  <Pressable
    onPress={handleCancel}
    className="border border-outline-300 bg-white px-4 py-3 rounded active:bg-outline-100"
  >
    <Text className="font-body text-center text-typography-700">Cancel</Text>
  </Pressable>
  ```

- **Error/Delete Button**:
  ```tsx
  <Pressable
    onPress={handleDelete}
    className="bg-error-500 px-3 py-1.5 rounded shadow-sm active:bg-error-600"
  >
    <Text className="font-body text-xs text-white">Delete</Text>
  </Pressable>
  ```

### Border Radius
- Buttons: `rounded` (6px) - **MINIMAL, jangan rounded-xl atau rounded-full**
- Cards: `rounded-lg` (8px)
- Inputs: `rounded` (6px)
- Modals: `rounded-lg` (8px)

### Cards
```tsx
<View className="bg-white p-4 rounded-lg border border-outline-200 shadow-medium">
  {/* Content */}
</View>
```

### Inputs
```tsx
<Input variant="outline" size="md" className="bg-white rounded border-outline-300">
  <InputField className="font-body" />
</Input>
```

### Modals
```tsx
<Modal visible={isOpen} transparent>
  <View className="flex-1 bg-black/50 justify-center items-center">
    <View className="bg-white p-5 rounded-lg w-[90%] shadow-lg">
      {/* Content */}
    </View>
  </View>
</Modal>
```

## Requirements:
1. ❌ **TIDAK pakai `Button` component** - ganti semua jadi `Pressable`
2. ❌ **TIDAK ada grey hover** - semua hover harus orange (`active:bg-accent-orangeDark`) atau subtle outline
3. ✅ **Border radius MINIMAL** - `rounded` atau `rounded-lg`, jangan terlalu rounded
4. ✅ **Consistent colors**: Orange untuk primary, error-500 untuk delete, outline-300 untuk borders
5. ✅ **Typography**: `font-heading` untuk titles, `font-body` untuk text
6. ✅ **Shadows**: `shadow-medium` untuk cards/buttons, `shadow-lg` untuk modals

## Referensi Pages yang Sudah Benar:
- ✅ `app/(tabs)/transaction.tsx` - sudah diupdate dengan style yang benar
- ✅ `app/index.tsx` - homepage dengan button pattern yang benar
- ✅ `app/login.tsx` - login page dengan button pattern yang benar

## Checklist per Page:

### booth-event.tsx
- [ ] Ganti Button jadi Pressable dengan orange hover
- [ ] Border radius jadi `rounded` bukan `rounded-xl`
- [ ] Import `Pressable` dari react-native

### packages.tsx
- [ ] Ganti semua Button jadi Pressable
- [ ] Update card styling jadi `rounded-lg` dengan border dan shadow
- [ ] Update modal jadi `rounded-lg`
- [ ] Input styling dengan `rounded border-outline-300`

### qrcode.tsx
- [ ] Ganti Button jadi Pressable
- [ ] QR code container dengan `rounded-lg` minimal
- [ ] Buttons dengan orange hover

### report.tsx
- [ ] Update report cards jadi `rounded-lg` dengan border dan shadow-medium
- [ ] Typography konsisten (font-heading untuk title, font-body untuk value)

### users.tsx
- [ ] Ganti semua Button jadi Pressable (jika ada)
- [ ] Update user cards jadi `rounded-lg` dengan border
- [ ] Input dan Select dengan `rounded border-outline-300`
- [ ] Alert boxes dengan border radius minimal

## Output:
Update semua 5 files dengan style yang konsisten. Pastikan semua button menggunakan `Pressable` dengan orange hover, border radius minimal, dan styling yang match dengan pages yang sudah diupdate.

