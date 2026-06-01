export default function StatCard({ label, value, sub, icon: Icon, color, iconBg }) {
  return (
    <div className="stat-card" style={{ '--card-accent': color }}>
      <div className="stat-card-info">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
      <div className="stat-card-icon" style={{ background: iconBg || 'var(--orange-50)' }}>
        {Icon && <Icon size={22} color={color || 'var(--primary)'} strokeWidth={2} />}
      </div>
    </div>
  );
}
