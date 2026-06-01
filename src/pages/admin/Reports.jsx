import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { allSchemes } from '../../data/schemes.js';
import { Download, FileSpreadsheet, FileText as FilePdf, BarChart3, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const { citizens, getStats } = useData();
  const [filterArea, setFilterArea] = useState('');
  const [generating, setGenerating] = useState('');

  const areas = [...new Set(citizens.map(c => c.area))].sort();

  const filtered = citizens.filter(c => {
    const matchArea = !filterArea || c.area === filterArea;
    return matchArea;
  });

  const getSchemeName = (id) => allSchemes.find(s => s.id === id)?.name || id;

  const prepareRows = (data) => data.map((c, i) => ({
    'Sr.': i + 1,
    'Full Name': c.fullName,
    'Mobile': c.mobile,
    'Address': c.address,
    'Area': c.area,
    'Voter ID': c.voterIdNumber,
    'PAN': c.panNumber,
    'Caste': c.casteCategory,
    'Occupation': c.occupation,
    'Schemes Availed': c.schemesAvailed?.length || 0,
    'Date Submitted': new Date(c.submitted_at || c.submittedAt).toLocaleDateString('en-IN'),
  }));

  const exportExcel = async () => {
    setGenerating('excel');
    await new Promise(r => setTimeout(r, 400));
    const rows = prepareRows(filtered);
    const ws = XLSX.utils.json_to_sheet(rows);
    const cols = Object.keys(rows[0] || {});
    ws['!cols'] = cols.map(k => ({ wch: Math.max(k.length, 15) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Records');

    const areaWise = {};
    filtered.forEach(c => { areaWise[c.area] = (areaWise[c.area] || 0) + 1; });
    const summaryRows = Object.entries(areaWise).map(([area, count]) => ({ 'Area': area, 'Survey Count': count }));
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Area Summary');

    XLSX.writeFile(wb, `Ranganadibeta_Survey_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setGenerating('');
  };

  const exportPDF = async () => {
    setGenerating('pdf');
    await new Promise(r => setTimeout(r, 400));
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ranganadibeta – Citizen Survey Report', 14, 13);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${filtered.length}`, 220, 13);

    if (filterArea) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Filters: Area: ${filterArea}`, 14, 26);
    }

    autoTable(doc, {
      startY: filterArea ? 30 : 24,
      head: [['#', 'Full Name', 'Mobile', 'Area', 'Caste', 'Occupation', 'Schemes Availed', 'Date']],
      body: filtered.map((c, i) => [
        i + 1,
        c.fullName,
        c.mobile,
        c.area,
        c.casteCategory?.split(' ')[0],
        c.occupation,
        c.schemesAvailed?.length || 0,
        new Date(c.submitted_at || c.submittedAt).toLocaleDateString('en-IN'),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 247, 237] },
      margin: { left: 14, right: 14 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} | Ranganadibeta Survey Platform`, 14, 205);
    }

    doc.save(`Ranganadibeta_Survey_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setGenerating('');
  };

  const exportAreaSummaryPDF = async () => {
    setGenerating('area');
    await new Promise(r => setTimeout(r, 400));
    const doc = new jsPDF();

    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Area-wise Survey Summary – Ranganadibeta', 14, 13);

    const areaWise = {};
    filtered.forEach(c => { areaWise[c.area] = (areaWise[c.area] || 0) + 1; });

    autoTable(doc, {
      startY: 28,
      head: [['Area / Ward / Village', 'Survey Count', 'Percentage']],
      body: Object.entries(areaWise).map(([area, count]) => [
        area, count, `${((count / filtered.length) * 100).toFixed(1)}%`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      foot: [['Total', filtered.length, '100%']],
      footStyles: { fillColor: [255, 237, 213], fontStyle: 'bold' },
    });

    doc.save(`Ranganadibeta_Area_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
    setGenerating('');
  };

  return (
    <div className="animate-fadeIn">
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: filtered.length, color: 'var(--primary)' },
          { label: 'Scheme Beneficiaries', value: filtered.filter(c => c.schemesAvailed?.length > 0).length, color: '#10b981' },
          { label: 'Pending Coverage', value: filtered.filter(c => c.schemesNotAvailed?.length > 0).length, color: '#f59e0b' },
          { label: 'Areas Covered', value: [...new Set(filtered.map(c => c.area))].length, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--card-accent': s.color }}>
            <div className="stat-card-info">
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Survey Records {filterArea && ' (filtered)'}</div>
          <BarChart3 size={16} color="var(--gray-400)" />
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Filter by Area</label>
              <select className="filter-select w-full" value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ width: '100%', padding: '10px 14px' }}>
                <option value="">All Areas</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {filterArea && (
              <div style={{ alignSelf: 'flex-end', paddingBottom: 6 }}>
                <button className="btn btn-ghost" onClick={() => { setFilterArea(''); }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--orange-50)', borderRadius: 'var(--border-radius)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--orange-700)', border: '1px solid var(--orange-100)' }}>
            📊 <strong>{filtered.length}</strong> records selected for export
          </div>

          <div className="grid-cols-3" style={{ gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: 24, border: '2px dashed var(--gray-200)', boxShadow: 'none' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Excel Export</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.5 }}>
                All citizen records with area summary sheet. Compatible with MS Excel & Google Sheets.
              </p>
              <button className="btn btn-success w-full" onClick={exportExcel} disabled={!!generating} style={{ justifyContent: 'center' }}>
                {generating === 'excel' ? '⏳ Generating...' : <><FileSpreadsheet size={15} /> Download Excel</>}
              </button>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 24, border: '2px dashed var(--gray-200)', boxShadow: 'none' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>PDF Report</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.5 }}>
                Printable A4 PDF with all records in table format. Includes header and page numbers.
              </p>
              <button className="btn btn-danger w-full" onClick={exportPDF} disabled={!!generating} style={{ justifyContent: 'center' }}>
                {generating === 'pdf' ? '⏳ Generating...' : <><Download size={15} /> Download PDF</>}
              </button>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 24, border: '2px dashed var(--gray-200)', boxShadow: 'none' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Area Summary PDF</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.5 }}>
                Compact area-wise survey count report with percentages. Great for presentations.
              </p>
              <button className="btn btn-primary w-full" onClick={exportAreaSummaryPDF} disabled={!!generating} style={{ justifyContent: 'center' }}>
                {generating === 'area' ? '⏳ Generating...' : <><BarChart3 size={15} /> Area Summary</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
