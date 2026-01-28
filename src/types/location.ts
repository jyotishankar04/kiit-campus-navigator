export type LocationCategory = 'academic' | 'hostel' | 'food' | 'medical' | 'other';

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: LocationCategory;
  description: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const CAMPUS_BOUNDS = {
  north: 20.37,
  south: 20.34,
  east: 85.84,
  west: 85.80,
};

export const CAMPUS_CENTER = {
  lat: 20.3532,
  lng: 85.8180,
};

export const CATEGORY_CONFIG: Record<LocationCategory, { label: string; icon: string; color: string }> = {
  academic: { label: 'Academic', icon: '🏫', color: 'academic' },
  hostel: { label: 'Hostel', icon: '🏠', color: 'hostel' },
  food: { label: 'Food', icon: '🍽️', color: 'food' },
  medical: { label: 'Medical', icon: '🏥', color: 'medical' },
  other: { label: 'Other', icon: '🌟', color: 'other' },
};