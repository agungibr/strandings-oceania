'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Create a custom div icon using SVG for better reliability
const createCustomIcon = (color: string = '#3182ce') => L.divIcon({
  className: 'custom-marker',
  html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24c0-6.617-5.383-12-12-12z" 
    fill="${color}"/>
    <circle cx="12" cy="12" r="6" fill="white"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36]
});

interface StrandingLocation {
  decimalLatitude?: number;
  decimalLongitude?: number;
  species: string;
  location: string;
  year: string;
}

interface StrandingsMapProps {
  data: StrandingLocation[];
}

export default function StrandingsMap({ data }: StrandingsMapProps) {
  // Filter and validate coordinates
  const validLocations = data.filter(d => {
    const lat = d.decimalLatitude;
    const lng = d.decimalLongitude;
    return lat !== undefined && 
           lng !== undefined && 
           !isNaN(lat) && 
           !isNaN(lng) &&
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  });

  // Calculate bounds to contain all markers
  const defaultBounds = L.latLngBounds([-30, 150], [-5, 190]); // Default bounds for Oceania region
  const bounds = validLocations.length > 0 
    ? validLocations.reduce((bounds, location) => {
        const lat = location.decimalLatitude || 0;
        const lng = location.decimalLongitude || 0;
        return bounds.extend([lat, lng]);
      }, L.latLngBounds([validLocations[0].decimalLatitude || 0, validLocations[0].decimalLongitude || 0],
                       [validLocations[0].decimalLatitude || 0, validLocations[0].decimalLongitude || 0]))
    : defaultBounds;

  // Use bounds center as map center
  const center = bounds.getCenter();

  // Add CSS for marker styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        background: none;
        border: none;
      }
      .custom-marker svg {
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      bounds={[[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]] as L.LatLngBoundsLiteral}
      zoom={4}
      style={{ height: "400px", width: "100%" }}
      className="z-0"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="bottomright" />
      {validLocations.map((location, index) => (
        <Marker
          key={`${location.decimalLatitude}-${location.decimalLongitude}-${index}`}
          position={[location.decimalLatitude || 0, location.decimalLongitude || 0]}
          icon={createCustomIcon()}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-blue-600">{location.species}</h3>
              <p className="text-gray-700">{location.location}</p>
              <p className="text-gray-600 text-sm">Year: {location.year}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}