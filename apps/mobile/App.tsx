import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { WalkinDrive, CandidateMatchResponse, DriveMatch } from '@gatepulse/shared';
import { DriveMobileCard } from './src/components/DriveMobileCard';
import { MobileResumeUploader } from './src/components/MobileResumeUploader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_NATIVE_API_URL || 'https://gatepulse-xi.vercel.app';

const SEED_DRIVES: WalkinDrive[] = [
  {
    id: 'mobile-drive-1',
    company_name: 'TCS (Tata Consultancy Services)',
    job_title: 'Full Stack Java & Angular Developer',
    experience_range: '0-2 Years',
    experience_min: 0,
    experience_max: 2,
    walkin_start_date: '2026-08-10',
    walkin_end_date: '2026-08-11',
    time_slot: '09:00 AM - 01:00 PM',
    city: 'Bengaluru',
    it_park_name: 'Manyata Tech Park',
    landmark_gate: 'Gate 3 Main Visitor Entrance (Block N1)',
    trust_score: 96,
    contains_payment_demand: false,
    contact_email: 'campus.careers@tcs.com',
    venue_address: 'Manyata Tech Park, Nagavara, Outer Ring Rd, Bengaluru',
    created_at: new Date('2026-08-05').toISOString(),
  },
  {
    id: 'mobile-drive-2',
    company_name: 'Infosys Limited',
    job_title: 'System Engineer & Data Analyst',
    experience_range: '1-3 Years',
    experience_min: 1,
    experience_max: 3,
    walkin_start_date: '2026-08-12',
    time_slot: '09:30 AM - 02:00 PM',
    city: 'Hyderabad',
    it_park_name: 'HITEC City',
    landmark_gate: 'Gate 1 (Building 12 Security Desk)',
    trust_score: 92,
    contains_payment_demand: false,
    contact_email: 'walkin.hyd@infosys.com',
    venue_address: 'Survey No. 64, HITEC City, Madhapur, Hyderabad',
    created_at: new Date('2026-08-04').toISOString(),
  },
  {
    id: 'mobile-drive-3',
    company_name: 'Tech Horizon Consultancy',
    job_title: 'Junior QA Automation Tester',
    experience_range: '0-1 Years',
    experience_min: 0,
    experience_max: 1,
    walkin_start_date: '2026-08-14',
    time_slot: '10:00 AM - 03:00 PM',
    city: 'Pune',
    it_park_name: 'EON Free Zone',
    landmark_gate: 'Gate 2 Entrance, Cluster C Lobby',
    trust_score: 42,
    contains_payment_demand: true,
    contact_email: 'hr@techhorizon-jobs.fake.com',
    venue_address: 'EON Free Zone, Kharadi, Pune',
    created_at: new Date('2026-08-06').toISOString(),
  },
];

