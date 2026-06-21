import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Database, Users } from 'lucide-react';

export default function ReportsHub() {
  const reports = [
    { title: 'Migrated Reports', path: '/migration-reports', icon: BarChart3, desc: 'View legacy reports migrated from previous systems.', color: '#f59e0b' },
    { title: 'System Reports', path: '/admin/reports', icon: Database, desc: 'View core system analytics, performance, and generated reports.', color: '#3b82f6' },
    { title: 'Citizen Reports', path: '/admin/citizen-reports', icon: Users, desc: 'Analyze data, trends, and feedback submitted directly by citizens.', color: '#10b981' },
    { title: 'All Records', path: '/admin/records', icon: FileText, desc: 'Access a comprehensive, searchable database of all records and logs.', color: '#8b5cf6' },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>Reports Hub</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--gray-500)' }}>Access all analytics, system reports, and historical records from one centralized place.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {reports.map(report => {
          const Icon = report.icon;
          return (
            <Link key={report.path} to={report.path} style={{ textDecoration: 'none' }}>
              <div 
                className="card" 
                style={{ 
                  padding: 24, height: '100%', display: 'flex', flexDirection: 'column', 
                  transition: 'all 0.3s', cursor: 'pointer', border: '1px solid var(--gray-200)', 
                  borderRadius: 16, background: 'white' 
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.transform = 'translateY(-4px)'; 
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; 
                  e.currentTarget.style.borderColor = report.color; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.transform = 'none'; 
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; 
                  e.currentTarget.style.borderColor = 'var(--gray-200)'; 
                }}
              >
                <div style={{ 
                  width: 56, height: 56, borderRadius: 14, background: `${report.color}15`, 
                  color: report.color, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  marginBottom: 20 
                }}>
                  <Icon size={28} />
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>{report.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6, flex: 1 }}>{report.desc}</p>
                <div style={{ 
                  marginTop: 24, display: 'flex', alignItems: 'center', 
                  color: report.color, fontSize: 14, fontWeight: 700 
                }}>
                  View Report <span style={{ marginLeft: 6, transition: 'transform 0.2s' }} className="arrow-icon">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
