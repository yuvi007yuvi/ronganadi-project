import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, FileText, ClipboardList } from 'lucide-react';

export default function ManageSurveys() {
  const { customSurveys, deleteCustomSurvey, loading } = useData();
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center" style={{ color: 'var(--gray-500)' }}>Loading surveys...</div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Custom Surveys</h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>Manage your custom survey forms</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/build-survey')}>
          <Plus size={18} /> Create New Survey
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Survey Title</th>
                <th>Questions</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customSurveys.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-500)' }}>
                    No custom surveys created yet.
                  </td>
                </tr>
              ) : (
                customSurveys.map(survey => {
                  const assignedCount = Array.isArray(survey.assigned_to) ? survey.assigned_to.length : 0;
                  return (
                  <tr key={survey.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: 'var(--orange-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} color="var(--primary)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{survey.title}</div>
                          {survey.description && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{survey.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{Array.isArray(survey.fields_json) ? survey.fields_json.length : 0} fields</td>
                    <td>{assignedCount > 0 ? `${assignedCount} Surveyors` : 'None'}</td>
                    <td>
                      <span className={`status-badge status-${survey.status}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td>{new Date(survey.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', color: '#ef4444', background: '#fee2e2', border: 'none' }}
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this survey? All responses will be deleted too.')) {
                            deleteCustomSurvey(survey.id);
                          }
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
