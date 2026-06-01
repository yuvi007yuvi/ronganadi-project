import { Phone, MapPin, Mail, Globe, ExternalLink } from 'lucide-react';

const contacts = [
  {
    name: 'Rajiv Borah',
    role: 'District Coordinator',
    department: 'Office of the District Commissioner',
    phone: '9435000001',
    email: 'coordinator@ronganadi.gov.in',
    address: 'District Commissioner Office, Lakhimpur, Assam – 787001',
    availability: 'Mon–Fri, 10 AM – 5 PM',
  },
  {
    name: 'Survey Control Room',
    role: 'Help Desk',
    department: 'Ronganadi Survey Operations',
    phone: '9435000002',
    email: 'helpdesk@ronganadi.gov.in',
    address: 'Block Development Office, Ronganadi, Assam',
    availability: 'Mon–Sat, 9 AM – 6 PM',
  },
  {
    name: 'Dr. Pranjal Gogoi',
    role: 'Technical Support',
    department: 'IT & Data Management Cell',
    phone: '9435000003',
    email: 'tech@ronganadi.gov.in',
    address: 'District Information Center, Lakhimpur',
    availability: 'Mon–Fri, 9 AM – 5 PM',
  },
  {
    name: 'Women & Child Welfare Officer',
    role: 'Scheme Beneficiary Support',
    department: 'Social Welfare Department',
    phone: '9435000004',
    email: 'welfare@ronganadi.gov.in',
    address: 'Social Welfare Office, Lakhimpur',
    availability: 'Mon–Fri, 10 AM – 4 PM',
  },
  {
    name: 'Panchayat Coordinator',
    role: 'Gram Panchayat Liaison',
    department: 'Panchayati Raj Department',
    phone: '9435000005',
    email: 'panchayat@ronganadi.gov.in',
    address: 'Block Office, Ghilamara, Lakhimpur',
    availability: 'Mon–Sat, 9 AM – 5 PM',
  },
  {
    name: 'Emergency Helpline',
    role: 'Citizen Grievance',
    department: 'District Administration',
    phone: '1800-000-1234',
    email: 'grievance@ronganadi.gov.in',
    address: 'District Grievance Cell, Lakhimpur',
    availability: '24/7 Available',
    isEmergency: true,
  },
];

export default function Communication() {
  return (
    <div className="animate-fadeIn">
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--orange-800))',
        borderRadius: 'var(--border-radius-xl)',
        padding: '28px 32px',
        color: 'white',
        marginBottom: 28,
        boxShadow: 'var(--shadow-orange)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>📞 Contact Directory</h2>
        <p style={{ opacity: 0.9, fontSize: 14, maxWidth: 600 }}>
          One-click calling to all key office representatives. Contact the right person for survey support, scheme queries, and administrative assistance.
        </p>
      </div>

      {/* Emergency Banner */}
      <div style={{
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger)',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 24 }}>🚨</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 14 }}>Citizen Grievance Helpline</div>
          <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>24/7 toll-free: 1800-000-1234 | For urgent survey issues or scheme grievances</div>
        </div>
        <a href="tel:18000001234" className="call-btn" style={{ background: 'var(--danger)' }}>
          <Phone size={14} /> Call Now
        </a>
      </div>

      {/* Contacts Grid */}
      <div className="grid-cols-2" style={{ gap: 20 }}>
        {contacts.filter(c => !c.isEmergency).map((contact) => (
          <div key={contact.name} className="contact-card">
            <div className="contact-avatar">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="contact-name">{contact.name}</div>
              <div className="contact-role">{contact.role}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{contact.department}</div>

              <div className="contact-info" style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MapPin size={12} color="var(--gray-400)" />
                  <span>{contact.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Mail size={12} color="var(--gray-400)" />
                  <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary)' }}>{contact.email}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={12} color="var(--gray-400)" />
                  <span style={{ color: 'var(--gray-500)', fontSize: 12 }}>{contact.availability}</span>
                </div>
              </div>

              <a href={`tel:${contact.phone.replace(/-/g, '')}`} className="call-btn" id={`call-${contact.phone}`}>
                <Phone size={14} /> {contact.phone}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-header">
          <div className="card-title">📍 Office Location</div>
          <a
            href="https://maps.google.com/?q=Lakhimpur+Assam"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <ExternalLink size={13} /> Open in Maps
          </a>
        </div>
        <div style={{
          height: 240,
          background: 'linear-gradient(135deg, var(--orange-50), var(--orange-100))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>🗺️</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: 15 }}>District Commissioner Office</div>
            <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>Lakhimpur, Assam – 787001</div>
            <a
              href="https://maps.google.com/?q=Lakhimpur,Assam"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12, display: 'inline-flex' }}
            >
              <MapPin size={13} /> Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
