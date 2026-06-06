import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { 
  Plus, Trash2, Edit, MapPin, Search, Server, 
  Layers, ShieldAlert, Activity, Navigation, Settings
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapCenterUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
};

export default function AdminFacilities() {
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities', 'types'
  const [facilities, setFacilities] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFacModal, setShowFacModal] = useState(false);
  const [editingFacId, setEditingFacId] = useState(null);
  const [facFormData, setFacFormData] = useState({
    type_id: '', name: '', latitude: 27.2415, longitude: 94.1032,
    address: '', ward_number: '', zone_number: '', status: 'active', custom_fields_data: {}
  });

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    name: '', icon_type: 'default', icon_url: '', status: 'active', custom_fields_schema: []
  });

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
      
      setFacilities(facData || []);
      setFacilityTypes(typeData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openFacModal = (fac = null) => {
    if (fac) {
      setEditingFacId(fac.id);
      setFacFormData({
        type_id: fac.type_id, name: fac.name, latitude: fac.latitude, longitude: fac.longitude,
        address: fac.address, ward_number: fac.ward_number, zone_number: fac.zone_number || '',
        status: fac.status, custom_fields_data: fac.custom_fields_data || {}
      });
    } else {
      setEditingFacId(null);
      setFacFormData({
        type_id: facilityTypes.length > 0 ? facilityTypes[0].id : '', name: '', latitude: 27.2415, longitude: 94.1032,
        address: '', ward_number: '', zone_number: '', status: 'active', custom_fields_data: {}
      });
    }
    setShowFacModal(true);
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    if (!facFormData.type_id || !facFormData.name || !facFormData.latitude) {
      alert("Please fill all required fixed fields and select location on map.");
      return;
    }
    try {
      if (editingFacId) {
        await apiFetch(`/facilities.php?id=${editingFacId}`, { method: 'PUT', body: facFormData });
      } else {
        await apiFetch('/facilities.php', { method: 'POST', body: facFormData });
      }
      setShowFacModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving facility');
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!confirm('Delete this facility?')) return;
    try {
      await apiFetch(`/facilities.php?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFacFormData(prev => ({
      ...prev,
      custom_fields_data: { ...prev.custom_fields_data, [fieldName]: value }
    }));
  };

  const openTypeModal = (type = null) => {
    if (type) {
      setEditingTypeId(type.id);
      setTypeFormData({
        name: type.name, icon_type: type.icon_type || 'default', icon_url: type.icon_url || '', status: type.status || 'active',
        custom_fields_schema: type.custom_fields_schema || []
      });
    } else {
      setEditingTypeId(null);
      setTypeFormData({ name: '', icon_type: 'default', icon_url: '', status: 'active', custom_fields_schema: [] });
    }
    setShowTypeModal(true);
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Icon file must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTypeFormData(prev => ({ ...prev, icon_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!typeFormData.name) return;
    try {
      if (editingTypeId) {
        await apiFetch(`/facility_types.php?id=${editingTypeId}`, { method: 'PUT', body: typeFormData });
      } else {
        await apiFetch('/facility_types.php', { method: 'POST', body: typeFormData });
      }
      setShowTypeModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving type');
    }
  };

  const handleDeleteType = async (id) => {
    if (!confirm('Delete this facility type? Ensure no facilities are using it.')) return;
    try {
      await apiFetch(`/facility_types.php?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const addTypeSchemaField = () => {
    setTypeFormData(prev => ({
      ...prev,
      custom_fields_schema: [ ...prev.custom_fields_schema, { name: '', label: '', type: 'text', required: false } ]
    }));
  };

  const updateTypeSchemaField = (index, key, value) => {
    const newSchema = [...typeFormData.custom_fields_schema];
    newSchema[index][key] = value;
    setTypeFormData(prev => ({ ...prev, custom_fields_schema: newSchema }));
  };

  const removeTypeSchemaField = (index) => {
    const newSchema = typeFormData.custom_fields_schema.filter((_, i) => i !== index);
    setTypeFormData(prev => ({ ...prev, custom_fields_schema: newSchema }));
  };

  const getSelectedTypeSchema = () => {
    const type = facilityTypes.find(t => t.id == facFormData.type_id);
    return type?.custom_fields_schema || [];
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: 16, padding: '32px', marginBottom: 32, color: 'white', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Dynamic GIS Facilities
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
            Manage map locations and define custom facility structures with ease.
          </p>
        </div>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: 6, border: '1px solid rgba(255,255,255,0.2)' }}>
          {[
            { id: 'facilities', label: 'Manage Locations', icon: <MapPin size={16} /> },
            { id: 'types', label: 'Facility Types', icon: <Layers size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#1e3a8a' : 'white',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading data...</div>
      ) : (
        <>
          {activeTab === 'facilities' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 20, color: 'var(--gray-800)' }}>Mapped Facilities</h3>
                <button className="btn btn-primary" onClick={() => openFacModal()} style={{ borderRadius: 20, padding: '10px 24px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                  <MapPin size={16} /> Add New Facility
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Facility Name & Info</th>
                        <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Coordinates</th>
                        <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>Ward</th>
                        <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilities.map(fac => (
                        <tr key={fac.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{fac.name}</div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{fac.address}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bfdbfe' }}>
                              {fac.type_name}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace', background: '#f1f5f9', padding: '6px 10px', borderRadius: 6, display: 'inline-block' }}>
                              {fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 500 }}>{fac.ward_number}</td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => openFacModal(fac)} style={{ padding: 8, borderRadius: 8 }}>
                                <Edit size={16} />
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteFacility(fac.id)} style={{ padding: 8, borderRadius: 8, color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {facilities.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
                              <MapPin size={32} />
                            </div>
                            <h3 style={{ margin: '0 0 8px', color: '#334155' }}>No facilities mapped yet</h3>
                            <p style={{ margin: 0, color: '#64748b' }}>Click "Add New Facility" to get started.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, color: 'var(--gray-800)' }}>Dynamic Facility Types</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--gray-500)' }}>Create new categories with custom data fields for the map.</p>
                </div>
                <button className="btn btn-primary" onClick={() => openTypeModal()} style={{ borderRadius: 20, padding: '10px 24px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                  <Layers size={16} /> Add New Type
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {facilityTypes.map(type => (
                  <div key={type.id} style={{ 
                    background: 'white', 
                    borderRadius: 16, 
                    padding: 24, 
                    border: '1px solid var(--gray-200)',
                    boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)'; }}>
                    
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {type.icon_url ? (
                          <img src={type.icon_url} alt="icon" style={{ width: 40, height: 40, objectFit: 'contain', background: '#f8fafc', borderRadius: 10, padding: 4, border: '1px solid #e2e8f0' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, background: '#eff6ff', color: '#3b82f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                            {(type.name || 'F').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: 18, color: '#0f172a', fontWeight: 700 }}>{type.name}</h4>
                          <span style={{ background: type.status === 'active' ? '#dcfce7' : '#f1f5f9', color: type.status === 'active' ? '#166534' : '#64748b', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                            {type.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openTypeModal(type)} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f1f5f9' }}>
                          <Edit size={16} color="#475569" />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteType(type.id)} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#fef2f2' }}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Settings size={14} /> Custom Fields ({type.custom_fields_schema?.length || 0})
                      </div>
                      
                      {(!type.custom_fields_schema || type.custom_fields_schema.length === 0) ? (
                        <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No custom fields defined.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {type.custom_fields_schema.map((f, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}</span>
                              <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{f.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {facilityTypes.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                    <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
                      <Layers size={32} />
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: '#334155' }}>No Facility Types</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Create a type (like 'Hospital') to start mapping.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showFacModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal animate-fadeIn" style={{ maxWidth: 700, width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={20} color="#3b82f6" />
                {editingFacId ? 'Edit Facility Location' : 'Add New Facility'}
              </h2>
              <button type="button" onClick={() => setShowFacModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveFacility} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block' }}>Facility Category / Type <span style={{color: '#ef4444'}}>*</span></label>
                <select 
                  className="form-control" 
                  value={facFormData.type_id} 
                  onChange={e => setFacFormData({...facFormData, type_id: e.target.value, custom_fields_data: {}})} 
                  required
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 14 }}
                >
                  <option value="">-- Select Type --</option>
                  {facilityTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {facFormData.type_id && (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 8, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 6, height: 18, background: '#3b82f6', borderRadius: 3 }}></div>
                      <h3 style={{ fontSize: 14, margin: 0, color: '#1e293b', fontWeight: 600 }}>
                        Fixed Fields (Required)
                      </h3>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block', fontSize: 13 }}>Facility Name <span style={{color: '#ef4444'}}>*</span></label>
                    <input type="text" className="form-control" value={facFormData.name} onChange={e => setFacFormData({...facFormData, name: e.target.value})} required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 13 }} />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block', fontSize: 13 }}>Ward Number <span style={{color: '#ef4444'}}>*</span></label>
                    <input type="text" className="form-control" value={facFormData.ward_number} onChange={e => setFacFormData({...facFormData, ward_number: e.target.value})} required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 13 }} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block', fontSize: 13 }}>Address <span style={{color: '#ef4444'}}>*</span></label>
                    <textarea className="form-control" rows="2" value={facFormData.address} onChange={e => setFacFormData({...facFormData, address: e.target.value})} required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', resize: 'none', minHeight: 60, fontSize: 13 }}></textarea>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block', fontSize: 13 }}>Location Coordinates <span style={{color: '#ef4444'}}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Latitude</label>
                        <input type="number" step="any" className="form-control" value={facFormData.latitude} onChange={e => setFacFormData({...facFormData, latitude: e.target.value})} required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Longitude</label>
                        <input type="number" step="any" className="form-control" value={facFormData.longitude} onChange={e => setFacFormData({...facFormData, longitude: e.target.value})} required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 13 }} />
                      </div>
                    </div>
                  </div>

                  {getSelectedTypeSchema().length > 0 && (
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 12, marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 18, background: '#8b5cf6', borderRadius: 3 }}></div>
                        <h3 style={{ fontSize: 14, margin: 0, color: '#1e293b', fontWeight: 600 }}>
                          Dynamic Fields
                        </h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        {getSelectedTypeSchema().map((field, idx) => (
                          <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block', fontSize: 13 }}>{field.label} {field.required && <span style={{color: '#ef4444'}}>*</span>}</label>
                            {field.type === 'boolean' ? (
                              <select 
                                className="form-control" 
                                value={facFormData.custom_fields_data[field.name] || ''} 
                                onChange={e => handleCustomFieldChange(field.name, e.target.value)}
                                required={field.required}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', fontSize: 13 }}
                              >
                                <option value="">-- Select --</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            ) : (
                              <input 
                                type={field.type === 'number' ? 'number' : field.type === 'time' ? 'time' : 'text'} 
                                className="form-control" 
                                value={facFormData.custom_fields_data[field.name] || ''} 
                                onChange={e => handleCustomFieldChange(field.name, e.target.value)}
                                required={field.required}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', fontSize: 13 }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFacModal(false)} style={{ padding: '8px 20px', borderRadius: 16, fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: 16, fontWeight: 600, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTypeModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal animate-fadeIn" style={{ maxWidth: 700, width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={24} color="#8b5cf6" />
                {editingTypeId ? 'Edit Facility Type' : 'Create Facility Type'}
              </h2>
              <button type="button" onClick={() => setShowTypeModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveType}>
              
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 8, display: 'block' }}>Type Name (e.g. Office, Toilet, Water Tank) <span style={{color: '#ef4444'}}>*</span></label>
                <input type="text" className="form-control" value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} required style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 16 }} />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: 20, alignItems: 'center', background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                {typeFormData.icon_url ? (
                  <div style={{ padding: 8, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <img src={typeFormData.icon_url} alt="Icon Preview" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4 }} />
                  </div>
                ) : (
                  <div style={{ width: 66, height: 66, borderRadius: 12, background: 'white', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, textAlign: 'center', flexDirection: 'column', gap: 4 }}>
                    <MapPin size={20} />
                    <span>No Icon</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 8, display: 'block' }}>Custom Map Icon (Optional)</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleIconUpload} style={{ padding: 8, background: 'white', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }} />
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Upload a transparent PNG/SVG for best map results (Max 2MB).</p>
                </div>
                {typeFormData.icon_url && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTypeFormData(prev => ({ ...prev, icon_url: '' }))} style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fecaca', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 24, background: '#8b5cf6', borderRadius: 4 }}></div>
                    <h4 style={{ margin: 0, fontSize: 16, color: '#1e293b', fontWeight: 600 }}>Custom Dynamic Fields</h4>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addTypeSchemaField} style={{ background: 'white', borderRadius: 20, padding: '6px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#3b82f6' }}>
                    <Plus size={14} /> Add Field
                  </button>
                </div>
                
                {typeFormData.custom_fields_schema.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16, background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Field Name (Key) <span style={{color: '#ef4444'}}>*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. doctor_name" value={field.name} onChange={e => updateTypeSchemaField(idx, 'name', e.target.value)} required style={{ padding: '8px 12px', fontSize: 14, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Display Label <span style={{color: '#ef4444'}}>*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. Doctor Name" value={field.label} onChange={e => updateTypeSchemaField(idx, 'label', e.target.value)} required style={{ padding: '8px 12px', fontSize: 14, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ width: 110 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Type</label>
                      <select className="form-control" value={field.type} onChange={e => updateTypeSchemaField(idx, 'type', e.target.value)} style={{ padding: '8px 12px', fontSize: 14, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="time">Time</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                    </div>
                    <div style={{ width: 70, textAlign: 'center' }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Required</label>
                      <input type="checkbox" checked={field.required} onChange={e => updateTypeSchemaField(idx, 'required', e.target.checked)} style={{ marginTop: 10, transform: 'scale(1.2)' }} />
                    </div>
                    <button type="button" onClick={() => removeTypeSchemaField(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', padding: 8, borderRadius: 8, marginTop: 26, display: 'flex' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {typeFormData.custom_fields_schema.length === 0 && (
                  <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: '24px 12px', background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                    No custom fields defined yet.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)} style={{ padding: '10px 24px', borderRadius: 20, fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 20, fontWeight: 600, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', border: 'none' }}>Save Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
