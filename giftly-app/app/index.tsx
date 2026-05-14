import { Redirect } from 'expo-router';

/**
 * Point d'entrée — redirige vers l'écran de connexion.
 * Sera remplacé par une vérification du token JWT en étape 7.
 */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
