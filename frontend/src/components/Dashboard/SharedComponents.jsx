// components/Dashboard/SharedComponents.jsx

export const StatCard = ({ title, value, icon, color, onClick, highlight }) => (
  <div 
    className={`stat-card ${onClick ? 'clickable' : ''} ${highlight ? 'highlight' : ''}`}
    onClick={onClick}
    style={{ borderLeftColor: color }}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

export const ActionCard = ({ title, description, icon, onClick, badge }) => (
  <div className="action-card" onClick={onClick}>
    {badge && <div className="action-badge">{badge}</div>}
    <div className="action-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);