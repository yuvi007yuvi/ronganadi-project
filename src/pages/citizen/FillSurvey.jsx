import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config/api';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function FillSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customSurveys } = useData();
  const { currentUser } = useAuth();
  
  const survey = customSurveys.find(s => s.id == id);
  
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});

  if (!survey) return <div className="p-8 text-center" style={{ color: 'var(--gray-500)' }}>Survey not found.</div>;

  const fields = Array.isArray(survey.fields_json) ? survey.fields_json : [];

  const handleFieldChange = (label, value) => {
    setResponses(prev => ({ ...prev, [label]: value }));
    if (errors[label]) {
      setErrors(prev => ({ ...prev, [label]: null }));
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 1200;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (label, file) => {
    if (!file) return;
    setUploadingFields(prev => ({ ...prev, [label]: true }));

    try {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
      }

      const formData = new FormData();
      formData.append('file', processedFile);

      const res = await apiFetch('/upload_image.php', {
        method: 'POST',
        body: formData
      });

      if (res && res.url) {
        handleFieldChange(label, res.url);
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error(err);
      alert('File upload failed: ' + err.message);
    } finally {
      setUploadingFields(prev => ({ ...prev, [label]: false }));
    }
  };

  const validate = () => {
    const e = {};
    fields.forEach(f => {
      if (f.required) {
        const val = responses[f.label];
        if (f.type === 'checkbox') {
          // checkbox skip strict check
        } else if (!val || (typeof val === 'string' && !val.trim())) {
          e[f.label] = 'This field is required';
        }
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setTimeout(() => {
        const firstError = document.querySelector('.error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setLoading(true);
    
    try {
      await apiFetch('/custom_survey_responses.php', {
        method: 'POST',
        body: {
          survey_id: survey.id,
          citizen_phone: currentUser?.mobile || '',
          responses_json: responses
        }
      });
      setSaved(true);
      setTimeout(() => {
        navigate('/citizen/surveys');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to submit survey');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
          <div style={{ width: 80, height: 80, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>
            Survey Submitted!
          </h2>
          <p style={{ color: 'var(--gray-500)' }}>Redirecting to survey list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/citizen/surveys')} style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>{survey.title}</h1>
          {survey.description && <p style={{ margin: '4px 0 0', color: 'var(--gray-500)' }}>{survey.description}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit}>


        {fields.map((field, index) => (
          <div className="card mb-4" key={index}>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className={`form-label ${field.required ? 'required' : ''}`} style={{ fontSize: 16, marginBottom: 12 }}>
                  {field.label}
                </label>
                
                {field.type === 'text' && (
                  <input 
                    className={`form-control ${errors[field.label] ? 'error' : ''}`}
                    value={responses[field.label] || ''}
                    onChange={e => handleFieldChange(field.label, e.target.value)}
                    placeholder="Enter answer"
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea 
                    className={`form-control ${errors[field.label] ? 'error' : ''}`}
                    rows={3}
                    value={responses[field.label] || ''}
                    onChange={e => handleFieldChange(field.label, e.target.value)}
                    placeholder="Enter detailed answer"
                  />
                )}
                
                {field.type === 'number' && (
                  <input 
                    type="number"
                    className={`form-control ${errors[field.label] ? 'error' : ''}`}
                    value={responses[field.label] || ''}
                    onChange={e => handleFieldChange(field.label, e.target.value)}
                    placeholder="0"
                  />
                )}
                
                {field.type === 'select' && (
                  <select 
                    className={`form-control ${errors[field.label] ? 'error' : ''}`}
                    value={responses[field.label] || ''}
                    onChange={e => handleFieldChange(field.label, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {(field.options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'checkbox' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 0' }}>
                    <input 
                      type="checkbox" 
                      checked={!!responses[field.label]}
                      onChange={e => handleFieldChange(field.label, e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <span>Yes</span>
                  </label>
                )}

                {field.type === 'file' && (
                  <div>
                    {responses[field.label] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--primary)' }}>
                          <a href={responses[field.label]} target="_blank" rel="noreferrer">{responses[field.label].split('/').pop()}</a>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleFieldChange(field.label, '')}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          capture="environment"
                          className={`form-control ${errors[field.label] ? 'error' : ''}`}
                          onChange={e => handleFileUpload(field.label, e.target.files[0])}
                          disabled={uploadingFields[field.label]}
                        />
                        {uploadingFields[field.label] && (
                          <div style={{ position: 'absolute', right: 12, top: 10, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                            Uploading...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {errors[field.label] && (
                  <div className="form-error mt-2"><AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />{errors[field.label]}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingBottom: 40 }}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/citizen/surveys')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Submitting...' : <><Save size={18} /> Submit Survey</>}
          </button>
        </div>
      </form>
    </div>
  );
}
