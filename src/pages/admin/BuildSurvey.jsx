import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function BuildSurvey() {
  const navigate = useNavigate();
  const { addCustomSurvey, surveyors } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]); // Array of surveyor IDs
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setFields([...fields, { id: Date.now(), label: '', type: 'text', required: false, options: '' }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const toggleSurveyor = (id) => {
    setAssignedTo(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllSurveyors = () => {
    const activeSurveyors = surveyors.filter(s => s.status === 'active');
    if (assignedTo.length === activeSurveyors.length) {
      setAssignedTo([]);
    } else {
      setAssignedTo(activeSurveyors.map(s => s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || fields.length === 0) {
      alert("Please provide a title and at least one question.");
      return;
    }

    setLoading(true);
    // clean up fields for JSON
    const cleanFields = fields.map(f => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.type === 'select' ? f.options.split(',').map(s => s.trim()).filter(Boolean) : []
    }));

    await addCustomSurvey({
      title,
      description,
      fields_json: cleanFields,
      assigned_to: assignedTo,
      status: 'active'
    });

    setLoading(false);
    navigate('/admin/custom-surveys');
  };

  const activeSurveyors = (surveyors || []).filter(s => s.status === 'active');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/custom-surveys')} style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Survey Builder</h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>Create a custom survey form</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label required">Survey Title</label>
            <input 
              className="form-control" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Health Assessment 2026"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description (Optional)</label>
            <textarea 
              className="form-control" 
              rows={2} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Instructions for the surveyor..."
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Questions</h3>
        <button className="btn btn-secondary" onClick={addField} type="button">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="card mb-6" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
          No questions added yet. Click "Add Question" to start building your survey.
        </div>
      ) : (
        fields.map((field, index) => (
          <div className="card mb-4" key={field.id} style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div className="form-grid">
                    <div className="form-group form-col-span-2">
                      <label className="form-label">Question Label</label>
                      <input 
                        className="form-control" 
                        value={field.label} 
                        onChange={e => updateField(field.id, 'label', e.target.value)} 
                        placeholder="e.g. What is your age?"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Answer Type</label>
                      <select 
                        className="form-control" 
                        value={field.type} 
                        onChange={e => updateField(field.id, 'type', e.target.value)}
                      >
                        <option value="text">Short Answer (Text)</option>
                        <option value="textarea">Long Answer (Paragraph)</option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown Menu</option>
                        <option value="checkbox">Yes/No Checkbox</option>
                        <option value="file">Image / Document Upload</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={field.required} 
                          onChange={e => updateField(field.id, 'required', e.target.checked)}
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ fontWeight: 500 }}>Required Field</span>
                      </label>
                    </div>
                  </div>

                  {field.type === 'select' && (
                    <div className="form-group mt-2">
                      <label className="form-label">Dropdown Options (comma separated)</label>
                      <input 
                        className="form-control" 
                        value={field.options} 
                        onChange={e => updateField(field.id, 'options', e.target.value)} 
                        placeholder="e.g. Red, Blue, Green"
                      />
                    </div>
                  )}
                </div>
                <button 
                  className="btn" 
                  style={{ background: '#fee2e2', color: '#ef4444', padding: 8 }}
                  onClick={() => removeField(field.id)}
                  title="Remove Question"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {fields.length > 0 && (
        <>
          <div className="card mb-6">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Assign to Surveyors</h3>
                <button className="btn btn-secondary btn-sm" onClick={toggleAllSurveyors} type="button">
                  {assignedTo.length === activeSurveyors.length && activeSurveyors.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 12 }}>
                {activeSurveyors.length === 0 ? (
                  <div style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '12px 0' }}>No active surveyors found.</div>
                ) : (
                  activeSurveyors.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)' }}>
                      <input 
                        type="checkbox" 
                        checked={assignedTo.includes(s.id)}
                        onChange={() => toggleSurveyor(s.id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{s.assignedArea || 'No area'}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', paddingBottom: 40 }}>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : <><Save size={18} /> Save Survey</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
