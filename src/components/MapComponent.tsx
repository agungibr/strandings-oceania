import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fix for Leaflet default icon when not set
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface StrandingLocation {
  latitude?: number;
  longitude?: number;
  species: string;
  year: string;
  location: string;
}

interface MapComponentProps {
  data: StrandingLocation[];
}

const MapComponent = ({ data }: MapComponentProps) => {
  const validLocations = data.filter(d => d.latitude && d.longitude);
  const center = validLocations.length > 0
    ? [validLocations[0].latitude || -15, validLocations[0].longitude || 180]
    : [-15, 180];

  return (
    <MapContainer
      center={[center[0], center[1]] as [number, number]}
      zoom={4}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validLocations.map((location, index) => (
        <Marker
          key={index}
          position={[location.latitude || 0, location.longitude || 0]}
          icon={icon}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{location.species}</h3>
              <p>Location: {location.location}</p>
              <p>Year: {location.year}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
