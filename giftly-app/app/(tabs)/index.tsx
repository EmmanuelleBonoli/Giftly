import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

/** Écran d'accueil — implémentation complète à l'étape 8 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accueil — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { color: Colors.textSecondary },
});
