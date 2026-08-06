import { Linking, Alert, Platform } from 'react-native';
import { WalkinDrive } from '@gatepulse/shared';

export function addToDeviceCalendar(drive?: WalkinDrive) {
  try {
    if (!drive) {
      Alert.alert('Calendar Error', 'Drive details unavailable.');
      return;
    }

    const company = drive.company_name || 'Walkin Drive';
    const titleText = drive.job_title ? `Walkin Drive: ${company} - ${drive.job_title}` : `Walkin Drive: ${company}`;
    const startDate = drive.walkin_start_date ? drive.walkin_start_date.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
    const startTime = '090000';
    const endTime = '130000';

    const locationParts = [drive.it_park_name, drive.landmark_gate, drive.city].filter(Boolean);
    const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Walkin Drive Venue';

    const title = encodeURIComponent(titleText);
    const details = encodeURIComponent(
      `GatePulse Job Walkin Drive\nCompany: ${company}\nRole: ${drive.job_title || 'Software Engineer'}\nExp: ${drive.experience_range || '0-3 Years'}\nLandmark Gate: ${drive.landmark_gate || 'Main Visitor Entrance'}\nTrust Score: ${drive.trust_score ?? 80}%`
    );
    const location = encodeURIComponent(locationString);

    // Google Calendar Web Intent (Works cross-platform iOS/Android/Web)
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T${startTime}Z/${startDate}T${endTime}Z&details=${details}&location=${location}&sf=true&output=xml`;

    Linking.openURL(calendarUrl).catch((err) => {
      console.warn('Could not open calendar intent:', err);
      Alert.alert(
        'Calendar Entry',
        `Drive scheduled for ${drive.walkin_start_date || 'Upcoming Date'} at ${drive.it_park_name || 'IT Park'} (${drive.landmark_gate || 'Visitor Gate'}).`
      );
    });
  } catch (error) {
    Alert.alert('Calendar Error', 'Could not create calendar event.');
  }
}
