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
import { WalkinDrive } from '@gatepulse/shared';
import { DriveMobileCard } from './src/components/DriveMobileCard';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_NATIVE_API_URL || 'http://localhost:5000';

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
    created_at: new Date('2026-08-05').toISOString()
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
    created_at: new Date('2026-08-04').toISOString()
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
    created_at: new Date('2026-08-06').toISOString()
  }
];

const CITIES = ['All Cities', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Noida'];

export default function App() {
  const [drives, setDrives] = useState<WalkinDrive[]>(SEED_DRIVES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');

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
            <Text style={styles.badgeText}>MOBILE MAPS</Text>
          </View>
        </View>
        <Text style={styles.subText}>IT Park Walk-in Drive &amp; Landmark Gate Navigation</Text>
      </View>

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
});
