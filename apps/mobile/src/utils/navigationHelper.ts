import { Linking, Platform, Alert } from 'react-native';

export function openGoogleMapsNavigation(itParkName?: string, landmarkGate?: string, city?: string) {
  const parts = [itParkName, landmarkGate, city].filter((p): p is string => Boolean(p && p.trim()));
  const queryText = parts.length > 0 ? parts.join(', ') : 'IT Park Walkin Drive';
  const query = encodeURIComponent(queryText);
  
  const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  let mapsUrl = webFallbackUrl;
  
  if (Platform.OS === 'android') {
    mapsUrl = `geo:0,0?q=${query}`;
  } else if (Platform.OS === 'ios') {
    mapsUrl = `maps://app?q=${query}`;
  }

  Linking.canOpenURL(mapsUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(mapsUrl).catch(() => Linking.openURL(webFallbackUrl));
      } else {
        return Linking.openURL(webFallbackUrl);
      }
    })
    .catch((err) => {
      console.warn('Error opening Google Maps intent, using web fallback:', err);
      Linking.openURL(webFallbackUrl).catch((fallbackErr) => {
        console.error('Failed to open web maps fallback:', fallbackErr);
        Alert.alert('Navigation Error', 'Could not open map navigation application.');
      });
    });
}
