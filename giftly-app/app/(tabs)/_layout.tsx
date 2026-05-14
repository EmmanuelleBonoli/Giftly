import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';

/**
 * Layout principal avec navigation par onglets.
 * La bannière AdMob sera injectée en étape 10.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarLabel: 'Accueil' }} />
      <Tabs.Screen name="events" options={{ title: 'Nouveau', tabBarLabel: '+' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
    </Tabs>
  );
}
