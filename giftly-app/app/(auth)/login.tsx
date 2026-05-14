import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Écran de connexion — implémentation complète à l'étape 7.
 */
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giftly</Text>
      <Text style={styles.subtitle}>Connexion — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
