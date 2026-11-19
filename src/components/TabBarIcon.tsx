import React from 'react';
import { House, Search, ScanSearch, User } from 'lucide-react-native';

const ICONS = { home: House, find: ScanSearch, search: Search, profile: User } as const;

export function TabBarIcon({ name, color, focused }: { name: keyof typeof ICONS; color: import('react-native').ColorValue; focused: boolean }) {
  const Icon = ICONS[name];
  return <Icon size={24} color={color as string} strokeWidth={focused ? 2.4 : 1.9} />;
}
