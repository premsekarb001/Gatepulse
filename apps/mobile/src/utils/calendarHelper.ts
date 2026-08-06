import { Linking, Alert, Platform } from 'react-native';
import { WalkinDrive } from '@gatepulse/shared';

export function addToDeviceCalendar(drive: WalkinDrive) {
  try {
    const startDate = drive.walkin_start_date ? drive.walkin_start_date.replace(/-/g, '') : '20260810';
    const startTime = '090000';
    const endTime = '130000';
    const title = encodeURIComponent(`Walkin Drive: ${drive.company_name} - ${drive.job_title}`);
    const details = encodeURIComponent(
      `Gatepulse Job Walkin Drive\nCompany: ${drive.company_name}\nRole: ${drive.job_title}\nExp: ${drive.experience_range}\nLandmark Gate: ${drive.landmark_gate}\nTrust Score: ${drive.trust_score}%`
    );
    const location = encodeURIComponent(`${drive.it_park_name}, ${drive.landmark_gate}, ${drive.city}`);

    // Google Calendar Web Intent (Works cross-platform iOS/Android/Web)
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T${startTime}Z/${startDate}T${endTime}Z&details=${details}&location=${location}&sf=true&output=xml`;

    Linking.openURL(calendarUrl).catch((err) => {
      console.warn('Could not open calendar intent:', err);
      Alert.alert(
        'Calendar Entry',
        `Drive scheduled for ${drive.walkin_start_date} at ${drive.it_park_name} (${drive.landmark_gate}).`
      );
    });
  } catch (error) {
    Alert.alert('Calendar Error', 'Could not create calendar event.');
  }
}
