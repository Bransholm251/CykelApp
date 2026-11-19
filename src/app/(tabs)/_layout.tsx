import React from 'react';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/theme';
import { TabBarIcon } from '@/components/TabBarIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, minHeight: 60 },
        tabBarItemStyle: { minHeight: 44 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hjem', tabBarIcon: (p) => <TabBarIcon name="home" {...p} /> }} />
      <Tabs.Screen name="find" options={{ title: 'Find problem', tabBarIcon: (p) => <TabBarIcon name="find" {...p} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Søg', tabBarIcon: (p) => <TabBarIcon name="search" {...p} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: (p) => <TabBarIcon name="profile" {...p} /> }} />
    </Tabs>
  );
}
