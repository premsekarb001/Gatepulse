import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { WalkinDrive, DriveFilterOptions } from '@gatepulse/shared';
import { ExtractedDriveData } from './geminiService';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl !== 'https://your-supabase-project.supabase.co') {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    console.log('Supabase client connected to:', config.supabaseUrl);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

// In-Memory fallback store populated with realistic drive seed data
const initialMockDrives: WalkinDrive[] = [
  {
    id: 'drive-101',
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
    venue_address: 'Manyata Tech Park, Nagavara, Outer Ring Rd, Bengaluru, Karnataka 560045',
    latitude: 13.0458,
    longitude: 77.6202,
    created_at: new Date('2026-08-05').toISOString()
  },
  {
    id: 'drive-102',
    company_name: 'Infosys Limited',
    job_title: 'System Engineer & Data Analyst',
    experience_range: '1-3 Years',
    experience_min: 1,
    experience_max: 3,
    walkin_start_date: '2026-08-12',
    walkin_end_date: '2026-08-12',
    time_slot: '09:30 AM - 02:00 PM',
    city: 'Hyderabad',
    it_park_name: 'HITEC City',
    landmark_gate: 'Gate 1 (Building 12 Security Desk)',
    trust_score: 92,
    contains_payment_demand: false,
    contact_email: 'walkin.hyd@infosys.com',
    venue_address: 'Survey No. 64, HITEC City, Madhapur, Hyderabad, Telangana 500081',
    latitude: 17.4474,
    longitude: 78.3762,
    created_at: new Date('2026-08-04').toISOString()
  },
  {
    id: 'drive-103',
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
    contains_payment_demand: true, // FRAUD WARNING DEMO
    contact_email: 'hr@techhorizon-jobs.fake.com',
    venue_address: 'EON Free Zone, Kharadi, Pune, Maharashtra 411014',
    latitude: 18.5515,
    longitude: 73.9525,
    created_at: new Date('2026-08-06').toISOString()
  },
  {
    id: 'drive-104',
    company_name: 'Cognizant Technology Solutions',
    job_title: 'Cloud DevOps & AWS Architect',
    experience_range: '3-6 Years',
    experience_min: 3,
    experience_max: 6,
    walkin_start_date: '2026-08-15',
    time_slot: '10:00 AM - 01:00 PM',
    city: 'Chennai',
    it_park_name: 'Ramanujan IT City',
    landmark_gate: 'Gate 4 North Tower Security Desk',
    trust_score: 88,
    contains_payment_demand: false,
    contact_email: 'lateral.hiring@cognizant.com',
    venue_address: 'Ramanujan IT City, Taramani, Chennai, Tamil Nadu 600113',
    latitude: 12.9863,
    longitude: 80.2432,
    created_at: new Date('2026-08-06').toISOString()
  },
  {
    id: 'drive-105',
    company_name: 'HCLTech',
    job_title: 'Network & Service Desk Support Engineer',
    experience_range: '0-2 Years',
    experience_min: 0,
    experience_max: 2,
    walkin_start_date: '2026-08-18',
    time_slot: '09:00 AM - 12:30 PM',
    city: 'Noida',
    it_park_name: 'Noida SEZ Sector 126',
    landmark_gate: 'Gate A1 Visitor Badge Desk',
    trust_score: 90,
    contains_payment_demand: false,
    contact_email: 'noida.drives@hcl.com',
    venue_address: 'Plot No 3A, Sector 126, Noida, Uttar Pradesh 201304',
    latitude: 28.5447,
    longitude: 77.3342,
    created_at: new Date('2026-08-06').toISOString()
  }
];

const inMemoryStore: WalkinDrive[] = [...initialMockDrives];

export async function saveDriveToSupabase(data: ExtractedDriveData, rawText: string): Promise<WalkinDrive> {
  const newDriveRecord: Partial<WalkinDrive> = {
    company_name: data.company_name,
    job_title: data.job_title,
    experience_range: data.experience_range,
    experience_min: data.experience_min,
    experience_max: data.experience_max,
    walkin_start_date: data.walkin_start_date,
    walkin_end_date: data.walkin_end_date,
    time_slot: data.time_slot,
    city: data.city,
    it_park_name: data.it_park_name,
    landmark_gate: data.landmark_gate,
    trust_score: data.trust_score,
    contains_payment_demand: data.contains_payment_demand,
    raw_text: rawText,
    contact_email: data.contact_email,
    venue_address: data.venue_address,
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data: inserted, error } = await supabaseClient
        .from('walkin_drives')
        .insert([newDriveRecord])
        .select()
        .single();

      if (!error && inserted) {
        console.log('Successfully saved walkin drive to Supabase ID:', inserted.id);
        return inserted as WalkinDrive;
      }
      console.warn('Supabase insert error, saving to memory fallback:', error?.message);
    } catch (e) {
      console.warn('Supabase exception, falling back to memory store:', e);
    }
  }

  // Fallback to in-memory store
  const saved: WalkinDrive = {
    id: `drive-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...newDriveRecord as Required<Omit<WalkinDrive, 'id'>>
  };
  inMemoryStore.unshift(saved);
  return saved;
}

export async function getDrivesFromSupabase(filters: DriveFilterOptions): Promise<WalkinDrive[]> {
  if (supabaseClient) {
    try {
      let query = supabaseClient
        .from('walkin_drives')
        .select('*')
        .order('walkin_start_date', { ascending: true });

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.it_park_name) {
        query = query.ilike('it_park_name', `%${filters.it_park_name}%`);
      }
      if (filters.min_trust_score) {
        query = query.gte('trust_score', filters.min_trust_score);
      }

      const { data, error } = await query;
      if (!error && data) {
        let results = data as WalkinDrive[];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          results = results.filter(d => 
            d.company_name.toLowerCase().includes(s) || 
            d.job_title.toLowerCase().includes(s) ||
            d.landmark_gate.toLowerCase().includes(s)
          );
        }
        return results;
      }
      console.warn('Supabase fetch error, using in-memory fallback:', error?.message);
    } catch (e) {
      console.warn('Supabase exception during fetch:', e);
    }
  }

  // Fallback memory filter & sort
  let result = [...inMemoryStore];

  if (filters.city) {
    const c = filters.city.toLowerCase();
    result = result.filter(d => d.city.toLowerCase().includes(c));
  }

  if (filters.it_park_name) {
    const p = filters.it_park_name.toLowerCase();
    result = result.filter(d => d.it_park_name.toLowerCase().includes(p));
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(d => 
      d.company_name.toLowerCase().includes(s) || 
      d.job_title.toLowerCase().includes(s) ||
      d.city.toLowerCase().includes(s) ||
      d.it_park_name.toLowerCase().includes(s) ||
      d.landmark_gate.toLowerCase().includes(s)
    );
  }

  if (filters.experience) {
    const exp = filters.experience.toLowerCase();
    if (exp.includes('fresher') || exp.includes('0-1')) {
      result = result.filter(d => d.experience_min <= 1);
    } else if (exp.includes('1-3')) {
      result = result.filter(d => d.experience_min <= 3 && d.experience_max >= 1);
    } else if (exp.includes('3-5')) {
      result = result.filter(d => d.experience_min <= 5 && d.experience_max >= 3);
    }
  }

  // Sort by walkin_start_date ASC
  result.sort((a, b) => new Date(a.walkin_start_date).getTime() - new Date(b.walkin_start_date).getTime());

  return result;
}
