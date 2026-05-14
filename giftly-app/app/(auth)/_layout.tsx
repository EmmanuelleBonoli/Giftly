import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

/** Layout du groupe d'écrans d'authentification */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
