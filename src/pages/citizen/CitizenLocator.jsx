import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Filter, MapPin, Map as MapIcon, Phone, Clock, User, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocateControl = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function CitizenLocator() {
  const [facilities, setFacilities] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facData, typeData] = await Promise.all([
        apiFetch('/facilities.php').catch(() => null),
        apiFetch('/facility_types.php').catch(() => null)
      ]);
      
      // MOCK DATA FALLBACK IF API FAILS
      if (!facData && !typeData) {
        console.warn("API failed. Using mock data for demonstration.");
        const mockTypes = [
          { id: 1, name: 'Public Toilet', icon_type: 'restroom', status: 'active', custom_fields_schema: [ { name: 'male_seats', label: 'Male Seats', type: 'number', required: true }, { name: 'female_seats', label: 'Female Seats', type: 'number', required: true } ] },
          { id: 2, name: 'Water Tank', icon_type: 'tint', status: 'active', custom_fields_schema: [ { name: 'capacity', label: 'Capacity (Liters)', type: 'number', required: true } ] }
        ];
        const mockFacs = [
          { id: 1, type_id: 1, type_name: 'Public Toilet', name: 'City Center Toilet', latitude: 27.2415, longitude: 94.1032, address: 'Main Market Road', ward_number: 'Ward 04', status: 'active', custom_fields_data: { male_seats: 4, female_seats: 4 } }
        ];
        setFacilities(mockFacs);
        setFacilityTypes(mockTypes);
      } else {
        setFacilities(facData || []);
        setFacilityTypes(typeData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        alert("Unable to fetch location. Please ensure location services are enabled.");
      },
      { enableHighAccuracy: true }
    );
  };

  const filteredFacilities = filterType === 'all' 
    ? facilities 
    : facilities.filter(f => f.type_id == filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', marginTop: '-10px', gap: 16 }}>
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, zIndex: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>
            GIS Facility Locator
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>
            Find nearby public utilities and municipal offices
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={16} color="var(--gray-500)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              style={{ 
                padding: '10px 16px 10px 36px', borderRadius: 10, border: '1.5px solid var(--gray-200)', 
                fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', outline: 'none', background: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {facilityTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <button onClick={handleLocateMe} className="btn btn-primary" style={{ padding: '10px 20px', gap: 8 }}>
            <Navigation size={18} /> Locate Me
          </button>
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--gray-200)', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
            Loading Map & Facilities...
          </div>
        )}
        <MapContainer center={[27.2415, 94.1032]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {userLocation && (
            <LocateControl position={userLocation} />
          )}

          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({
                 className: 'user-location-marker',
                 html: '<div style="background:#3b82f6; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
                 iconSize: [22, 22],
                 iconAnchor: [11, 11]
             })}>
               <Popup><strong>You are here</strong></Popup>
             </Marker>
          )}

          {filteredFacilities.map(fac => {
            const distance = userLocation ? getDistance(userLocation[0], userLocation[1], fac.latitude, fac.longitude) : null;
            return (
              <Marker key={fac.id} position={[fac.latitude, fac.longitude]}>
                <Popup className="facility-popup">
                  <div style={{ minWidth: 260, padding: '4px 0' }}>
                    
                    <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                          {fac.type_name}
                        </span>
                        {distance && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '4px 8px', borderRadius: 6 }}>
                            {distance} km away
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 800, color: '#111827' }}>{fac.name}</h3>
                      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} color="#9ca3af" /> 
                        <span>{fac.address}<br/>Ward: {fac.ward_number}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      {fac.custom_fields_schema?.map((schemaField, idx) => {
                        const val = fac.custom_fields_data[schemaField.name];
                        if (!val) return null;
                        
                        let icon = <CheckCircle2 size={12} color="#10b981" />;
                        if (schemaField.type === 'time') icon = <Clock size={12} color="#f59e0b" />;
                        if (schemaField.name.includes('contact') || schemaField.name.includes('phone')) icon = <Phone size={12} color="#3b82f6" />;
                        if (schemaField.name.includes('name') || schemaField.name.includes('officer')) icon = <User size={12} color="#8b5cf6" />;

                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {icon} {schemaField.label}
                            </span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{val}</span>
                          </div>
                        );
                      })}
                      
                      {(!fac.custom_fields_schema || fac.custom_fields_schema.length === 0) && (
                        <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No additional details</div>
                      )}
                    </div>

                    <a 
                      href={`https://maps.google.com/?daddr=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
                        width: '100%', padding: '10px 0', background: '#2563eb', color: 'white', 
                        borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                      onMouseLeave={e => e.target.style.background = '#2563eb'}
                    >
                      <Navigation size={16} /> Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <style>{`
        .facility-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .facility-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
      `}</style>
    </div>
  );
}
