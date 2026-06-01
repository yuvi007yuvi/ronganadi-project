import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, ArrowRight } from 'lucide-react';

export default function AvailableSurveys() {
  const { customSurveys, loading } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center" style={{ color: 'var(--gray-500)' }}>Loading surveys...</div>;

  const activeSurveys = customSurveys.filter(s => s.status === 'active');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Custom Surveys</h1>
        <p style={{ margin: 0, color: 'var(--gray-500)' }}>Select a survey to fill out</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {activeSurveys.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
            No custom surveys are currently available.
          </div>
        ) : (
          activeSurveys.map(survey => (
            <div key={survey.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 24 }} onClick={() => navigate(`/citizen/fill-survey/${survey.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, background: 'var(--orange-100)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: 'var(--gray-900)' }}>{survey.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                    {Array.isArray(survey.fields_json) ? survey.fields_json.length : 0} Questions
                  </div>
                </div>
              </div>
              {survey.description && (
                <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {survey.description}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: 14, gap: 6 }}>
                Start Survey <ArrowRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
