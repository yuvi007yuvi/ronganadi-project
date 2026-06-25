import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config/api';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement, Tooltip, Legend, Title, Filler
} from 'chart.js';
import { Users, FileText, CheckCircle, Activity, TrendingUp, Clock, Megaphone, Briefcase, PieChart, Clipboard, ShieldAlert, Grid, Shield, MapPin } from 'lucide-react';
import { allSchemes } from '../../data/schemes.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Title, Filler);

export default function AdminDashboard() {
  const { getStats, citizens, announcements } = useData();
  const stats = getStats();
  const [complaints, setComplaints] = useState([]);
  const [kycStats, setKycStats] = useState(null);

  useEffect(() => {
    apiFetch('/complaints.php')
      .then(data => setComplaints(data || []))
      .catch(console.error);

    apiFetch('/admin_kyc_dashboard.php')
      .then(data => {
        if (data) {
          const actualData = data.data ? data.data : data;
          setKycStats(actualData);
        }
      })
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

  // Registrations over time for Line Chart
  const dateCounts = {};
  citizens.forEach(c => {
    const d = new Date(c.submittedAt || c.submitted_at);
    if (!isNaN(d.getTime())) {
      const dateStr = d.toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }
  });
  
  const sortedDates = Object.keys(dateCounts).sort();
  const last7Dates = sortedDates.slice(-7);
  
  const lineChartData = {
    labels: last7Dates.map(d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Registrations',
      data: last7Dates.map(d => dateCounts[d]),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#f97316',
      pointBorderWidth: 2,
      pointRadius: 4,
    }]
  };

  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  const recentCitizens = [...citizens].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);
  const activeAnnouncements = announcements.filter(a => a.published).slice(0, 3);

  const complaintAreaCounts = {};
  complaints.forEach(c => {
    const area = c.ward || 'Unknown';
    complaintAreaCounts[area] = (complaintAreaCounts[area] || 0) + 1;
  });
  const complaintAreaLabels = Object.keys(complaintAreaCounts);
  const complaintAreaData = Object.values(complaintAreaCounts);

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
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Citizen in Database</div>
                <div className="premium-stat-value text-gradient text-gradient-emerald" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {kycStats?.total_reports || 0}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#10b981', width: 36, height: 36, borderRadius: 10 }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Overall records available</div>
          </div>

          <div className="bento-col-3 glass-card stagger-1 stat-showcase" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95), rgba(243, 232, 255, 0.8))', borderColor: 'rgba(233, 213, 255, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Completed KYC</div>
                <div className="premium-stat-value text-gradient text-gradient-purple" style={{ fontSize: '28px', marginTop: '2px' }}>
                  {kycStats?.kyc_completed || 0}
                </div>
              </div>
              <div className="stat-icon-glass" style={{ color: '#8b5cf6', width: 36, height: 36, borderRadius: 10 }}>
                <Shield size={18} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginTop: 'auto' }}>Citizens verified</div>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Area Pie Chart */}
              <div className="glass-card stagger-3">
                <div className="glass-header">
                  <div>
                    <div className="card-title">Complaints by Area</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Complaints distribution by ward (Pie)</div>
                  </div>
                  <PieChart size={20} color="var(--primary)" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ height: '280px' }}>
                    {complaintAreaLabels.length > 0 ? (
                      <Pie 
                        data={{
                          labels: complaintAreaLabels,
                          datasets: [{
                            data: complaintAreaData,
                            backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'],
                            borderWidth: 0
                          }]
                        }} 
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} 
                      />
                    ) : (
                      <div className="empty-state"><p>No area data yet</p></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Trends Line Chart */}
              <div className="glass-card stagger-4">
                <div className="glass-header">
                  <div>
                    <div className="card-title">Registration Trends</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>New citizens over time</div>
                  </div>
                  <TrendingUp size={20} color="#f97316" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ height: '280px' }}>
                    {sortedDates.length > 0 ? (
                      <Line data={lineChartData} options={lineChartOptions} />
                    ) : (
                      <div className="empty-state"><p>No registration data yet</p></div>
                    )}
                  </div>
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

            {/* Recent Complaints Table */}
            <div className="glass-card stagger-5">
              <div className="glass-header">
                <div className="card-title">Recent Complaints</div>
                <Activity size={18} color="var(--gray-400)" />
              </div>
              <div className="table-wrapper">
                <table className="data-table" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Ticket ID</th>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Complaint</th>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Status</th>
                      <th style={{ background: 'rgba(255,255,255,0.4)' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...complaints].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)).slice(0, 5).map(c => (
                      <tr key={c.id}>
                        <td>
                          {c.ticket_id ? (
                            <span style={{ fontFamily: 'monospace', background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              {c.ticket_id}
                            </span>
                          ) : (
                            <span style={{ color: '#c2410c', fontSize: 11, fontWeight: 700 }}>No Ticket</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{c.category}</div>
                        </td>
                        <td>
                          <span className="pill" style={{ 
                            background: c.status === 'completed' ? '#dcfce7' : (c.ticket_id ? '#eff6ff' : '#ffedd5'), 
                            color: c.status === 'completed' ? '#16a34a' : (c.ticket_id ? '#3b82f6' : '#ea580c'), 
                            border: '1px solid rgba(0,0,0,0.05)', fontSize: 10 
                          }}>
                            {c.status === 'completed' ? 'Completed' : (c.ticket_id ? 'In Progress' : 'Pending')}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>{new Date(c.submitted_at).toLocaleDateString('en-IN')}</span></td>
                      </tr>
                    ))}
                    {complaints.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>No complaints yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Side Area: Small Stats, Doughnuts & Actions */}
          <div className="bento-col-4 flex flex-col gap-6">
            
            {/* Recent KYC Data Card */}
            <div className="glass-card stagger-4" style={{ background: 'rgba(239, 246, 255, 0.3)' }}>
              <div className="glass-header">
                <div className="card-title">Recent KYC Completions</div>
                <Shield size={18} color="#3b82f6" />
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {kycStats?.records?.filter(r => r.kyc_status === 'completed').slice(0, 5).map(r => (
                    <div key={r.citizen_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>{r.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4, fontFamily: 'monospace', fontWeight: 600 }}>{r.kyc_number}</div>
                      </div>
                      <span className="pill" style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, padding: '4px 10px', fontWeight: 700, border: '1px solid #bbf7d0' }}>Verified</span>
                    </div>
                  ))}
                  {(!kycStats?.records || kycStats.records.filter(r => r.kyc_status === 'completed').length === 0) && (
                    <div className="empty-state" style={{ padding: 20 }}><p>No recent KYC data</p></div>
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
