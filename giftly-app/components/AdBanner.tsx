import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Bannière publicitaire — placeholder visuel.
 * Sera remplacée par l'intégration AdMob réelle à l'étape 10.
 */
export function AdBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Publicité</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: Colors.adBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  text: {
    fontSize: 11,
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
