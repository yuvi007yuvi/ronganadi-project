import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../config/api';
import { User, Mail, Shield, MapPin, Phone, Edit2, Save, X, Eye, EyeOff, Camera, Upload } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profile_photo || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  if (!currentUser) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo exceeds maximum size of 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('ronganadi_token');
      const response = await fetch(`${getApiBaseUrl()}/upload_image.php?folder=profiles`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProfilePhoto(data.data.url);
      } else {
        setError(data.message || 'Failed to upload photo.');
      }
    } catch (err) {
      setError('Network error uploading photo.');
    }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const updates = { 
      name: name.trim(), 
      phone: phone.trim(),
      profile_photo: profilePhoto 
    };
    
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      updates.password = password;
    }

    const res = await updateProfile(updates);
    setLoading(false);
    
    if (res.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || 'Failed to update profile.');
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Revert unsaved changes
      setName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setProfilePhoto(currentUser?.profile_photo || null);
    }
    setIsEditing(!isEditing);
    setPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Profile</h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>View and edit your account details</p>
        </div>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={toggleEdit}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={toggleEdit}>
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      {success && (
        <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 8, marginBottom: 24, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✓ {success}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div className="bento-grid" style={{ gridTemplateColumns: window.innerWidth > 768 ? '1fr 2fr' : '1fr', gap: 24 }}>
        {/* Left Column: User Card */}
        <div className="card bento-item" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, var(--orange-50), white)', borderRadius: 'var(--border-radius-xl)' }}>
            
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: profilePhoto ? `url(${profilePhoto}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--orange-700))',
                color: 'white', fontSize: 42, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-lg)', border: '4px solid white'
              }}>
                {!profilePhoto && (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
              </div>
              
              {isEditing && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      border: '3px solid white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-md)', transition: 'var(--transition)'
                    }}
                    title="Change Photo"
                  >
                    {uploadingPhoto ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Camera size={16} />}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                </>
              )}
            </div>
            
            <h2 style={{ margin: 0, fontSize: 22, color: 'var(--gray-900)', textAlign: 'center' }}>{name || currentUser.name}</h2>
            <div className="pill pill-orange" style={{ marginTop: 12, padding: '6px 16px', fontSize: 13 }}>
              {currentUser.role}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Edit */}
        <div className="card bento-item">
          <div className="card-header" style={{ padding: '24px 32px' }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Personal Information</h3>
          </div>
          <div className="card-body" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Email Address</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{currentUser.email}</div>
                  {isEditing && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Email cannot be changed.</div>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Full Name</div>
                  {isEditing ? (
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px 16px', fontSize: 15 }} />
                  ) : (
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{currentUser.name}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Phone Number</div>
                  {isEditing ? (
                    <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '12px 16px', fontSize: 15 }} />
                  ) : (
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{currentUser.phone || 'Not provided'}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, animation: 'fadeIn 0.2s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Change Password</div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="form-control" 
                        placeholder="Leave blank to keep current password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        style={{ padding: '12px 16px', paddingRight: 44, fontSize: 15 }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', display: 'flex' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentUser.assignedArea && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Assigned Area</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{currentUser.assignedArea}</div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, borderTop: '1px solid var(--gray-100)', paddingTop: 24, animation: 'fadeIn 0.2s' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading || uploadingPhoto} style={{ padding: '12px 24px' }}>
                    {loading ? 'Saving Changes...' : <><Save size={18} /> Save All Changes</>}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