const CITIES = ['All Cities', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Noida'];

export default function App() {
  const [drives, setDrives] = useState<WalkinDrive[]>(SEED_DRIVES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab & AI Match state
  const [activeTab, setActiveTab] = useState<'feed' | 'cv-match'>('feed');
  const [matchData, setMatchData] = useState<CandidateMatchResponse | null>(null);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/drives`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDrives(json.data);
        }
      }
    } catch (e) {
      console.log('Mobile API sync using local drive dataset fallback:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDrives();
  };

  const handleMatchComplete = (data: CandidateMatchResponse) => {
    setMatchData(data);
    setActiveTab('cv-match');
  };

  const filteredDrives = drives.filter((d) => {
    if (!d) return false;
    if (selectedCity !== 'All Cities' && (d.city || '').toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        (d.company_name || '').toLowerCase().includes(q) ||
        (d.job_title || '').toLowerCase().includes(q) ||
        (d.it_park_name || '').toLowerCase().includes(q) ||
        (d.landmark_gate || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>GatePulse</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MOBILE AI MAPS</Text>
          </View>
        </View>
        <Text style={styles.subText}>IT Park Walk-in Drive &amp; Gate Landmark Navigation</Text>

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
              All Walk-in Drives ({filteredDrives.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'cv-match' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('cv-match')}
          >
            <Text style={[styles.tabText, activeTab === 'cv-match' && styles.tabTextActive]}>
              🎯 AI CV Match {matchData ? `(${matchData.matches.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'feed' ? (
        <>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Company, Role, Landmark Gate..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* City Chips Horizontal Selector */}
          <View style={{ maxHeight: 44, marginBottom: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityChipsContainer}>
              {CITIES.map((c) => {
                const isActive = selectedCity === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCity(c)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Drive List */}
          {loading && !refreshing ? (
            <View style={styles.loaderCenter}>
              <ActivityIndicator size="large" color="#38bdf8" />
              <Text style={styles.loadingText}>Fetching Walk-in Gate Intelligence...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredDrives}
              keyExtractor={(item, index) => (item && item.id ? String(item.id) : `drive-${index}`)}
              renderItem={({ item }) => <DriveMobileCard drive={item} />}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No Walk-in Drives Found</Text>
                  <Text style={styles.emptySub}>Try clearing your search query or city filter.</Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        /* PERSONALIZED AI CV MATCH TAB */
        <ScrollView contentContainerStyle={styles.listContent}>
          <MobileResumeUploader onMatchComplete={handleMatchComplete} apiBaseUrl={API_BASE_URL} />

          {matchData && (
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileTitle}>👤 Candidate Profile Extracted</Text>
                <Text style={styles.expBadge}>{matchData.candidate.total_experience_years} Yrs Exp</Text>
              </View>

              {/* Skills Pill Cloud */}
              <Text style={styles.skillsLabel}>Extracted Key Skills:</Text>
              <View style={styles.pillWrap}>
                {matchData.candidate.key_skills.map((skill, i) => (
                  <View key={i} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              {/* Target Roles */}
              <Text style={[styles.skillsLabel, { marginTop: 8 }]}>Target Roles:</Text>
              <View style={styles.pillWrap}>
                {matchData.candidate.target_roles.map((role, i) => (
                  <View key={i} style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{role}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {matchData && matchData.matches && matchData.matches.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.recommendHeader}>
                🎯 AI Match Recommendations ({matchData.matches.length})
              </Text>

              {matchData.matches.map((item: DriveMatch) => {
                const score = item.match_score;
                const isHigh = score >= 80;
                const isMed = score >= 50 && score < 80;

                return (
                  <View key={item.drive.id} style={styles.matchItemContainer}>
                    <View style={styles.matchScoreRow}>
                      <View
                        style={[
                          styles.matchBadge,
                          isHigh ? styles.matchHigh : isMed ? styles.matchMed : styles.matchLow,
                        ]}
                      >
                        <Text
                          style={[
                            styles.matchBadgeText,
                            isHigh ? styles.matchHighText : isMed ? styles.matchMedText : styles.matchLowText,
                          ]}
                        >
                          {isHigh ? '✓ Excellent Match' : isMed ? '⚠ Good Fit' : 'Moderate'} ({score}%)
                        </Text>
                      </View>
                      <Text style={styles.aiScoreText}>Score: {score}/100</Text>
                    </View>

                    <Text style={styles.reasonText}>"{item.recommendation_reason}"</Text>

                    {/* Skill Tags */}
                    {item.matching_skills.length > 0 && (
                      <View style={styles.tagRow}>
                        <Text style={styles.matchTagLabel}>Matching:</Text>
                        {item.matching_skills.map((sk, i) => (
                          <Text key={i} style={styles.matchSkillTag}>
                            +{sk}
                          </Text>
                        ))}
                      </View>
                    )}

                    {item.missing_skills.length > 0 && (
                      <View style={styles.tagRow}>
                        <Text style={styles.gapTagLabel}>Skill Gaps:</Text>
                        {item.missing_skills.map((sk, i) => (
                          <Text key={i} style={styles.gapSkillTag}>
                            !{sk}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Drive Card */}
                    <DriveMobileCard drive={item.drive} />
                  </View>
                );
              })}
            </View>
          ) : matchData ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Matching Drives Found</Text>
              <Text style={styles.emptySub}>Try updating your CV or skills summary.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
  },
  subText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 13,
  },
  cityChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 10,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expBadge: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillsLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  skillPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rolePill: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  rolePillText: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendHeader: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  matchItemContainer: {
    marginBottom: 16,
  },
  matchScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchHigh: { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.4)' },
  matchMed: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.4)' },
  matchLow: { backgroundColor: 'rgba(148, 163, 184, 0.15)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.4)' },
  matchBadgeText: { fontSize: 10, fontWeight: 'bold' },
  matchHighText: { color: '#34d399' },
  matchMedText: { color: '#fbbf24' },
  matchLowText: { color: '#cbd5e1' },
  aiScoreText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reasonText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontStyle: 'italic',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingBottom: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
  },
  matchTagLabel: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: 'bold',
  },
  gapTagLabel: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: 'bold',
  },
  matchSkillTag: {
    color: '#6ee7b7',
    fontSize: 9,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gapSkillTag: {
    color: '#fde047',
    fontSize: 9,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
