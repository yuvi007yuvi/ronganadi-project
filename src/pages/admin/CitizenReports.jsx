import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../config/api';
import { Upload, Download, Plus, FileSpreadsheet, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const COLUMNS = [
  { header: 'Timestamp', key: 'timestamp' },
  { header: 'Name', key: 'name' },
  { header: 'Father\'s Name / Husband Name', key: 'father_husband_name' },
  { header: 'Guardian Name', key: 'guardian_name' },
  { header: 'Village Name / Address', key: 'village_address' },
  { header: 'Caste', key: 'caste' },
  { header: 'Religion', key: 'religion' },
  { header: 'Family Members Above 18 years', key: 'family_above_18' },
  { header: 'Family Members below 18 years', key: 'family_below_18' },
  { header: 'Booth no & Name', key: 'booth_no_name' },
  { header: 'Panchayat', key: 'panchayat' },
  { header: 'Police Station', key: 'police_station' },
  { header: 'District', key: 'district' },
  { header: 'PIN Code', key: 'pin_code' },
  { header: 'Aadhaar No.', key: 'aadhaar_no' },
  { header: 'Voter ID', key: 'voter_id' },
  { header: 'PAN', key: 'pan' },
  { header: 'Ration Card No', key: 'ration_card_no' },
  { header: 'Disability/UID (if differently abled)', key: 'disability_uid' },
  { header: 'Bank Account no', key: 'bank_account_no' },
  { header: 'Branch Name', key: 'branch_name' },
  { header: 'IFSC', key: 'ifsc' },
  { header: 'Mobile No', key: 'mobile_no' },
  { header: 'Alternate No', key: 'alternate_no' },
  { header: 'Schemes applied for', key: 'schemes_applied' },
  { header: 'Schemes already included', key: 'schemes_included' },
  { header: 'Help done prior to becoming an MLA', key: 'help_done' }
];

export default function CitizenReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/citizen_reports.php');
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showNotification('Failed to fetch records. Make sure the database is initialized.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [COLUMNS.map(c => c.header)], { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Citizen_Reports_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        if (jsonData.length === 0) {
          showNotification('The uploaded file is empty.', 'error');
          setUploading(false);
          return;
        }

        // Map Excel headers back to DB keys
        const mappedData = jsonData.map(row => {
          let mappedRow = {};
          COLUMNS.forEach(col => {
            mappedRow[col.key] = row[col.header] || '';
          });
          return mappedRow;
        });

        await apiFetch('/citizen_reports.php', {
          method: 'POST',
          body: { bulk: true, records: mappedData }
        });

        showNotification(`Successfully uploaded ${mappedData.length} records!`);
        fetchReports();
      } catch (error) {
        console.error('Upload failed:', error);
        showNotification('Failed to upload records. Please check the file format.', 'error');
      }
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/citizen_reports.php', {
        method: 'POST',
        body: formData
      });
      showNotification('Record added successfully!');
      setShowModal(false);
      setFormData({});
      fetchReports();
    } catch (error) {
      console.error('Submission failed:', error);
      showNotification('Failed to add record.', 'error');
    }
  };

  const filteredReports = reports.filter(r => 
    (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.aadhaar_no && r.aadhaar_no.includes(searchTerm)) ||
    (r.mobile_no && r.mobile_no.includes(searchTerm))
  );

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-fadeIn">
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: notification.type === 'error' ? '#fef2f2' : '#ecfdf5', color: notification.type === 'error' ? '#b91c1c' : '#047857', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${notification.type === 'error' ? '#f87171' : '#34d399'}` }}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span style={{ fontWeight: 600 }}>{notification.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileSpreadsheet size={32} color="var(--primary)" />
            Citizen Reports
          </h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage and upload bulk citizen records.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" onClick={handleDownloadTemplate} style={{ background: 'white', color: 'var(--gray-700)', border: '1px solid var(--gray-300)' }}>
            <Download size={18} />
            Download Template
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Bulk Upload Data'}
          </button>
          
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Single Record
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="search-bar" style={{ width: '300px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, aadhaar, mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>
            {filteredReports.length} records found
          </div>
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading records...</div>
          ) : (
            <>
              <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Sr. No.</th>
                    {COLUMNS.map(col => (
                      <th key={col.key}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>{indexOfFirstItem + idx + 1}</td>
                        {COLUMNS.map(col => (
                          <td key={col.key}>{row[col.key] || '-'}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-500)' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>Rows per page:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-300)', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={5000}>5000</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 500 }}>Page {currentPage} of {totalPages || 1}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-300)', background: currentPage === 1 ? 'var(--gray-100)' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)' }}
                    >Previous</button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-300)', background: currentPage === totalPages || totalPages === 0 ? 'var(--gray-100)' : 'white', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: currentPage === totalPages || totalPages === 0 ? 'var(--gray-400)' : 'var(--gray-700)' }}
                    >Next</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Add Single Record</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {COLUMNS.map(col => (
                  <div key={col.key} className="form-group">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4, display: 'block' }}>
                      {col.header}
                    </label>
                    <input
                      type={col.key.includes('date') || col.key === 'timestamp' ? 'datetime-local' : 'text'}
                      name={col.key}
                      value={formData[col.key] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-300)', width: '100%' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'white', border: '1px solid var(--gray-300)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
