import { Linking, Platform, Alert } from 'react-native';

export function openGoogleMapsNavigation(itParkName: string, landmarkGate: string, city: string) {
  const query = encodeURIComponent(`${itParkName}, ${landmarkGate}, ${city}`);
  
  let mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  
  if (Platform.OS === 'android') {
    mapsUrl = `geo:0,0?q=${query}`;
  } else if (Platform.OS === 'ios') {
    mapsUrl = `maps://app?q=${query}`;
  }

  Linking.canOpenURL(mapsUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(mapsUrl);
      } else {
        return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      }
    })
    .catch((err) => {
      console.warn('Error opening Google Maps:', err);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
}
