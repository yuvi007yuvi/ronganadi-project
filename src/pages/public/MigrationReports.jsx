import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Users, Briefcase, DollarSign, Home, MapPin, Download } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function MigrationReports() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/migrated_surveys.php')
      .then(data => {
        setSurveys(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Reports...</div>;

  const totalSurveyed = surveys.length;

  const exportToCSV = () => {
    if (surveys.length === 0) return;
    const headers = ['ID', 'Full Name', 'Village', 'Panchayat', 'Current Residence', 'Occupation', 'CTC Salary', 'Take-Home Salary', 'Willing to Return', 'Surveyor', 'Submission Date'];
    const csvRows = [headers.join(',')];
    
    surveys.forEach(s => {
      const row = [
        s.id,
        `"${s.full_name || ''}"`,
        `"${s.village || ''}"`,
        `"${s.panchayat || ''}"`,
        `"${s.current_residence || ''}"`,
        `"${s.occupation || ''}"`,
        s.monthly_salary || '0',
        s.in_hand_salary || '0',
        s.willing_to_return || 'Unknown',
        `"${s.surveyor_name || ''}"`,
        `"${s.created_at || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "migration_survey_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Occupation Distribution
  const occCounts = {};
  surveys.forEach(s => {
    const occ = s.occupation || 'Unknown';
    occCounts[occ] = (occCounts[occ] || 0) + 1;
  });
  const topOccs = Object.entries(occCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const doughnutData = {
    labels: topOccs.map(o => o[0]),
    datasets: [{
      data: topOccs.map(o => o[1]),
      backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'],
      borderWidth: 0,
    }],
  };

  // Salary Range Analysis
  const salaryRanges = { '< 10k': 0, '10k-25k': 0, '25k-50k': 0, '50k+': 0 };
  surveys.forEach(s => {
    const s1 = parseFloat(s.in_hand_salary) || 0;
    if (s1 < 10000) salaryRanges['< 10k']++;
    else if (s1 <= 25000) salaryRanges['10k-25k']++;
    else if (s1 <= 50000) salaryRanges['25k-50k']++;
    else salaryRanges['50k+']++;
  });
  const barData = {
    labels: Object.keys(salaryRanges),
    datasets: [{
      label: 'Citizens',
      data: Object.values(salaryRanges),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6,
    }],
  };

  // Willing to Return
  const willingCounts = { Yes: 0, No: 0, Maybe: 0 };
  surveys.forEach(s => {
    if (willingCounts[s.willing_to_return] !== undefined) {
      willingCounts[s.willing_to_return]++;
    }
  });
  const pieData = {
    labels: ['Yes', 'No', 'Maybe'],
    datasets: [{
      data: [willingCounts.Yes, willingCounts.No, willingCounts.Maybe],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  // Panchayat-wise stats
  const panchayatCounts = {};
  surveys.forEach(s => {
    const p = s.panchayat || 'Unknown';
    panchayatCounts[p] = (panchayatCounts[p] || 0) + 1;
  });

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
  const barOptions = { ...chartOptions, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 10, color: 'var(--gray-900)' }}>Migrated Citizen Reports</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: 30 }}>Public analytics dashboard for migration and employment data.</p>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="glass-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Surveyed</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>{totalSurveyed}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Willing to Return</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>
              {totalSurveyed ? Math.round((willingCounts.Yes / totalSurveyed) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Panchayats Reached</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>{Object.keys(panchayatCounts).length}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 30 }}>
        <div className="glass-panel" style={{ padding: 20, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Salary Range (Take-Home)</h3>
          <div style={{ height: 250 }}>
            {totalSurveyed > 0 ? <Bar data={barData} options={barOptions} /> : <div className="empty-state">No data</div>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Current Occupation</h3>
          <div style={{ height: 250 }}>
            {totalSurveyed > 0 ? <Doughnut data={doughnutData} options={chartOptions} /> : <div className="empty-state">No data</div>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Willingness to Return</h3>
          <div style={{ height: 250 }}>
            {totalSurveyed > 0 ? <Pie data={pieData} options={chartOptions} /> : <div className="empty-state">No data</div>}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--gray-900)' }}>Raw Survey Data (Excel View)</h3>
          <button 
            onClick={exportToCSV}
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderColor: '#10b981', color: '#10b981' }}
          >
            <Download size={16} /> Export to Excel / CSV
          </button>
        </div>
        
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>Citizen Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>Panchayat</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>Current Residence</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>Occupation</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-700)', borderRight: '1px solid #e2e8f0' }}>Salary (Take-Home)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--gray-700)' }}>Willing to Return?</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', color: 'var(--gray-500)' }}>#{s.id}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', fontWeight: 500 }}>{s.full_name}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>{s.panchayat}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>{s.current_residence}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>{s.occupation}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                    ₹{Number(s.in_hand_salary).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: 600,
                      background: s.willing_to_return === 'Yes' ? '#d1fae5' : s.willing_to_return === 'No' ? '#fee2e2' : '#fef3c7',
                      color: s.willing_to_return === 'Yes' ? '#059669' : s.willing_to_return === 'No' ? '#dc2626' : '#d97706'
                    }}>
                      {s.willing_to_return}
                    </span>
                  </td>
                </tr>
              ))}
              {surveys.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
