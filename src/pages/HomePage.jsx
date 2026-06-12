import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Smartphone, CheckCircle2, Megaphone, Calendar } from 'lucide-react';
import { apiFetch } from '../config/api';

import heroImg from '../assets/KK3_3210.jpg';
import img1 from '../assets/WhatsApp Image 2026-05-31 at 4.40.31 PM (1).jpeg';
import img2 from '../assets/WhatsApp Image 2026-05-31 at 4.40.31 PM (2).jpeg';
import img3 from '../assets/WhatsApp Image 2026-05-31 at 4.40.32 PM.jpeg';
import m1 from '../assets/0L0A7232.jpg';
import m2 from '../assets/0L0A7318.JPG';
import m3 from '../assets/0L0A7398.jpg';
import m4 from '../assets/DSC_4562.jpg';
import m5 from '../assets/IMG-20260409-WA0117.jpg';
import m6 from '../assets/IMG_20260506_192807_420.webp';
import m7 from '../assets/JSV_3298.jpg';
import m8 from '../assets/JSV_3654.jpg';
import m9 from '../assets/KK3_3210.jpg';
import m10 from '../assets/Picsart_26-05-27_21-42-43-492.jpg';

const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const YoutubeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

const SectionImage = ({ img, reverse }) => (
  <div className="section-img-container" style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, var(--orange-50), var(--orange-100))', borderRadius: '30px', transform: reverse ? 'rotate(1deg)' : 'rotate(-1deg)', boxShadow: '0 20px 40px rgba(234, 88, 12, 0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
    <img src={img} alt="Highlight" style={{ width: '100%', height: 'auto', maxHeight: '450px', objectFit: 'contain', borderRadius: '20px' }} />
  </div>
);

