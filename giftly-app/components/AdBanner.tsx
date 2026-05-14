import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Colors } from '@/constants/colors';

/**
 * Bannière publicitaire AdMob — affichée en bas de chaque écran principal.
 *
 * En développement (__DEV__) : utilise les ID de test Google.
 * En production : utilise les IDs réels définis dans les variables d'environnement.
 * À remplacer par tes vrais IDs une fois les comptes AdMob créés.
 */
const ANDROID_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
  ?? 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const IOS_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
  ?? 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios' ? IOS_BANNER_ID : ANDROID_BANNER_ID;

export function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.adBackground,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
