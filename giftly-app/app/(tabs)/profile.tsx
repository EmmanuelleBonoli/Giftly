import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

/** Écran profil — implémentation complète à l'étape 8 */
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profil — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { color: Colors.textSecondary },
});
