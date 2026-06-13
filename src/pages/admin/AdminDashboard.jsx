import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config/api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Users, FileText, CheckCircle, Activity, TrendingUp, Clock, Megaphone, Briefcase, PieChart, Clipboard, ShieldAlert, Grid, Shield, MapPin } from 'lucide-react';
import { allSchemes } from '../../data/schemes.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function AdminDashboard() {
  const { getStats, citizens, announcements } = useData();
  const stats = getStats();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    apiFetch('/complaints.php')
      .then(data => setComplaints(data || []))
      .catch(console.error);
  }, []);

  const totalComplaints = complaints.length;
  const ticketsGenerated = complaints.filter(c => c.ticket_id).length;
  const ticketsPending = complaints.filter(c => c.ticket_id && c.status !== 'completed').length;

  // Area-wise chart
  const areaLabels = Object.keys(stats.areaWise);
  const areaData = Object.values(stats.areaWise);

  const barData = {
    labels: areaLabels.map(l => l.length > 18 ? l.slice(0, 18) + '…' : l),
    datasets: [{
      label: 'Surveys',
      data: areaData,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6,
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

  // Demographics (Caste) chart
  const casteLabels = Object.keys(stats.castes || {});
  const casteData = Object.values(stats.castes || {});
  const casteChartData = {
    labels: casteLabels,
    datasets: [{
      label: 'Citizens',
      data: casteData,
      backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'],
      borderRadius: 4,
    }],
  };

  // Occupation chart
  const occLabels = Object.keys(stats.occupations || {});
  const occData = Object.values(stats.occupations || {});
  const occChartData = {
    labels: occLabels.map(l => l.length > 15 ? l.slice(0, 15) + '…' : l),
    datasets: [{
      data: occData,
      backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
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
  const activeAnnouncements = announcements.filter(a => a.published).slice(0, 3);

  const awarenessRate = stats.totalCitizens > 0 ? Math.round((stats.schemeBeneficiaries / stats.totalCitizens) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Background animated orbs for premium feel */}
      <div className="dashboard-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="animate-fadeIn">
        {/* Comprehensive Modules Overview (8 Small Cards) */}
        <div className="premium-grid" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          
          <div className="bento-col-3 glass-card stagger-1 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.8))', borderColor: 'rgba(191, 219, 254, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Citizens</div>
                <div className="premium-stat-value text-gradient text-gradient-primary" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {stats.totalCitizens}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: 'var(--primary)', width: 36, height: 36, borderRadius: 10 }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Registered users</div>
          </div>

          <div className="bento-col-3 glass-card stagger-1 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(224, 231, 255, 0.8))', borderColor: 'rgba(199, 210, 254, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Survey Responses</div>
                <div className="premium-stat-value text-gradient text-gradient-blue" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {stats.surveyResponsesCount || 0}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#3b82f6', width: 36, height: 36, borderRadius: 10 }}>
                <FileText size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Completed surveys</div>
          </div>

          <div className="bento-col-3 glass-card stagger-1 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(209, 250, 229, 0.8))', borderColor: 'rgba(167, 243, 208, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom Forms</div>
                <div className="premium-stat-value text-gradient text-gradient-emerald" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {stats.customSurveysCount || 0}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#10b981', width: 36, height: 36, borderRadius: 10 }}>
                <Grid size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Active survey templates</div>
          </div>

          <div className="bento-col-3 glass-card stagger-1 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95), rgba(243, 232, 255, 0.8))', borderColor: 'rgba(233, 213, 255, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Beneficiaries</div>
                <div className="premium-stat-value text-gradient text-gradient-purple" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {stats.schemeBeneficiaries}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#8b5cf6', width: 36, height: 36, borderRadius: 10 }}>
                <CheckCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>{awarenessRate}% awareness rate</div>
          </div>

          <div className="bento-col-3 glass-card stagger-2 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.8))', borderColor: 'rgba(254, 202, 202, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Complaint Received</div>
                <div className="premium-stat-value text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #ef4444, #b91c1c)', fontSize: '28px', marginTop: '2px' }}>
                  {totalComplaints}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#ef4444', width: 36, height: 36, borderRadius: 10 }}>
                <Activity size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Total submissions</div>
          </div>

          <div className="bento-col-3 glass-card stagger-2 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(253, 242, 248, 0.95), rgba(252, 231, 243, 0.8))', borderColor: 'rgba(251, 207, 232, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Complaint Approved</div>
                <div className="premium-stat-value text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #db2777, #be185d)', fontSize: '28px', marginTop: '2px' }}>
                  {ticketsGenerated}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#db2777', width: 36, height: 36, borderRadius: 10 }}>
                <Clipboard size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Official active complaints</div>
          </div>

          <div className="bento-col-3 glass-card stagger-2 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 237, 213, 0.8))', borderColor: 'rgba(253, 186, 116, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending Complaints</div>
                <div className="premium-stat-value text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #ea580c, #c2410c)', fontSize: '28px', marginTop: '2px' }}>
                  {ticketsPending}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#ea580c', width: 36, height: 36, borderRadius: 10 }}>
                <ShieldAlert size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Awaiting resolution</div>
          </div>

          <div className="bento-col-3 glass-card stagger-2 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(254, 243, 199, 0.8))', borderColor: 'rgba(253, 230, 138, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Announcements</div>
                <div className="premium-stat-value text-gradient text-gradient-primary" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {stats.activeAnnouncementsCount || 0}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: 'var(--primary)', width: 36, height: 36, borderRadius: 10 }}>
                <Megaphone size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Active broadcasts</div>
          </div>

        </div>

        <div className="premium-grid">
          {/* Main Charts Area */}
          <div className="bento-col-8 flex flex-col gap-6">
            
            {/* Area Chart */}
            <div className="glass-card stagger-3">
              <div className="glass-header">
                <div>
                  <div className="card-title">Area-wise Survey Count</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Citizen records by area/ward</div>
                </div>
                <Activity size={20} color="var(--primary)" />
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '320px' }}>
                  {areaLabels.length > 0 ? (
                    <Bar data={barData} options={chartOptions} />
                  ) : (
                    <div className="empty-state"><p>No survey data yet</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Demographics Chart */}
            <div className="glass-card stagger-4">
              <div className="glass-header">
                <div>
                  <div className="card-title">Demographics (Caste Breakdown)</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Citizen distribution by caste category</div>
                </div>
                <PieChart size={20} color="#3b82f6" />
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '320px' }}>
                  {casteLabels.length > 0 ? (
                    <Bar data={casteChartData} options={chartOptions} />
                  ) : (
                    <div className="empty-state"><p>No demographic data yet</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Surveys Table */}
            <div className="glass-card stagger-5">
              <div className="glass-header">
                <div className="card-title">Recent Citizen Registrations</div>
                <Clock size={18} color="var(--gray-400)" />
              </div>
              <div className="table-wrapper">
                <table className="data-table" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Citizen</th>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Area</th>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCitizens.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange-100), white)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                              {c.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{c.fullName}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{c.mobile}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="pill" style={{ background: 'rgba(255,255,255,0.8)', color: 'var(--gray-700)', border: '1px solid rgba(0,0,0,0.05)' }}>{c.area}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>{new Date(c.submittedAt || c.submitted_at).toLocaleDateString('en-IN')}</span></td>
                      </tr>
                    ))}
                    {recentCitizens.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>No citizens yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Side Area: Small Stats, Doughnuts & Actions */}
          <div className="bento-col-4 flex flex-col gap-6">
            
            {/* Quick Actions */}
            <div className="glass-card stagger-3" style={{ background: 'linear-gradient(135deg, rgba(255,237,213,0.8), rgba(255,255,255,0.4))', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div className="glass-header" style={{ borderBottom: 'none', paddingBottom: '12px' }}>
                <div className="card-title text-gradient text-gradient-primary">Quick Actions</div>
              </div>
              <div className="card-body" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="/admin/build-survey" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                  <FileText size={18} /> Create Custom Survey
                </a>
              </div>
            </div>

            <div className="glass-card stagger-4">
              <div className="glass-header">
                <div className="card-title">Top Schemes Availed</div>
                <CheckCircle size={18} color="#10b981" />
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div className="chart-container" style={{ height: '240px' }}>
                  {topSchemes.length > 0 ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <div className="empty-state"><p>No scheme data yet</p></div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card stagger-5">
              <div className="glass-header">
                <div className="card-title">Occupation Breakdown</div>
                <Briefcase size={18} color="#f97316" />
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div className="chart-container" style={{ height: '240px' }}>
                  {occLabels.length > 0 ? (
                    <Doughnut data={occChartData} options={doughnutOptions} />
                  ) : (
                    <div className="empty-state"><p>No occupation data yet</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="glass-card stagger-5">
              <div className="glass-header">
                <div className="card-title">Recent Announcements</div>
                <Megaphone size={18} color="#ec4899" />
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeAnnouncements.map(a => (
                    <div key={a.id} style={{ padding: 16, background: 'rgba(255,255,255,0.5)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6, fontWeight: 500 }}>Valid until {new Date(a.expiresAt || a.expires_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {activeAnnouncements.length === 0 && (
                    <div className="empty-state" style={{ padding: 20 }}><p>No active announcements</p></div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
