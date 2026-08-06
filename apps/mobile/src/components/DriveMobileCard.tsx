import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { WalkinDrive } from '@gatepulse/shared';
import { openGoogleMapsNavigation } from '../utils/navigationHelper';
import { addToDeviceCalendar } from '../utils/calendarHelper';

interface DriveMobileCardProps {
  drive: WalkinDrive;
}

export const DriveMobileCard: React.FC<DriveMobileCardProps> = ({ drive }) => {
  const isHighTrust = drive.trust_score >= 70;
  const isLowTrust = drive.trust_score < 50;

  return (
    <View style={styles.card}>
      {/* Top Header: Company & Trust Badge */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{drive.company_name}</Text>
          <Text style={styles.jobTitle}>{drive.job_title}</Text>
        </View>

        <View
          style={[
            styles.trustBadge,
            isHighTrust ? styles.trustHigh : isLowTrust ? styles.trustLow : styles.trustMed,
          ]}
        >
          <Text
            style={[
              styles.trustText,
              isHighTrust ? styles.trustHighText : isLowTrust ? styles.trustLowText : styles.trustMedText,
            ]}
          >
            {isHighTrust ? '✓ Verified' : isLowTrust ? '⚠ Low Trust' : 'Moderate'} ({drive.trust_score}%)
          </Text>
        </View>
      </View>

      {/* Fraud Alert Banner */}
      {drive.contains_payment_demand && (
        <View style={styles.fraudBanner}>
          <Text style={styles.fraudTitle}>⚠️ FRAUD WARNING: PAYMENT DEMANDED</Text>
          <Text style={styles.fraudSub}>
            This post requests fees/registration payments. Legitimate companies NEVER charge candidates!
          </Text>
        </View>
      )}

      {/* Info Pills Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillLabel}>DATE</Text>
          <Text style={styles.infoPillValue}>{drive.walkin_start_date}</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoPillLabel}>CITY</Text>
          <Text style={styles.infoPillValue}>{drive.city}</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoPillLabel}>EXP</Text>
          <Text style={styles.infoPillValue}>{drive.experience_range}</Text>
        </View>
      </View>

      {/* IT Park & Landmark Gate Details */}
      <View style={styles.gateBox}>
        <Text style={styles.itParkText}>🏢 {drive.it_park_name}</Text>
        <View style={styles.landmarkRow}>
          <Text style={styles.landmarkLabel}>LANDMARK GATE ENTRY:</Text>
          <Text style={styles.landmarkText}>{drive.landmark_gate}</Text>
        </View>
      </View>

      {/* ACTION BUTTONS: Google Maps & Direct Calendar Entry */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => openGoogleMapsNavigation(drive.it_park_name, drive.landmark_gate, drive.city)}
        >
          <Text style={styles.navButtonText}>📍 Google Maps Nav</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calendarButton}
          activeOpacity={0.8}
          onPress={() => addToDeviceCalendar(drive)}
        >
          <Text style={styles.calendarButtonText}>📅 Add Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  companyName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  jobTitle: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  trustBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trustHigh: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)' },
  trustMed: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.4)' },
  trustLow: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.4)' },
  trustText: { fontSize: 11, fontWeight: '700' },
  trustHighText: { color: '#34d399' },
  trustMedText: { color: '#fbbf24' },
  trustLowText: { color: '#fb7185' },
  fraudBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  fraudTitle: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 2,
  },
  fraudSub: {
    color: '#fca5a5',
    fontSize: 11,
    lineHeight: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 12,
  },
  infoPill: {
    alignItems: 'center',
    flex: 1,
  },
  infoPillLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  infoPillValue: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  gateBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itParkText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  landmarkRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  landmarkLabel: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  landmarkText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  calendarButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  calendarButtonText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
});
