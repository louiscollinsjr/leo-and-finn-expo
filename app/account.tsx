import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ marginTop: 24, marginBottom: 8, marginHorizontal: 16, fontSize: 12, fontWeight: '600', color: '#6b7280' }}>
      {children}
    </Text>
  );
}

function ListItem({
  title,
  subtitle,
  icon,
  onPress,
  trailingChevron = true,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  trailingChevron?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
      })}
    >
      {icon ? (
        <MaterialIcons name={icon} size={22} color="#111827" style={{ marginRight: 12, opacity: 0.9 }} />
      ) : (
        <View style={{ width: 22, marginRight: 12 }} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: '#111827' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>{subtitle}</Text>
        ) : null}
      </View>

      {trailingChevron ? (
        <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
      ) : null}
    </Pressable>
  );
}

export default function AccountScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#f4f5f7' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            borderRadius: 14,
            backgroundColor: '#ffffff',
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                borderWidth: 1,
                borderColor: '#d1d5db',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialIcons name="person" size={26} color="#111827" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Louis Collins</Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>louiscollinsjr@verizon.net</Text>
            </View>
          </View>
        </View>

        {/* My Purchases */}
        <SectionHeader>MY PURCHASES</SectionHeader>
        <View style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Updates" icon="system-update" trailingChevron={false} />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Books" icon="book" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Audiobooks" icon="headset" />
        </View>

        {/* Family Purchases */}
        <SectionHeader>FAMILY PURCHASES</SectionHeader>
        <View style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Family Purchases" icon="group" />
        </View>

        {/* Other settings */}
        <View style={{ marginTop: 24, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Notifications" icon="notifications" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Manage Hidden Purchases" icon="visibility-off" subtitle="Unhide books you've hidden." trailingChevron={false} />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Redeem Gift Card or Code" icon="card-giftcard" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Account Settings" icon="settings" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