const Section = ({ title, items, images, reversed }) => (
  <section style={{ padding: '60px 20px', backgroundColor: reversed ? '#fafafa' : '#ffffff' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ color: 'var(--primary)', fontFamily: 'cursive', fontSize: '24px', marginBottom: '8px' }}>About</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h2>
        <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--primary)', margin: '16px auto 0' }}></div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px', flexDirection: reversed ? 'row-reverse' : 'row' }}>

        <div style={{ flex: '1 1 400px' }}>
          <SectionImage img={images} reverse={reversed} />
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {items.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <ShieldCheck size={14} />
                </div>
                <span style={{ fontSize: '17px', color: 'var(--gray-700)', lineHeight: 1.6, fontWeight: 500 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiFetch('/announcements.php');
        if (Array.isArray(data)) {
          setAnnouncements(data.filter(a => a.published));
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Using a unique image for each section
  const sectionImages = [img1, img2, img3];

  // Images for the marquee
  const marqueeImages = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Navigation (Glassmorphism) */}
      <nav style={{ padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100, color: 'var(--gray-900)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 2, border: '2px solid var(--orange-500)', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)', flexShrink: 0 }}>
            <img src="/logo2.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <span style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, letterSpacing: '0.5px', background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>Ranganadibeta</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/signup" style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ea580c', background: 'transparent', textDecoration: 'none', padding: '8px 20px', borderRadius: '30px', border: '2px solid #ea580c', whiteSpace: 'nowrap' }}>Sign Up</Link>
          <Link to="/login" style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'white', background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)', textDecoration: 'none', padding: '8px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)', whiteSpace: 'nowrap' }}>Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '600px',
        background: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Orange Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'url("/pattern.svg") center/cover', opacity: 0.1, zIndex: 1 }}></div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: '1200px', margin: '0 auto', alignItems: 'center', padding: '0 20px' }}>

          <div style={{ flex: '1 1 500px', color: 'white', padding: '40px 0' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '30px', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.4)' }}>
              Official Digital Platform
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              Connecting with <br /> the people & <span style={{ color: '#fffaf0' }}>amplifying</span> <br /> your voice
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', maxWidth: '500px', lineHeight: 1.6 }}>
              Join thousands of citizens taking part in local governance, sharing feedback, and shaping the future of our constituency directly with the leadership.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary pulse-btn" style={{ backgroundColor: '#111827', color: 'white', padding: '18px 40px', fontSize: '18px', borderRadius: '40px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                Join the Movement <ArrowRight size={20} />
              </Link>
              <Link to="/migrated-survey" className="btn" style={{ backgroundColor: 'white', color: '#ea580c', padding: '18px 40px', fontSize: '18px', borderRadius: '40px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: '2px solid white', display: 'inline-flex', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                Migrated Survey
              </Link>
            </div>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', alignSelf: 'stretch' }}>
            {/* Leader Cutout Image Placeholder */}
            <img className="float-animation" src={heroImg} alt="Leader" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))', alignSelf: 'center', borderBottom: 'none' }} />
          </div>

        </div>
      </section>

      {/* Marquee Gallery Section */}
      <section style={{ padding: '40px 0', background: 'var(--orange-50)', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--orange-700)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Moments on the Ground</h3>
        </div>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="marquee-container" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Double the array for seamless infinite looping */}
            {[...marqueeImages, ...marqueeImages].map((src, index) => (
              <div key={index} style={{ display: 'inline-block', height: '280px', margin: '0 15px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', flexShrink: 0, backgroundColor: 'transparent' }}>
                <img src={src} alt={`Gallery ${index}`} style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block', borderRadius: '24px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section style={{ padding: '60px 20px', background: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ padding: '12px', background: 'var(--orange-100)', borderRadius: '16px', color: 'var(--orange-600)' }}>
              <Megaphone size={28} />
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Latest Announcements</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loadingAnnouncements ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', background: '#fafafa', borderRadius: '20px', border: '1px dashed var(--gray-300)' }}>
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', background: '#fafafa', borderRadius: '20px', border: '1px dashed var(--gray-300)' }}>
                No new announcements at the moment. Please check back later.
              </div>
            ) : (
              announcements.map(a => {
                const tc = {
                  announcement: { bg: 'var(--orange-100)', color: 'var(--orange-700)' },
                  news: { bg: '#e0f2fe', color: '#1d4ed8' },
                  event: { bg: '#d1fae5', color: '#047857' },
                  notice: { bg: '#fef3c7', color: '#92400e' }
                }[a.type || 'announcement'] || { bg: 'var(--orange-100)', color: 'var(--orange-700)' };

                return (
                  <div key={a.id} style={{
                    border: '1px solid var(--orange-100)',
                    borderLeft: '4px solid #ea580c',
                    borderRadius: '12px', padding: '20px',
                    background: '#fffaf0',
                  }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: tc.bg, color: tc.color, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        {a.type || 'Announcement'}
                      </span>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        {a.priority || 'Medium'} priority
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', marginTop: 0 }}>{a.title}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, marginBottom: '8px', marginTop: 0 }}>{a.content}</p>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <span>📅 Published: {a.publishedAt || new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <Section
        title="Connecting with the Grassroots"
        reversed={false}
        images={sectionImages[0]}
        items={[
          "Dedicated to building direct and transparent communication channels with every citizen.",
          "Actively listening to the voices of the local people to understand their real daily challenges.",
          "Organizing regular community programs and town halls to stay grounded and connected.",
          "Ensuring that no citizen's concern goes unheard or unaddressed by the administration.",
          "Believing that true governance begins by standing side-by-side with the community."
        ]}
      />

      {/* Education Section */}
      <Section
        title="Amplifying Local Voices"
        reversed={true}
        images={sectionImages[1]}
        items={[
          "Using the Ranganadibeta platform to capture localized feedback directly from the public.",
          "Empowering citizens to voice their opinions on ongoing schemes and local development.",
          "Creating a two-way street where administrative decisions are shaped by public sentiment.",
          "Championing the rights of marginalized communities by bringing their issues to the forefront."
        ]}
      />

      {/* Work Done Section */}
      <Section
        title="Impact Through Listening"
        reversed={false}
        images={sectionImages[2]}
        items={[
          "Resolved thousands of local grievances by prioritizing direct citizen feedback.",
          "Tailored government schemes to match the specific, on-the-ground needs of different areas.",
          "Ensured that the benefits of public welfare programs reach the most deserving citizens."
        ]}
      />

      {/* App Coming Soon Banner */}
      <section style={{ padding: '60px 20px', background: 'var(--orange-50)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', borderRadius: '30px', padding: '50px', color: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', boxShadow: '0 20px 40px rgba(234, 88, 12, 0.2)', position: 'relative', overflow: 'hidden' }}>
          {/* Background pattern */}
          <div style={{ position: 'absolute', inset: 0, background: 'url("/pattern.svg") center/cover', opacity: 0.1, zIndex: 0 }}></div>

          <div style={{ flex: '1 1 400px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '30px', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.4)' }}>
              <Smartphone size={16} /> Ranganadibeta App
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
              The Official Ranganadibeta App. <br /> Launching Soon!
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', margin: '0', lineHeight: 1.6, maxWidth: '450px' }}>
              We are building the dedicated Ranganadibeta mobile application to make connecting with your leadership even easier. Track your grievances, participate in surveys, and stay updated directly from your phone.
            </p>
          </div>

          <div style={{ flex: '1 1 250px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            {/* Abstract Phone UI Graphic */}
            <div className="float-animation" style={{ width: '220px', height: '440px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '4px solid rgba(255,255,255,0.5)', borderRadius: '40px', padding: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              {/* Phone Screen */}
              <div style={{ flex: 1, background: '#ffffff', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Phone Notch */}
                <div style={{ position: 'absolute', top: 0, width: '80px', height: '25px', background: 'rgba(0,0,0,0.8)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}></div>

                {/* Logo / Splash Screen */}
                <img src="/logo2.jpeg" alt="Ranganadibeta Logo" style={{ width: '150px', height: 'auto', objectFit: 'contain', marginBottom: '16px' }} />
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)' }}>Ranganadibeta</div>
                <div style={{ fontSize: '12px', color: 'var(--orange-500)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Social Feeds */}
      <footer style={{ backgroundColor: '#fffaf0', color: 'var(--gray-900)', padding: '80px 20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Stay Connected</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Follow our official channels for real-time updates, community highlights, and more.</p>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

          {/* X (formerly Twitter) */}
          <div className="float-animation" style={{ animationDelay: '0s', position: 'relative', overflow: 'hidden', height: '220px', borderRadius: '24px', background: 'linear-gradient(135deg, #000000 0%, #222222 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', fontSize: '150px', opacity: 0.05, transform: 'rotate(15deg)' }}>
              <XIcon />
            </div>
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(10px)', marginBottom: '16px' }}>
                <XIcon />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>X</h3>
              <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.9)', color: '#000000', borderRadius: '20px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                Coming Soon
              </div>
            </div>
          </div>

          {/* Facebook */}
          <div className="float-animation" style={{ animationDelay: '0.2s', position: 'relative', overflow: 'hidden', height: '220px', borderRadius: '24px', background: 'linear-gradient(135deg, #1877F2 0%, #0d65d9 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 15px 35px rgba(24, 119, 242, 0.3)' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', fontSize: '150px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
              <FacebookIcon />
            </div>
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(10px)', marginBottom: '16px' }}>
                <FacebookIcon />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>Facebook</h3>
              <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.9)', color: '#1877F2', borderRadius: '20px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                Coming Soon
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="float-animation" style={{ animationDelay: '0.4s', position: 'relative', overflow: 'hidden', height: '220px', borderRadius: '24px', background: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 15px 35px rgba(255, 0, 0, 0.3)' }}>
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', fontSize: '150px', opacity: 0.1, transform: 'rotate(15deg)' }}>
              <YoutubeIcon />
            </div>
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(10px)', marginBottom: '16px' }}>
                <YoutubeIcon />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>YouTube</h3>
              <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.9)', color: '#FF0000', borderRadius: '20px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                Coming Soon
              </div>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>
          © {new Date().getFullYear()} Ranganadibeta. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
