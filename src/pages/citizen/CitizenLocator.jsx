import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Filter, MapPin, Map as MapIcon, Phone, Clock, User, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

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

const LocateControl = ({ position, zoom = 15 }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.5 });
    }
  }, [position, map, zoom]);
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

const BoundsControl = ({ facilities, trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (facilities && facilities.length > 0) {
      const validCoords = facilities
        .filter(f => !isNaN(f.latitude) && !isNaN(f.longitude) && f.latitude != 0)
        .map(f => [f.latitude, f.longitude]);
      
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    }
  }, [facilities, trigger, map]);
  return null;
};

export default function CitizenLocator() {
  const [facilities, setFacilities] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');

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

  const [initialCenter, setInitialCenter] = useState(null);
  const [focusPosition, setFocusPosition] = useState(null);
  const [resetBoundsCounter, setResetBoundsCounter] = useState(0);

  const handleLocateMe = (isManual = false) => {
    if (!navigator.geolocation) {
      if (!isManual && !initialCenter) setInitialCenter([27.2415, 94.1032]);
      if (isManual) alert("Geolocation is not supported by your browser");
      return;
    }
    
    let timer;
    if (!isManual) {
      timer = setTimeout(() => {
        setInitialCenter(prev => prev || [27.2415, 94.1032]);
      }, 3000);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (timer) clearTimeout(timer);
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setInitialCenter(coords);
      },
      (error) => {
        if (timer) clearTimeout(timer);
        setInitialCenter(prev => prev || [27.2415, 94.1032]);
        if (isManual) alert("Unable to fetch location. Please check your permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    fetchData();
    handleLocateMe(false); // Automatically get location on load
  }, []);

  const filteredFacilities = filterType === 'all' 
    ? facilities 
    : facilities.filter(f => f.type_id == filterType);

  const processedFacilities = filteredFacilities.map(fac => {
    const lat = Number(fac.latitude);
    const lng = Number(fac.longitude);
    const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0;
    const distanceVal = isValid && userLocation ? parseFloat(getDistance(userLocation[0], userLocation[1], lat, lng)) : Infinity;
    return { ...fac, lat, lng, isValid, distanceVal };
  }).filter(fac => fac.isValid).sort((a, b) => a.distanceVal - b.distanceVal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', marginTop: '-10px', gap: 16 }}>
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, zIndex: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>
            Nearby Finder
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

      <div style={{ display: 'flex', flex: 1, gap: 16, minHeight: 0, paddingBottom: 16 }}>
        
        <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
          <button className="btn btn-secondary" onClick={() => { setFocusPosition(null); setResetBoundsCounter(c => c + 1); }} style={{ width: '100%', padding: '12px', justifyContent: 'center', background: 'white', border: '1px solid var(--gray-200)' }}>
            Show All Facilities
          </button>
          
          {processedFacilities.map(fac => (
            <div key={fac.id} className="card" style={{ padding: 16, cursor: 'pointer', transition: 'all 0.2s', border: focusPosition && focusPosition[0] === fac.lat && focusPosition[1] === fac.lng ? '2px solid var(--primary)' : '1px solid transparent' }} onClick={() => setFocusPosition([fac.lat, fac.lng])}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                 <h4 style={{ margin: 0, fontSize: 15, color: 'var(--gray-900)' }}>{fac.name}</h4>
                 {fac.distanceVal !== Infinity && <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap', marginLeft: 8 }}>{fac.distanceVal} km</span>}
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {fac.address}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                   Get Directions
                 </a>
              </div>
            </div>
          ))}
          {processedFacilities.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>No facilities found.</div>
          )}
        </div>

        <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--gray-200)', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
        {(loading || !initialCenter) && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
            {!initialCenter ? 'Determining your location...' : 'Loading Map & Facilities...'}
          </div>
        )}
        
        {initialCenter && (
        <MapContainer center={initialCenter} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {userLocation && !focusPosition && (
            <LocateControl position={userLocation} zoom={14} />
          )}

          {focusPosition && (
            <LocateControl position={focusPosition} zoom={18} />
          )}

          {filteredFacilities && filteredFacilities.length > 0 && !focusPosition && (
            <BoundsControl facilities={filteredFacilities} trigger={resetBoundsCounter} />
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
            const typeDetails = facilityTypes.find(t => t.id == fac.type_id) || {};
            const lat = Number(fac.latitude);
            const lng = Number(fac.longitude);
            
            if (isNaN(lat) || isNaN(lng) || lat === 0) return null;

            const distance = userLocation ? getDistance(userLocation[0], userLocation[1], lat, lng) : null;
            return (
              <Marker key={fac.id} position={[lat, lng]} icon={createCustomIcon(typeDetails)}>
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

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Get Directions</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', background: '#f1f5f9', color: '#334155', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 11, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                        >
                          <span style={{ fontSize: 18 }}>🚗</span>
                          Car
                        </a>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=two-wheeler`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', background: '#f1f5f9', color: '#334155', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 11, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                        >
                          <span style={{ fontSize: 18 }}>🏍️</span>
                          Bike
                        </a>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', background: '#f1f5f9', color: '#334155', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 11, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                        >
                          <span style={{ fontSize: 18 }}>🚶</span>
                          Walk
                        </a>
                      </div>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
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
