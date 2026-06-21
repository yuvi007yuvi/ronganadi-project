import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { Users, ShieldCheck, Search, Eye, X, Download, FileSpreadsheet, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminKycDashboard() {
  const [stats, setStats] = useState({ total_users: 0, kyc_completed: 0, total_reports: 0, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin_kyc_dashboard.php');
      if (data) {
        setStats(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch KYC data');
    } finally {
      setLoading(false);
    }
  };

  const verifiedRecords = stats.records.filter(r => r.kyc_status === 'completed');
  
  const filteredVerified = verifiedRecords.filter(r => 
    r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile?.includes(searchTerm) ||
    r.kyc_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.kyc_id_number?.includes(searchTerm)
  );

  const pending_kyc = stats.total_users - stats.kyc_completed;

  const exportToExcel = () => {
    const exportData = filteredVerified.map(r => ({
      'KYC Number': r.kyc_number || 'Pending',
      'Name': r.full_name,
      'Mobile': r.mobile,
      'ID Type': r.kyc_id_type,
      'ID Number': r.kyc_id_number,
      'Panchayat': r.panchayat,
      'Booth': r.booth_no_name,
      'Police Station': r.police_station,
      'District': r.district,
      'PIN Code': r.pin_code,
      'Father/Husband Name': r.father_husband_name,
      'Guardian Name': r.guardian_name,
      'Village/Address': r.village_address,
      'Caste': r.caste,
      'Religion': r.religion,
      'Family > 18': r.family_above_18,
      'Family < 18': r.family_below_18,
      'Aadhaar No': r.aadhaar_no,
      'Voter ID': r.voter_id,
      'PAN': r.pan,
      'Ration Card': r.ration_card_no,
      'Disability UID': r.disability_uid,
      'Bank Account': r.bank_account_no,
      'Bank Branch': r.branch_name,
      'IFSC': r.ifsc,
      'Alternate Mobile': r.alternate_no,
      'Schemes Applied': r.schemes_applied,
      'Schemes Included': r.schemes_included,
      'Help Done': r.help_done,
      'KYC Date': new Date(r.kyc_date).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KYC_Records");
    XLSX.writeFile(wb, "Citizen_KYC_Records.xlsx");
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Citizen KYC Status</h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>Monitor and manage citizen KYC verifications</p>
        </div>
        <button className="btn btn-primary" onClick={exportToExcel} disabled={filteredVerified.length === 0}>
          <Download size={18} /> Export to Excel
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 24 }}>
        <div className="card bento-item" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, var(--blue-50), white)', border: '1px solid var(--blue-200)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Citizen</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>{stats.total_reports}</div>
          </div>
        </div>

        <div className="card bento-item" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, var(--orange-50), white)', border: '1px solid var(--orange-200)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--orange-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Reg. Users</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>{stats.total_users}</div>
          </div>
        </div>

        <div className="card bento-item" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, #f0fdf4, white)', border: '1px solid #bbf7d0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Completed KYC</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>{stats.kyc_completed}</div>
          </div>
        </div>

        <div className="card bento-item" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, #fffbeb, white)', border: '1px solid #fde68a' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending KYC</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>{pending_kyc}</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card bento-item">
        <div className="card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ margin: 0 }}>Verified Citizens</h3>
          <div className="search-bar" style={{ width: '100%', maxWidth: 300 }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile, KYC No..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>KYC Number</th>
                <th>Citizen Name</th>
                <th>Mobile</th>
                <th>ID Details</th>
                <th>Panchayat</th>
                <th>Booth</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerified.map(record => (
                <tr key={record.citizen_id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{record.kyc_number}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{record.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Verified</div>
                  </td>
                  <td>{record.mobile}</td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{record.kyc_id_type}</div>
                    <div style={{ fontWeight: 500 }}>{record.kyc_id_number}</div>
                  </td>
                  <td>{record.panchayat || '-'}</td>
                  <td>{record.booth_no_name || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(record)}>
                      <Eye size={16} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVerified.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-500)' }}>
                    No verified KYC records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Record Details Modal */}
      {selectedRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>KYC Details: {selectedRecord.full_name}</h3>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontFamily: 'monospace', marginTop: 4, fontWeight: 600 }}>{selectedRecord.kyc_number}</div>
              </div>
              <button onClick={() => setSelectedRecord(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="card-body" style={{ padding: 24, overflowY: 'auto' }}>
              
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>Personal Information</h4>
                <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <DetailItem label="Full Name" value={selectedRecord.full_name} />
                  <DetailItem label="Father/Husband Name" value={selectedRecord.father_husband_name} />
                  <DetailItem label="Guardian Name" value={selectedRecord.guardian_name} />
                  <DetailItem label="Mobile No" value={selectedRecord.mobile} />
                  <DetailItem label="Alternate No" value={selectedRecord.alternate_no} />
                  <DetailItem label="Caste" value={selectedRecord.caste} />
                  <DetailItem label="Religion" value={selectedRecord.religion} />
                  <DetailItem label="Disability/UID" value={selectedRecord.disability_uid} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>Location Details</h4>
                <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <DetailItem label="Village/Address" value={selectedRecord.village_address} />
                  <DetailItem label="Panchayat" value={selectedRecord.panchayat} />
                  <DetailItem label="Booth No & Name" value={selectedRecord.booth_no_name} />
                  <DetailItem label="Police Station" value={selectedRecord.police_station} />
                  <DetailItem label="District" value={selectedRecord.district} />
                  <DetailItem label="PIN Code" value={selectedRecord.pin_code} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>Identity Documents</h4>
                <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <DetailItem label="Verified ID Type" value={selectedRecord.kyc_id_type} highlight />
                  <DetailItem label="Verified ID Number" value={selectedRecord.kyc_id_number} highlight />
                  <DetailItem label="Aadhaar No" value={selectedRecord.aadhaar_no} />
                  <DetailItem label="Voter ID" value={selectedRecord.voter_id} />
                  <DetailItem label="PAN" value={selectedRecord.pan} />
                  <DetailItem label="Ration Card No" value={selectedRecord.ration_card_no} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>Bank Details</h4>
                <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <DetailItem label="Account No" value={selectedRecord.bank_account_no} />
                  <DetailItem label="Branch Name" value={selectedRecord.branch_name} />
                  <DetailItem label="IFSC" value={selectedRecord.ifsc} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>Family & Schemes</h4>
                <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <DetailItem label="Family Members > 18" value={selectedRecord.family_above_18} />
                  <DetailItem label="Family Members < 18" value={selectedRecord.family_below_18} />
                  <DetailItem label="Schemes Applied" value={selectedRecord.schemes_applied} fullWidth />
                  <DetailItem label="Schemes Included" value={selectedRecord.schemes_included} fullWidth />
                  <DetailItem label="Help Done Prior" value={selectedRecord.help_done} fullWidth />
                </div>
              </div>
              
            </div>
            <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', background: 'var(--gray-50)' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function DetailItem({ label, value, highlight, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto', background: highlight ? 'var(--orange-50)' : 'transparent', padding: highlight ? '8px 12px' : 0, borderRadius: highlight ? 8 : 0 }}>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: value ? 'var(--gray-900)' : 'var(--gray-400)', fontWeight: 500, wordBreak: 'break-word' }}>{value || 'Not provided'}</div>
    </div>
  );
}
