import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { 
  Plus, Trash2, Edit, MapPin, Search, Server, 
  Layers, ShieldAlert, Activity, Navigation, Settings
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
    name: '', icon_type: 'default', status: 'active', custom_fields_schema: []
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
      
      // MOCK DATA FALLBACK IF API FAILS (e.g. 404 or 502)
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
        name: type.name, icon_type: type.icon_type || 'default', status: type.status || 'active',
        custom_fields_schema: type.custom_fields_schema || []
      });
    } else {
      setEditingTypeId(null);
      setTypeFormData({ name: '', icon_type: 'default', status: 'active', custom_fields_schema: [] });
    }
    setShowTypeModal(true);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>
            Dynamic GIS Facilities
          </h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>
            Manage map locations and define custom facility structures
          </p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 12, padding: 4 }}>
          {['facilities', 'types'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                background: activeTab === tab ? 'white' : 'none',
                color: activeTab === tab ? 'var(--primary)' : 'var(--gray-600)',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'types' ? 'Facility Types' : 'Manage Locations'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading data...</div>
      ) : (
        <>
          {activeTab === 'facilities' && (
            <div className="card animate-fadeIn" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Mapped Facilities</h3>
                <button className="btn btn-primary" onClick={() => openFacModal()}>
                  <MapPin size={16} /> Add Facility
                </button>
              </div>

              <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name & Info</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Ward</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map(fac => (
                      <tr key={fac.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{fac.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{fac.address}</div>
                        </td>
                        <td>
                          <span className="pill pill-blue">{fac.type_name}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                            Lat: {fac.latitude.toFixed(4)}<br/>Lng: {fac.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td>{fac.ward_number}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openFacModal(fac)}>
                              <Edit size={14} /> Edit
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteFacility(fac.id)} style={{ color: 'var(--danger)', borderColor: '#fee2e2' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {facilities.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No facilities mapped yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="card animate-fadeIn" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Dynamic Facility Types</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>Define categories and their custom data fields.</p>
                </div>
                <button className="btn btn-primary" onClick={() => openTypeModal()}>
                  <Layers size={16} /> Add New Type
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {facilityTypes.map(type => (
                  <div key={type.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, background: '#fafbff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--gray-900)' }}>{type.name}</h4>
                        <span className={`pill ${type.status === 'active' ? 'pill-green' : 'pill-gray'}`} style={{ fontSize: 11 }}>{type.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openTypeModal(type)} style={{ padding: 6 }}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteType(type.id)} style={{ padding: 6, color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-600)', background: 'white', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                      <strong>Custom Fields ({type.custom_fields_schema?.length || 0}):</strong>
                      <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                        {type.custom_fields_schema?.map((f, i) => (
                          <li key={i}>{f.label} ({f.type}) {f.required ? '*' : ''}</li>
                        ))}
                        {(!type.custom_fields_schema || type.custom_fields_schema.length === 0) && <li>No custom fields.</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showFacModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 800, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>
              {editingFacId ? 'Edit Facility Location' : 'Map New Facility'}
            </h2>
            <form onSubmit={handleSaveFacility} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Facility Category / Type *</label>
                <select 
                  className="form-control" 
                  value={facFormData.type_id} 
                  onChange={e => setFacFormData({...facFormData, type_id: e.target.value, custom_fields_data: {}})} 
                  required
                >
                  <option value="">-- Select Type --</option>
                  {facilityTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {facFormData.type_id && (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: 15, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 0, color: 'var(--primary)' }}>
                      Fixed Fields (Required)
                    </h3>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Facility Name *</label>
                    <input type="text" className="form-control" value={facFormData.name} onChange={e => setFacFormData({...facFormData, name: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Ward Number *</label>
                    <input type="text" className="form-control" value={facFormData.ward_number} onChange={e => setFacFormData({...facFormData, ward_number: e.target.value})} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address *</label>
                    <textarea className="form-control" rows="2" value={facFormData.address} onChange={e => setFacFormData({...facFormData, address: e.target.value})} required></textarea>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Pin Location on Map *</label>
                    <div style={{ height: 300, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--gray-200)' }}>
                      <MapContainer center={[facFormData.latitude, facFormData.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <LocationPicker 
                          position={[facFormData.latitude, facFormData.longitude]} 
                          setPosition={([lat, lng]) => setFacFormData({...facFormData, latitude: lat, longitude: lng})} 
                        />
                      </MapContainer>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
                      Lat: {facFormData.latitude}, Lng: {facFormData.longitude}
                    </div>
                  </div>

                  {getSelectedTypeSchema().length > 0 && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <h3 style={{ fontSize: 15, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 12, color: 'var(--primary)', marginTop: 12 }}>
                        Dynamic Fields (Based on Type)
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {getSelectedTypeSchema().map((field, idx) => (
                          <div key={idx} className="form-group">
                            <label className="form-label">{field.label} {field.required && '*'}</label>
                            {field.type === 'boolean' ? (
                              <select 
                                className="form-control" 
                                value={facFormData.custom_fields_data[field.name] || ''} 
                                onChange={e => handleCustomFieldChange(field.name, e.target.value)}
                                required={field.required}
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
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFacModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTypeModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 700, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>
              {editingTypeId ? 'Edit Facility Type' : 'Create Facility Type'}
            </h2>
            <form onSubmit={handleSaveType}>
              
              <div className="form-group">
                <label className="form-label">Type Name (e.g. Office, Toilet, Water Tank) *</label>
                <input type="text" className="form-control" value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} required />
              </div>

              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 15 }}>Custom Dynamic Fields</h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addTypeSchemaField}>
                    <Plus size={14} /> Add Field
                  </button>
                </div>
                
                {typeFormData.custom_fields_schema.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, background: 'white', padding: 12, borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Field Name (Key) *</label>
                      <input type="text" className="form-control" placeholder="e.g. doctor_name" value={field.name} onChange={e => updateTypeSchemaField(idx, 'name', e.target.value)} required style={{ padding: '6px 10px', fontSize: 13 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Display Label *</label>
                      <input type="text" className="form-control" placeholder="e.g. Doctor Name" value={field.label} onChange={e => updateTypeSchemaField(idx, 'label', e.target.value)} required style={{ padding: '6px 10px', fontSize: 13 }} />
                    </div>
                    <div style={{ width: 100 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Type</label>
                      <select className="form-control" value={field.type} onChange={e => updateTypeSchemaField(idx, 'type', e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }}>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="time">Time</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                    </div>
                    <div style={{ width: 70, textAlign: 'center' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Required</label>
                      <input type="checkbox" checked={field.required} onChange={e => updateTypeSchemaField(idx, 'required', e.target.checked)} style={{ marginTop: 8 }} />
                    </div>
                    <button type="button" onClick={() => removeTypeSchemaField(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '24px 0 0 0' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {typeFormData.custom_fields_schema.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center', padding: 12 }}>No custom fields defined.</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
