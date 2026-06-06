import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map as MapIcon, Filter, Layers, Navigation, Activity, 
  MapPin, CheckCircle2, Phone, User, Clock, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const createCustomIcon = (typeObj) => {
  if (typeObj && typeObj.icon_url) {
    return L.icon({
      iconUrl: typeObj.icon_url,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  const typeName = typeObj ? typeObj.name : 'Unknown';
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < (typeName || '').length; i++) {
    hash = typeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];
  const initial = (typeName || 'F').charAt(0).toUpperCase();

  const svgIcon = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="18" r="12" fill="white" />
      <text x="18" y="23" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="${color}" text-anchor="middle">${initial}</text>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-facility-icon',
    html: svgIcon,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  });
};

export default function AdminGisDashboard() {
  const [facilities, setFacilities] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [initialCenter, setInitialCenter] = useState(null);

  useEffect(() => {
    fetchData();

    if (navigator.geolocation) {
      let timer = setTimeout(() => {
        setInitialCenter(prev => prev || [27.2415, 94.1032]);
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          setInitialCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          clearTimeout(timer);
          setInitialCenter(prev => prev || [27.2415, 94.1032]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setInitialCenter([27.2415, 94.1032]);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facData, typeData] = await Promise.all([
        apiFetch('/facilities.php').catch(() => null),
        apiFetch('/facility_types.php').catch(() => null)
      ]);
      
      setFacilities(facData || []);
      setFacilityTypes(typeData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = filterType === 'all' 
    ? facilities 
    : facilities.filter(f => f.type_id == filterType);

  // Statistics
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(f => f.status === 'active').length;
  const facilitiesByType = facilityTypes.map(t => ({
    name: t.name,
    count: facilities.filter(f => f.type_id === t.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', marginTop: '-10px', gap: 16 }}>
      
      {/* Header & Stats Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>
              GIS Map Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>
              Bird's-eye view of all registered facilities and infrastructure
            </p>
          </div>
          <Link to="/admin/facilities" className="btn btn-primary" style={{ padding: '8px 16px', gap: 8, textDecoration: 'none' }}>
            <MapPin size={16} /> Manage Locations
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 8 }}>
          <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Mapped</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>{totalFacilities}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--blue-50)', borderRadius: 12, color: 'var(--primary)' }}>
                <MapIcon size={20} />
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Active Status</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>{activeFacilities}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--green-50)', borderRadius: 12, color: 'var(--success)' }}>
                <Activity size={20} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--purple-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Categories</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>{facilityTypes.length}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--purple-50)', borderRadius: 12, color: 'var(--purple-600)' }}>
                <Layers size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbff' }}>
          <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={18} color="var(--primary)" /> Interactive Map View
          </h3>
          <div style={{ position: 'relative' }}>
            <Filter size={14} color="var(--gray-500)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              style={{ 
                padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid var(--gray-300)', 
                fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="all">All Facility Types</option>
              {facilityTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({facilities.filter(f => f.type_id === t.id).length})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {(loading || !initialCenter) && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
              {!initialCenter ? 'Determining your location...' : 'Loading Dashboard Data...'}
            </div>
          )}
          {initialCenter && (
          <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap'
            />
            
            {filteredFacilities.map(fac => {
              const typeDetails = facilityTypes.find(t => t.id == fac.type_id) || {};
              return (
                <Marker key={fac.id} position={[fac.latitude, fac.longitude]} icon={createCustomIcon(typeDetails)}>
                  <Popup className="facility-popup">
                    <div style={{ minWidth: 260, padding: '4px 0' }}>
                      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 10, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            {fac.type_name}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: fac.status === 'active' ? '#059669' : '#dc2626', background: fac.status === 'active' ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
                            {fac.status}
                          </span>
                        </div>
                        <h3 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 800, color: '#111827' }}>{fac.name}</h3>
                        <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} color="#9ca3af" /> 
                          <span>{fac.address}<br/>Ward: {fac.ward_number}</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        {typeDetails.custom_fields_schema?.map((schemaField, idx) => {
                          const val = fac.custom_fields_data?.[schemaField.name];
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
                        {(!typeDetails.custom_fields_schema || typeDetails.custom_fields_schema.length === 0) && (
                          <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No custom fields</div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          )}
        </div>
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
