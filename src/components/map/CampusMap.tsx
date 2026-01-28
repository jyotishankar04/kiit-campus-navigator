import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, CAMPUS_BOUNDS, CAMPUS_CENTER, CATEGORY_CONFIG } from '@/types/location';

interface CampusMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isAdmin?: boolean;
}

export function CampusMap({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  onMapClick,
  isAdmin = false 
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
      zoom: 15,
      maxBounds: [
        [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
        [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
      ],
      maxBoundsViscosity: 1.0,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add click handler for admin
    if (isAdmin && onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isAdmin, onMapClick]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    locations.forEach((location) => {
      const config = CATEGORY_CONFIG[location.category];
      
      const icon = L.divIcon({
        className: `custom-marker ${location.category}`,
        html: `<span style="font-size: 18px;">${config.icon}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([location.lat, location.lng], { icon, title: location.name })
        .addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${location.name}</h3>
          <p class="text-xs text-gray-600">${config.label}</p>
          ${location.description ? `<p class="text-xs mt-1">${location.description}</p>` : ''}
        </div>
      `);

      marker.on('click', () => {
        onLocationSelect(location);
      });

      markersRef.current.set(location.id, marker);
    });
  }, [locations, onLocationSelect]);

  // Pan to selected location
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 17, {
      animate: true,
    });

    const marker = markersRef.current.get(selectedLocation.id);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedLocation]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full z-0 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}