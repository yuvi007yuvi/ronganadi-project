import { useData } from '../../context/DataContext';
import StatCard from '../../components/StatCard';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Users, FileText, CheckCircle, Activity, TrendingUp, Clock } from 'lucide-react';
import { allSchemes } from '../../data/schemes.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function AdminDashboard() {
  const { getStats, citizens } = useData();
  const stats = getStats();

  // Area-wise chart
  const areaLabels = Object.keys(stats.areaWise);
  const areaData = Object.values(stats.areaWise);

  const barData = {
    labels: areaLabels.map(l => l.length > 18 ? l.slice(0, 18) + '…' : l),
    datasets: [{
      label: 'Surveys',
      data: areaData,
      backgroundColor: areaLabels.map((_, i) => `hsla(${25 + i * 15}, 85%, ${55 + (i % 3) * 5}%, 0.85)`),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Scheme beneficiary doughnut
  const schemeCounts = {};
  citizens.forEach(c => {
    c.schemesAvailed?.forEach(sid => {
      schemeCounts[sid] = (schemeCounts[sid] || 0) + 1;
    });
  });
  const topSchemes = Object.entries(schemeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const doughnutData = {
    labels: topSchemes.map(([id]) => {
      const s = allSchemes.find(x => x.id === id);
      return s ? (s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name) : id;
    }),
    datasets: [{
      data: topSchemes.map(([, v]) => v),
      backgroundColor: ['#f97316', '#fb923c', '#fdba74', '#10b981', '#3b82f6', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
    },
    cutout: '65%',
  };

  const recentCitizens = [...citizens].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);

  return (
    <div className="animate-fadeIn">
      
      {/* Top Stats - Full Width */}
      <div className="bento-col-12 stat-grid" style={{ marginBottom: 0 }}>
        <StatCard
          label="Total Surveys"
          value={stats.totalCitizens}
          sub="Citizen records collected"
          icon={FileText}
          color="var(--primary)"
          iconBg="var(--orange-50)"
        />
        <StatCard
          label="Custom Surveys"
          value={stats.customSurveysCount || 0}
          sub="Available custom surveys"
          icon={Activity}
          color="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatCard
          label="Scheme Beneficiaries"
          value={stats.schemeBeneficiaries}
          sub="Citizens availing schemes"
          icon={CheckCircle}
          color="#10b981"
          iconBg="#d1fae5"
        />
        <StatCard
          label="Schemes Awareness"
          value={`${stats.totalCitizens > 0 ? Math.round((stats.schemeBeneficiaries / stats.totalCitizens) * 100) : 0}%`}
          sub="Beneficiary rate"
          icon={TrendingUp}
          color="#8b5cf6"
          iconBg="#ede9fe"
        />
      </div>

      <div className="bento-grid">
        {/* Main Charts Area */}
        <div className="bento-col-8 flex flex-col gap-4">
          <div className="card h-full">
            <div className="card-header">
              <div>
                <div className="card-title">Area-wise Survey Count</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Citizen records by area/ward</div>
              </div>
              <Activity size={18} color="var(--primary)" />
            </div>
            <div className="card-body">
              <div className="chart-container">
                {areaLabels.length > 0 ? (
                  <Bar data={barData} options={chartOptions} />
                ) : (
                  <div className="empty-state"><p>No survey data yet</p></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Area: Quick Actions & Doughnut */}
        <div className="bento-col-4 flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Actions */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--orange-50), white)' }}>
            <div className="card-header" style={{ paddingBottom: '12px' }}>
              <div className="card-title">Quick Actions</div>
            </div>
            <div className="card-body" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="/admin/build-survey" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                <FileText size={16} /> Create Custom Survey
              </a>

            </div>
          </div>

          <div className="card h-full">
            <div className="card-header">
              <div className="card-title">Top Schemes Availed</div>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              <div className="chart-container" style={{ height: '240px' }}>
                {topSchemes.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className="empty-state"><p>No scheme data yet</p></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Area: Recent Surveys & Performance */}
        <div className="bento-col-8">
          <div className="card h-full">
            <div className="card-header">
              <div className="card-title">Recent Surveys</div>
              <Clock size={16} color="var(--gray-400)" />
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Area</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCitizens.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orange-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                            {c.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{c.fullName}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{c.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="pill pill-gray">{c.area}</span></td>
                      <td><span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(c.submitted_at || c.submittedAt).toLocaleDateString('en-IN')}</span></td>
                    </tr>
                  ))}
                  {recentCitizens.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>No surveys yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
